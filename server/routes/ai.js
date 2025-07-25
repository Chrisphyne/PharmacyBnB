const express = require('express');
const router = express.Router();
const GeminiService = require('../services/geminiService');
const authMiddleware = require('../middleware/auth');

// Initialize Gemini service
const geminiService = new GeminiService();

// Test AI connection
router.get('/test', authMiddleware, async (req, res) => {
  try {
    const result = await geminiService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test AI connection',
      details: error.message
    });
  }
});

// General AI chat endpoint
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { query, conversationHistory = [] } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }

    // Build context from user and pharmacy data
    const context = {
      userRole: req.user.role,
      pharmacyData: {
        name: req.user.pharmacyName || 'PharmaCare',
        location: req.user.pharmacyLocation,
        id: req.user.pharmacyId
      },
      conversationHistory
    };

    const result = await geminiService.generateResponse(query, context);
    
    res.json({
      success: result.success,
      response: result.response,
      error: result.error,
      usage: result.usage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process AI request',
      details: error.message
    });
  }
});

// Inventory analysis endpoint
router.post('/analyze-inventory', authMiddleware, async (req, res) => {
  try {
    const { inventoryData } = req.body;
    
    if (!inventoryData) {
      return res.status(400).json({
        success: false,
        error: 'Inventory data is required'
      });
    }

    // Check if user has inventory access
    if (!req.user.permissions.includes('inventory:read') && !req.user.permissions.includes('*')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions for inventory analysis'
      });
    }

    const result = await geminiService.analyzeInventory(inventoryData);
    
    res.json({
      success: result.success,
      analysis: result.response,
      error: result.error,
      usage: result.usage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Inventory analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze inventory',
      details: error.message
    });
  }
});

// Drug information endpoint
router.post('/drug-info', authMiddleware, async (req, res) => {
  try {
    const { drugName, query } = req.body;
    
    if (!drugName || !query) {
      return res.status(400).json({
        success: false,
        error: 'Drug name and query are required'
      });
    }

    // Check if user has product access
    if (!req.user.permissions.includes('products:read') && !req.user.permissions.includes('*')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions for drug information'
      });
    }

    const result = await geminiService.provideDrugInformation(drugName, query);
    
    res.json({
      success: result.success,
      drugInfo: result.response,
      error: result.error,
      usage: result.usage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Drug info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get drug information',
      details: error.message
    });
  }
});

// Sales analysis endpoint
router.post('/analyze-sales', authMiddleware, async (req, res) => {
  try {
    const { salesData, timeframe = 'monthly' } = req.body;
    
    if (!salesData) {
      return res.status(400).json({
        success: false,
        error: 'Sales data is required'
      });
    }

    // Check if user has sales access
    if (!req.user.permissions.includes('sales:read') && !req.user.permissions.includes('*')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions for sales analysis'
      });
    }

    const result = await geminiService.generateSalesReport(salesData, timeframe);
    
    res.json({
      success: result.success,
      analysis: result.response,
      error: result.error,
      usage: result.usage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sales analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze sales data',
      details: error.message
    });
  }
});

// Workflow optimization endpoint
router.post('/optimize-workflow', authMiddleware, async (req, res) => {
  try {
    const { currentWorkflow, challenges } = req.body;
    
    if (!currentWorkflow || !challenges) {
      return res.status(400).json({
        success: false,
        error: 'Current workflow and challenges are required'
      });
    }

    // Check if user has management access
    const hasAccess = req.user.permissions.includes('*') || 
                     req.user.role === 'pharmacy_owner' || 
                     req.user.role === 'pharmacy_manager';
                     
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions for workflow optimization'
      });
    }

    const result = await geminiService.suggestWorkflowOptimization(currentWorkflow, challenges);
    
    res.json({
      success: result.success,
      recommendations: result.response,
      error: result.error,
      usage: result.usage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Workflow optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize workflow',
      details: error.message
    });
  }
});

// Get AI assistant capabilities based on user role
router.get('/capabilities', authMiddleware, async (req, res) => {
  try {
    const capabilities = {
      general_chat: true,
      drug_information: req.user.permissions.includes('products:read') || req.user.permissions.includes('*'),
      inventory_analysis: req.user.permissions.includes('inventory:read') || req.user.permissions.includes('*'),
      sales_analysis: req.user.permissions.includes('sales:read') || req.user.permissions.includes('*'),
      workflow_optimization: req.user.permissions.includes('*') || 
                            req.user.role === 'pharmacy_owner' || 
                            req.user.role === 'pharmacy_manager',
      voice_interaction: true,
      prescription_guidance: req.user.role === 'pharmacist' || req.user.role === 'pharmacy_owner',
      regulatory_compliance: req.user.role === 'pharmacist' || 
                            req.user.role === 'pharmacy_manager' || 
                            req.user.role === 'pharmacy_owner'
    };

    res.json({
      success: true,
      capabilities,
      userRole: req.user.role,
      pharmacyData: {
        name: req.user.pharmacyName || 'PharmaCare',
        location: req.user.pharmacyLocation
      }
    });
  } catch (error) {
    console.error('Capabilities error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI capabilities',
      details: error.message
    });
  }
});

// AI usage statistics (for admins)
router.get('/usage-stats', authMiddleware, async (req, res) => {
  try {
    // Check admin permissions
    if (!req.user.permissions.includes('*') && req.user.role !== 'pharmacy_owner') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view usage statistics'
      });
    }

    // This would typically come from a database
    // For now, return mock data
    const stats = {
      totalQueries: 1247,
      queriesThisMonth: 234,
      mostActiveUsers: [
        { name: 'Dr. Sarah Johnson', queries: 45, role: 'pharmacist' },
        { name: 'Mike Wilson', queries: 32, role: 'pharmacy_technician' },
        { name: 'Admin User', queries: 28, role: 'pharmacy_owner' }
      ],
      popularCategories: [
        { category: 'Drug Information', count: 156, percentage: 35 },
        { category: 'Inventory Analysis', count: 89, percentage: 20 },
        { category: 'Sales Insights', count: 78, percentage: 18 },
        { category: 'General Chat', count: 67, percentage: 15 },
        { category: 'Workflow Optimization', count: 53, percentage: 12 }
      ],
      averageResponseTime: '1.2s',
      userSatisfaction: 4.6
    };

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Usage stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get usage statistics',
      details: error.message
    });
  }
});

module.exports = router;