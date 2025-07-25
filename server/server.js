const app = require('./app');
const GeminiService = require('./services/geminiService');

// Set default port
const PORT = process.env.PORT || 5000;

// Initialize services
const initializeServices = async () => {
  try {
    console.log('🔧 Initializing services...');
    
    // Test Gemini AI connection
    const geminiService = new GeminiService();
    const geminiTest = await geminiService.testConnection();
    
    if (geminiTest.success) {
      console.log('✅ Gemini AI service connected successfully');
    } else {
      console.warn('⚠️  Gemini AI service connection failed:', geminiTest.error);
    }
    
    // Validate required environment variables
    const requiredEnvVars = [
      'GEMINI_API_KEY',
      'CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('⚠️  Missing environment variables:', missingVars.join(', '));
      console.warn('   Some features may not work properly');
    } else {
      console.log('✅ All required environment variables are set');
    }
    
  } catch (error) {
    console.error('❌ Service initialization failed:', error.message);
  }
};

// Start server
const startServer = async () => {
  try {
    // Initialize services first
    await initializeServices();
    
    // Start the HTTP server
    const server = app.listen(PORT, () => {
      console.log(`
🚀 PharmaCare AI Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server: http://localhost:${PORT}
🌐 Environment: ${process.env.NODE_ENV || 'development'}
🤖 AI: Google Gemini Pro
🔐 Auth: Clerk
💊 Status: Ready for pharmacy operations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
      
      // Log available endpoints
      console.log('📋 Available API endpoints:');
      console.log('   • GET  /health - Health check');
      console.log('   • GET  /api/ai/test - Test AI connection');
      console.log('   • POST /api/ai/chat - AI conversation');
      console.log('   • POST /api/ai/analyze-inventory - Inventory analysis');
      console.log('   • POST /api/ai/drug-info - Drug information');
      console.log('   • POST /api/ai/analyze-sales - Sales analysis');
      console.log('   • GET  /api/ai/capabilities - User capabilities');
      console.log('');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ ${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ ${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n📤 Received ${signal}. Starting graceful shutdown...`);
      
      server.close((err) => {
        console.log('🔚 HTTP server closed');
        
        if (err) {
          console.error('❌ Error during server shutdown:', err);
          process.exit(1);
        }
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('⏰ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    return server;
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };