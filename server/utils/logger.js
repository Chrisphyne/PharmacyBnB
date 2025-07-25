const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'kenyan-pharmacy-system' },
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Write all logs with level 'info' and below to 'combined.log'
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Write audit logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'audit.log'),
      level: 'info',
      maxsize: 10485760, // 10MB
      maxFiles: 10
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logsDir, 'exceptions.log') })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logsDir, 'rejections.log') })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Add custom methods for specific pharmacy operations
logger.auditLog = (action, userId, data = {}) => {
  logger.info('AUDIT', {
    action,
    userId,
    data,
    timestamp: new Date().toISOString(),
    type: 'audit'
  });
};

logger.securityLog = (event, details = {}) => {
  logger.warn('SECURITY', {
    event,
    details,
    timestamp: new Date().toISOString(),
    type: 'security'
  });
};

logger.inventoryLog = (action, productId, quantity, userId) => {
  logger.info('INVENTORY', {
    action,
    productId,
    quantity,
    userId,
    timestamp: new Date().toISOString(),
    type: 'inventory'
  });
};

logger.salesLog = (saleId, amount, paymentMethod, userId) => {
  logger.info('SALES', {
    saleId,
    amount,
    paymentMethod,
    userId,
    timestamp: new Date().toISOString(),
    type: 'sales'
  });
};

module.exports = logger;