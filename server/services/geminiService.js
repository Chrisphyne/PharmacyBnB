const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    
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
      
      const result = await this.model.generateContent(enhancedPrompt);
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
      return {
        success: false,
        error: error.message,
        response: 'I apologize, but I encountered an error processing your request. Please try again or contact support if the issue persists.'
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

    // Add conversation history for context
    if (conversationHistory.length > 0) {
      prompt += '\n\n**Recent Conversation:**';
      conversationHistory.slice(-3).forEach((msg, index) => {
        prompt += `\n${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`;
      });
    }

    // Add the current query
    prompt += `\n\n**Current Question**: ${query}`;
    prompt += '\n\nPlease provide a helpful, accurate, and professional response:';

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
5. Storage and organization tips

Format your response in a clear, actionable manner.
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
- Kenyan regulatory status (if applicable)

**Important**: Always recommend consulting with a licensed pharmacist for patient-specific advice.
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
4. Customer behavior insights
5. Recommendations for improvement
6. Seasonal trends (if applicable)

Present the analysis in a professional business report format suitable for pharmacy management.
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
4. Customer service enhancements
5. Compliance considerations
6. Implementation timeline

Focus on practical, cost-effective solutions for a Kenyan pharmacy setting.
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
      const result = await this.model.generateContent('Hello, test connection for pharmacy AI assistant.');
      return {
        success: true,
        message: 'Gemini API connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = GeminiService;