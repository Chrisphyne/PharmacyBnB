const { OpenAI } = require('openai');
const { ChromaClient } = require('chromadb');
const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { PromptTemplate } = require('@langchain/core/prompts');
const logger = require('../utils/logger');
const prisma = require('../config/database');
const axios = require('axios');

class AIService {
  constructor() {
    this.openai = null;
    this.chromaClient = null;
    this.chatModel = null;
    this.collection = null;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialize OpenAI
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Initialize LangChain ChatOpenAI
      this.chatModel = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-4',
        temperature: 0.3,
      });

      // Initialize ChromaDB
      this.chromaClient = new ChromaClient({
        path: `http://${process.env.CHROMA_HOST || 'localhost'}:${process.env.CHROMA_PORT || 8000}`
      });

      // Get or create knowledge base collection
      try {
        this.collection = await this.chromaClient.getCollection({
          name: 'pharmacy_knowledge_base'
        });
      } catch (error) {
        this.collection = await this.chromaClient.createCollection({
          name: 'pharmacy_knowledge_base',
          metadata: { description: 'Kenyan Pharmacy Knowledge Base' }
        });
      }

      this.isInitialized = true;
      logger.info('AI Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI Service:', error);
      throw error;
    }
  }

  async processVoiceQuery(query, userId) {
    if (!this.isInitialized) {
      throw new Error('AI Service not initialized');
    }

    try {
      // 1. Transcribe if audio input (placeholder for future implementation)
      const transcribedQuery = await this.transcribeAudio(query);
      
      // 2. Classify query intent
      const intent = await this.classifyIntent(transcribedQuery);
      
      // 3. Process based on intent
      let response;
      switch (intent.type) {
        case 'INVENTORY_CHECK':
          response = await this.handleInventoryQuery(transcribedQuery, intent.entities);
          break;
        case 'PRODUCT_SEARCH':
          response = await this.handleProductSearch(transcribedQuery, intent.entities);
          break;
        case 'KNOWLEDGE_QUERY':
          response = await this.handleKnowledgeQuery(transcribedQuery);
          break;
        case 'SALES_TRANSACTION':
          response = await this.handleSalesTransaction(transcribedQuery, intent.entities);
          break;
        case 'STOCK_ALERT':
          response = await this.handleStockAlert(transcribedQuery);
          break;
        default:
          response = await this.handleGeneralQuery(transcribedQuery);
      }

      // 4. Generate voice response
      const audioResponse = await this.generateVoiceResponse(response.text);
      
      return {
        text: response.text,
        audio: audioResponse,
        data: response.data,
        intent: intent.type,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error processing voice query:', error);
      throw error;
    }
  }

  async classifyIntent(query) {
    const prompt = `
    You are an AI assistant for a Kenyan pharmacy management system. Analyze the following query and classify it into one of these intents:

    INVENTORY_CHECK - checking stock levels, availability
    PRODUCT_SEARCH - finding specific products, medications
    KNOWLEDGE_QUERY - medical information, drug interactions, WHO guidelines
    SALES_TRANSACTION - processing sales, customer transactions
    STOCK_ALERT - low stock warnings, expiry alerts
    GENERAL - other queries

    Also extract relevant entities like product names, quantities, dates.

    Query: "${query}"

    Respond in JSON format:
    {
      "type": "INTENT_TYPE",
      "confidence": 0.95,
      "entities": {
        "product": "product name if mentioned",
        "quantity": "number if mentioned",
        "date": "date if mentioned"
      }
    }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Error classifying intent:', error);
      return { type: 'GENERAL', confidence: 0.5, entities: {} };
    }
  }

  async handleInventoryQuery(query, entities) {
    try {
      const productName = entities.product;
      
      if (!productName) {
        return {
          text: "Which product would you like me to check the stock for?",
          data: null
        };
      }

      // Search for products
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: productName, mode: 'insensitive' } },
            { genericName: { contains: productName, mode: 'insensitive' } },
            { brand: { contains: productName, mode: 'insensitive' } }
          ],
          isActive: true
        },
        include: {
          stock: true,
          category: true
        }
      });

      if (products.length === 0) {
        return {
          text: `I couldn't find any products matching "${productName}". Please check the spelling or try a different name.`,
          data: null
        };
      }

      // Calculate total stock
      const totalStock = products.reduce((sum, product) => {
        return sum + product.stock.reduce((stockSum, stock) => stockSum + stock.availableQuantity, 0);
      }, 0);

      let responseText;
      if (products.length === 1) {
        const product = products[0];
        const stockLevel = product.stock.reduce((sum, stock) => sum + stock.availableQuantity, 0);
        
        if (stockLevel === 0) {
          responseText = `${product.name} is currently out of stock.`;
        } else if (stockLevel <= product.minStockLevel) {
          responseText = `${product.name} has ${stockLevel} units in stock, which is below the minimum level of ${product.minStockLevel}. You should consider reordering.`;
        } else {
          responseText = `${product.name} has ${stockLevel} units available in stock.`;
        }
      } else {
        responseText = `Found ${products.length} products matching "${productName}" with a total of ${totalStock} units in stock.`;
      }

      return {
        text: responseText,
        data: {
          products: products,
          totalStock: totalStock
        }
      };

    } catch (error) {
      logger.error('Error handling inventory query:', error);
      return {
        text: "I encountered an error while checking the inventory. Please try again.",
        data: null
      };
    }
  }

  async handleProductSearch(query, entities) {
    try {
      const searchTerm = entities.product || query.split(' ').slice(-2).join(' ');
      
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { genericName: { contains: searchTerm, mode: 'insensitive' } },
            { brand: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ],
          isActive: true
        },
        include: {
          stock: true,
          category: true,
          supplier: true
        },
        take: 10
      });

      if (products.length === 0) {
        return {
          text: `No products found matching "${searchTerm}". Would you like me to search for something else?`,
          data: null
        };
      }

      const responseText = `Found ${products.length} product${products.length > 1 ? 's' : ''} matching "${searchTerm}". 
        ${products.slice(0, 3).map(p => 
          `${p.name} (${p.dosageForm}) - KSH ${p.sellingPrice}`
        ).join(', ')}${products.length > 3 ? ' and more...' : ''}`;

      return {
        text: responseText,
        data: { products }
      };

    } catch (error) {
      logger.error('Error handling product search:', error);
      return {
        text: "I encountered an error while searching for products. Please try again.",
        data: null
      };
    }
  }

  async handleKnowledgeQuery(query) {
    try {
      // Search in knowledge base using vector similarity
      const queryEmbedding = await this.generateEmbedding(query);
      
      const searchResults = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: 3,
        include: ['documents', 'metadatas', 'distances']
      });

      let contextText = '';
      if (searchResults.documents && searchResults.documents[0].length > 0) {
        contextText = searchResults.documents[0].join('\n\n');
      }

      // Generate response using LangChain
      const prompt = `
      You are a knowledgeable pharmacy assistant in Kenya. Answer the following question based on the provided context and your knowledge of pharmaceutical practices in Kenya.

      Context from knowledge base:
      ${contextText}

      Question: ${query}

      Please provide a helpful, accurate response. If the question involves drug interactions or serious medical advice, remind the user to consult with a qualified pharmacist or doctor.
      `;

      const messages = [
        new SystemMessage("You are a helpful pharmacy assistant with knowledge of Kenyan pharmaceutical practices."),
        new HumanMessage(prompt)
      ];

      const response = await this.chatModel.invoke(messages);

      return {
        text: response.content,
        data: {
          sources: searchResults.metadatas ? searchResults.metadatas[0] : []
        }
      };

    } catch (error) {
      logger.error('Error handling knowledge query:', error);
      return {
        text: "I'm unable to access the knowledge base right now. Please consult with a qualified pharmacist for medical advice.",
        data: null
      };
    }
  }

  async handleSalesTransaction(query, entities) {
    // This would integrate with the POS system
    return {
      text: "Sales transaction processing is available through the main interface. Please use the sales module to complete transactions.",
      data: null
    };
  }

  async handleStockAlert(query) {
    try {
      // Get low stock items
      const lowStockProducts = await prisma.product.findMany({
        where: {
          isActive: true,
          stock: {
            some: {
              availableQuantity: {
                lte: prisma.raw('products.min_stock_level')
              }
            }
          }
        },
        include: {
          stock: true
        },
        take: 10
      });

      // Get expiring products (next 30 days)
      const expiringProducts = await prisma.stock.findMany({
        where: {
          expiryDate: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date()
          },
          isActive: true
        },
        include: {
          product: true
        },
        take: 10
      });

      let responseText = '';
      if (lowStockProducts.length > 0) {
        responseText += `${lowStockProducts.length} products are running low on stock. `;
      }
      if (expiringProducts.length > 0) {
        responseText += `${expiringProducts.length} products are expiring within the next 30 days.`;
      }
      
      if (lowStockProducts.length === 0 && expiringProducts.length === 0) {
        responseText = 'All products are adequately stocked and no items are expiring soon.';
      }

      return {
        text: responseText,
        data: {
          lowStock: lowStockProducts,
          expiring: expiringProducts
        }
      };

    } catch (error) {
      logger.error('Error handling stock alert:', error);
      return {
        text: "I encountered an error while checking stock alerts. Please try again.",
        data: null
      };
    }
  }

  async handleGeneralQuery(query) {
    try {
      const systemPrompt = `
      You are a helpful AI assistant for a Kenyan pharmacy management system. 
      You can help with:
      - Inventory management queries
      - Product information
      - Basic pharmaceutical knowledge
      - System navigation help
      
      Always be professional and remind users to consult qualified healthcare professionals for medical advice.
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      return {
        text: response.choices[0].message.content,
        data: null
      };

    } catch (error) {
      logger.error('Error handling general query:', error);
      return {
        text: "I'm here to help with your pharmacy management needs. What would you like to know?",
        data: null
      };
    }
  }

  async transcribeAudio(audioData) {
    // If audioData is already text, return it
    if (typeof audioData === 'string') {
      return audioData;
    }

    // TODO: Implement Whisper API integration for audio transcription
    // For now, return placeholder
    return "Audio transcription not yet implemented";
  }

  async generateVoiceResponse(text) {
    try {
      if (!process.env.ELEVENLABS_API_KEY) {
        return null; // No voice generation if API key not provided
      }

      // TODO: Implement ElevenLabs API integration
      // For now, return placeholder
      return {
        audioUrl: null,
        message: "Voice generation not yet implemented"
      };

    } catch (error) {
      logger.error('Error generating voice response:', error);
      return null;
    }
  }

  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('Error generating embedding:', error);
      throw error;
    }
  }

  async addToKnowledgeBase(title, content, category, tags = []) {
    try {
      // Generate embedding
      const embedding = await this.generateEmbedding(content);
      
      // Add to ChromaDB
      const vectorId = `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.collection.add({
        ids: [vectorId],
        embeddings: [embedding],
        documents: [content],
        metadatas: [{
          title,
          category,
          tags: tags.join(','),
          createdAt: new Date().toISOString()
        }]
      });

      // Save to database
      const knowledgeItem = await prisma.knowledgeBase.create({
        data: {
          title,
          content,
          category,
          tags,
          vectorId
        }
      });

      logger.info(`Added knowledge base item: ${title}`);
      return knowledgeItem;

    } catch (error) {
      logger.error('Error adding to knowledge base:', error);
      throw error;
    }
  }
}

module.exports = new AIService();