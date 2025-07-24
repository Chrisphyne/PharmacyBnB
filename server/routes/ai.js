const express = require('express');
const aiService = require('../services/aiService');
const { authMiddleware, requirePermission } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/ai/query
// @desc    Process AI text query
// @access  Private
router.post('/query', authMiddleware, async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Query is required and must be a non-empty string'
      });
    }

    // Process the query through AI service
    const response = await aiService.processVoiceQuery(query, req.user.id);

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    logger.error('AI query error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI query',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/voice
// @desc    Process voice query (audio to text to AI response)
// @access  Private
router.post('/voice', authMiddleware, async (req, res) => {
  try {
    const { audioData, query } = req.body;

    // Accept either audio data or text query
    const inputQuery = query || audioData;

    if (!inputQuery) {
      return res.status(400).json({
        success: false,
        message: 'Either audio data or text query is required'
      });
    }

    // Process through AI service
    const response = await aiService.processVoiceQuery(inputQuery, req.user.id);

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    logger.error('Voice query error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process voice query',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/ai/knowledge-base/add
// @desc    Add content to knowledge base
// @access  Private (requires knowledge:write permission)
router.post('/knowledge-base/add', 
  authMiddleware, 
  requirePermission('knowledge:write'), 
  async (req, res) => {
    try {
      const { title, content, category, tags = [] } = req.body;

      if (!title || !content || !category) {
        return res.status(400).json({
          success: false,
          message: 'Title, content, and category are required'
        });
      }

      const knowledgeItem = await aiService.addToKnowledgeBase(
        title,
        content,
        category,
        tags
      );

      res.status(201).json({
        success: true,
        message: 'Knowledge base item added successfully',
        data: knowledgeItem
      });

    } catch (error) {
      logger.error('Knowledge base add error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add to knowledge base',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   GET /api/ai/suggestions
// @desc    Get AI-powered suggestions based on context
// @access  Private
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const { context } = req.query;

    // Default suggestions for pharmacy operations
    const suggestions = [
      "Check stock levels for Paracetamol",
      "What are the WHO guidelines for antibiotics?",
      "Show me products expiring this month",
      "How many Amoxicillin 250mg do we have?",
      "What's the current inventory status?",
      "Generate sales report for today",
      "Check for low stock items",
      "What are the drug interactions for Aspirin?"
    ];

    // TODO: Implement context-aware suggestions based on user's current activity
    // This could analyze recent user actions, current page, etc.

    res.json({
      success: true,
      data: {
        suggestions: suggestions.slice(0, 6), // Return top 6 suggestions
        context: context || 'general'
      }
    });

  } catch (error) {
    logger.error('AI suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI suggestions'
    });
  }
});

// @route   POST /api/ai/chat
// @desc    Interactive chat with AI assistant
// @access  Private
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Process through AI service
    const response = await aiService.processVoiceQuery(message, req.user.id);

    // TODO: Implement conversation history tracking if conversationId is provided

    res.json({
      success: true,
      data: {
        response: response.text,
        conversationId: conversationId || `chat_${Date.now()}`,
        timestamp: new Date().toISOString(),
        metadata: {
          intent: response.intent,
          hasData: !!response.data
        }
      }
    });

  } catch (error) {
    logger.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat message'
    });
  }
});

// @route   GET /api/ai/status
// @desc    Get AI service status and capabilities
// @access  Private
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const status = {
      aiService: aiService.isInitialized ? 'operational' : 'initializing',
      capabilities: {
        voiceQueries: true,
        textQueries: true,
        knowledgeBase: true,
        inventoryQueries: true,
        productSearch: true,
        stockAlerts: true
      },
      supportedLanguages: ['English'],
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    logger.error('AI status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI status'
    });
  }
});

module.exports = router;