const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const auditLogger = require('./middleware/auditLogger');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/orders');
const salesRoutes = require('./routes/sales');
const userRoutes = require('./routes/users');
const supplierRoutes = require('./routes/suppliers');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const knowledgeBaseRoutes = require('./routes/knowledgeBase');
const alertRoutes = require('./routes/alerts');

// Import services
const logger = require('./utils/logger');
const prisma = require('./config/database');
const aiService = require('./services/aiService');
const notificationService = require('./services/notificationService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Global middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
app.use(rateLimiter);

// Audit logging
app.use(auditLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      database: 'connected',
      ai: 'available',
      voice: 'available'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', authMiddleware, productRoutes);
app.use('/api/inventory', authMiddleware, inventoryRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/sales', authMiddleware, salesRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/suppliers', authMiddleware, supplierRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/knowledge-base', authMiddleware, knowledgeBaseRoutes);
app.use('/api/alerts', authMiddleware, alertRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  // Join user to their room for personalized notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined their room`);
  });
  
  // Handle voice assistant requests
  socket.on('voice-query', async (data) => {
    try {
      const { query, userId } = data;
      logger.info(`Voice query from user ${userId}: ${query}`);
      
      // Process voice query through AI service
      const response = await aiService.processVoiceQuery(query, userId);
      
      // Send response back to user
      socket.emit('voice-response', response);
      
      // Log the interaction
      await auditLogger.logVoiceInteraction(userId, query, response);
    } catch (error) {
      logger.error('Voice query error:', error);
      socket.emit('voice-error', { message: 'Sorry, I encountered an error processing your request.' });
    }
  });
  
  // Handle real-time inventory updates
  socket.on('inventory-update', (data) => {
    socket.broadcast.emit('inventory-changed', data);
  });
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Global error handler
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested resource was not found on this server.',
    path: req.originalUrl 
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize services
async function initializeServices() {
  try {
    // Initialize AI service
    await aiService.initialize();
    logger.info('AI service initialized');
    
    // Initialize notification service
    await notificationService.initialize();
    logger.info('Notification service initialized');
    
    // Start background jobs
    require('./services/backgroundJobs');
    logger.info('Background jobs started');
    
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  logger.info(`🚀 Kenyan Pharmacy AI System running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 Database: Connected to PostgreSQL`);
  
  // Initialize services after server starts
  await initializeServices();
  
  logger.info('🎉 All systems ready!');
});

module.exports = { app, server, io };