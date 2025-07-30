const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    // Use gemini-1.5-flash for free tier (faster and free)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Pharmacy-specific context for better responses
    this.pharmacyContext = `
You are an AI assistant for a modern pharmacy management system called PharmaCare. 
You help pharmacists, pharmacy technicians, and other staff with:

1. **Inventory Management**: Stock levels, reordering, expiry tracking
2. **Product Information**: Drug interactions, dosages, contraindications
3. **Sales Analytics**: Revenue trends, popular products, customer insights
4. **Regulatory Compliance**: Kenya pharmacy regulations, proper storage
5. **Customer Service**: Prescription guidance, medication counseling
6. **Business Operations**: Workflow optimization, staff management

**Important Guidelines:**
- Always prioritize patient safety and accurate medical information
- Recommend consulting a licensed pharmacist for clinical decisions
- Follow Kenya Pharmacy and Poisons Board regulations
- Provide practical, actionable advice for pharmacy operations
- Be concise but thorough in responses
- Use professional medical terminology when appropriate

**Context**: You're operating in Kenya, so consider local regulations, currency (KSh), and healthcare practices.
`;
  }

  async generateResponse(query, context = {}) {
    try {
      const {
        userRole = 'pharmacist',
        pharmacyData = {},
        conversationHistory = []
      } = context;

      // Build enhanced prompt with context
      const enhancedPrompt = this.buildPrompt(query, userRole, pharmacyData, conversationHistory);
      
      // Use generateContent with safety settings for free tier
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024, // Reduced for free tier
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      });

      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        response: text,
        usage: {
          promptTokens: this.estimateTokens(enhancedPrompt),
          completionTokens: this.estimateTokens(text)
        }
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      
      // Handle specific API errors
      let errorMessage = 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.';
      
      if (error.message?.includes('quota')) {
        errorMessage = 'I\'m currently experiencing high demand. Please try again in a few moments.';
      } else if (error.message?.includes('safety')) {
        errorMessage = 'I cannot provide information on this topic due to safety guidelines. Please rephrase your question.';
      }
      
      return {
        success: false,
        error: error.message,
        response: errorMessage
      };
    }
  }

  buildPrompt(query, userRole, pharmacyData, conversationHistory) {
    let prompt = this.pharmacyContext;

    // Add user role context
    prompt += `\n**Current User Role**: ${this.getRoleDescription(userRole)}`;

    // Add pharmacy context if available
    if (pharmacyData.name) {
      prompt += `\n**Pharmacy**: ${pharmacyData.name}`;
      if (pharmacyData.location) prompt += ` - ${pharmacyData.location}`;
    }

    // Add conversation history for context (limit to last 2 for free tier)
    if (conversationHistory.length > 0) {
      prompt += '\n\n**Recent Conversation:**';
      conversationHistory.slice(-2).forEach((msg, index) => {
        prompt += `\n${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`;
      });
    }

    // Add the current query
    prompt += `\n\n**Current Question**: ${query}`;
    prompt += '\n\nPlease provide a helpful, accurate, and professional response in 200 words or less:';

    return prompt;
  }

  getRoleDescription(role) {
    const roleDescriptions = {
      'super_admin': 'System Administrator with full access',
      'pharmacy_owner': 'Pharmacy Owner with business management focus',
      'pharmacy_manager': 'Pharmacy Manager overseeing operations',
      'pharmacist': 'Licensed Pharmacist with clinical expertise',
      'pharmacy_technician': 'Pharmacy Technician assisting with operations',
      'cashier': 'Cashier handling sales and customer service',
      'inventory_manager': 'Inventory Manager focused on stock management'
    };
    return roleDescriptions[role] || 'Pharmacy Staff Member';
  }

  // Specialized methods for different query types
  async analyzeInventory(inventoryData) {
    const prompt = `
${this.pharmacyContext}

**Task**: Analyze the following pharmacy inventory data and provide insights:

${JSON.stringify(inventoryData, null, 2)}

Please provide:
1. Stock level analysis (low stock, overstocked items)
2. Expiry date warnings and recommendations
3. Reorder suggestions with quantities
4. Cost optimization opportunities

Keep response under 300 words and format clearly.
`;

    return this.generateResponse(prompt);
  }

  async provideDrugInformation(drugName, query) {
    const prompt = `
${this.pharmacyContext}

**Task**: Provide professional drug information for: ${drugName}

**Specific Question**: ${query}

Please include relevant information about:
- Indications and contraindications
- Dosage and administration
- Side effects and warnings
- Drug interactions
- Storage requirements

**Important**: Always recommend consulting with a licensed pharmacist for patient-specific advice.

Keep response under 250 words.
`;

    return this.generateResponse(prompt);
  }

  async generateSalesReport(salesData, timeframe) {
    const prompt = `
${this.pharmacyContext}

**Task**: Analyze sales data and generate insights for ${timeframe}:

${JSON.stringify(salesData, null, 2)}

Please provide:
1. Sales performance summary
2. Top-performing products
3. Revenue trends and patterns
4. Recommendations for improvement

Present analysis in under 300 words suitable for pharmacy management.
`;

    return this.generateResponse(prompt);
  }

  async suggestWorkflowOptimization(currentWorkflow, challenges) {
    const prompt = `
${this.pharmacyContext}

**Task**: Optimize pharmacy workflow based on current practices and challenges:

**Current Workflow**: ${currentWorkflow}
**Challenges**: ${challenges}

Please provide:
1. Workflow improvement recommendations
2. Technology integration suggestions
3. Staff efficiency tips
4. Implementation timeline

Focus on practical, cost-effective solutions for a Kenyan pharmacy setting.
Keep response under 300 words.
`;

    return this.generateResponse(prompt);
  }

  // Helper method to estimate tokens (approximate)
  estimateTokens(text) {
    return Math.ceil(text.length / 4); // Rough estimate: 1 token ≈ 4 characters
  }

  // Method to validate API key and connection
  async testConnection() {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hello, test connection for pharmacy AI assistant. Respond with "Connected successfully"' }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 50,
        },
      });
      
      const response = await result.response;
      const text = response.text();
      
      return {
        success: true,
        message: 'Gemini AI connection successful',
        response: text
      };
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = GeminiService;
