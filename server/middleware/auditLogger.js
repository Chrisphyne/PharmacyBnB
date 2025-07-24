const prisma = require('../config/database');
const logger = require('../utils/logger');

const auditLogger = async (req, res, next) => {
  // Skip audit logging for certain routes
  const skipPaths = [
    '/health',
    '/api/auth/verify',
    '/uploads',
    '/favicon.ico'
  ];

  const skipMethods = ['GET']; // Skip GET requests for performance, only log data modifications
  
  if (skipPaths.some(path => req.path.startsWith(path)) || 
      skipMethods.includes(req.method)) {
    return next();
  }

  // Store original response methods
  const originalSend = res.send;
  const originalJson = res.json;

  let responseBody = null;
  let statusCode = null;

  // Capture response data
  res.send = function(data) {
    responseBody = data;
    statusCode = res.statusCode;
    originalSend.call(this, data);
  };

  res.json = function(data) {
    responseBody = data;
    statusCode = res.statusCode;
    originalJson.call(this, data);
  };

  // Capture request timestamp
  const startTime = Date.now();

  // Wait for response to complete
  res.on('finish', async () => {
    try {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Determine action based on method and path
      const action = determineAction(req.method, req.path);
      
      // Extract table name from path
      const tableName = extractTableName(req.path);
      
      // Get record ID if available
      const recordId = extractRecordId(req, responseBody);

      // Prepare audit data
      const auditData = {
        action,
        tableName: tableName || 'unknown',
        recordId: recordId || 'unknown',
        oldValues: req.method === 'PUT' || req.method === 'PATCH' ? req.body.oldValues : null,
        newValues: getNewValues(req, responseBody),
        ipAddress: getClientIP(req),
        userAgent: req.get('User-Agent') || 'unknown',
        userId: req.user?.id || null,
        metadata: {
          method: req.method,
          path: req.path,
          statusCode,
          duration,
          timestamp: new Date().toISOString(),
          queryParams: req.query,
          bodySize: JSON.stringify(req.body || {}).length,
          responseSize: JSON.stringify(responseBody || {}).length
        }
      };

      // Log to application logger
      logger.auditLog(action, req.user?.id, auditData);

      // Save to database if user is authenticated and action is significant
      if (req.user && shouldSaveToDatabase(action, statusCode)) {
        await saveAuditLog(auditData);
      }

    } catch (error) {
      logger.error('Audit logging failed:', error);
      // Don't let audit logging failures break the request
    }
  });

  next();
};

// Determine action based on HTTP method and path
function determineAction(method, path) {
  const pathLower = path.toLowerCase();
  
  // Authentication actions
  if (pathLower.includes('/auth/login')) return 'LOGIN';
  if (pathLower.includes('/auth/logout')) return 'LOGOUT';
  if (pathLower.includes('/auth/register')) return 'REGISTER';
  
  // Inventory actions
  if (pathLower.includes('/inventory')) {
    if (method === 'POST') return 'INVENTORY_ADD';
    if (method === 'PUT' || method === 'PATCH') return 'INVENTORY_UPDATE';
    if (method === 'DELETE') return 'INVENTORY_DELETE';
  }
  
  // Product actions
  if (pathLower.includes('/products')) {
    if (method === 'POST') return 'PRODUCT_CREATE';
    if (method === 'PUT' || method === 'PATCH') return 'PRODUCT_UPDATE';
    if (method === 'DELETE') return 'PRODUCT_DELETE';
  }
  
  // Sales actions
  if (pathLower.includes('/sales')) {
    if (method === 'POST') return 'SALE_CREATE';
    if (method === 'PUT' || method === 'PATCH') return 'SALE_UPDATE';
    if (method === 'DELETE') return 'SALE_DELETE';
  }
  
  // Order actions
  if (pathLower.includes('/orders')) {
    if (method === 'POST') return 'ORDER_CREATE';
    if (method === 'PUT' || method === 'PATCH') return 'ORDER_UPDATE';
    if (method === 'DELETE') return 'ORDER_DELETE';
  }
  
  // User management actions
  if (pathLower.includes('/users')) {
    if (method === 'POST') return 'USER_CREATE';
    if (method === 'PUT' || method === 'PATCH') return 'USER_UPDATE';
    if (method === 'DELETE') return 'USER_DELETE';
  }
  
  // AI interactions
  if (pathLower.includes('/ai') || pathLower.includes('/voice')) {
    return 'AI_QUERY';
  }
  
  // Generic actions
  switch (method) {
    case 'POST': return 'CREATE';
    case 'PUT':
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return 'UNKNOWN';
  }
}

// Extract table name from API path
function extractTableName(path) {
  const pathSegments = path.split('/').filter(segment => segment);
  
  // Look for API segment and get the next one
  const apiIndex = pathSegments.findIndex(segment => segment === 'api');
  if (apiIndex !== -1 && pathSegments[apiIndex + 1]) {
    return pathSegments[apiIndex + 1];
  }
  
  return null;
}

// Extract record ID from request or response
function extractRecordId(req, responseBody) {
  // Try to get ID from URL parameters
  if (req.params && req.params.id) {
    return req.params.id;
  }
  
  // Try to get ID from response body
  if (responseBody && typeof responseBody === 'object') {
    const parsed = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
    if (parsed.data && parsed.data.id) {
      return parsed.data.id;
    }
    if (parsed.id) {
      return parsed.id;
    }
  }
  
  return null;
}

// Get new values from request or response
function getNewValues(req, responseBody) {
  // For POST/PUT/PATCH requests, the new values are in the request body
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    return req.body;
  }
  
  // For other requests, try to get from response
  if (responseBody && typeof responseBody === 'object') {
    const parsed = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
    if (parsed.data) {
      return parsed.data;
    }
  }
  
  return null;
}

// Get client IP address
function getClientIP(req) {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.connection?.socket?.remoteAddress ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         'unknown';
}

// Determine if audit log should be saved to database
function shouldSaveToDatabase(action, statusCode) {
  // Save successful operations that modify data
  const significantActions = [
    'LOGIN', 'LOGOUT', 'REGISTER',
    'INVENTORY_ADD', 'INVENTORY_UPDATE', 'INVENTORY_DELETE',
    'PRODUCT_CREATE', 'PRODUCT_UPDATE', 'PRODUCT_DELETE',
    'SALE_CREATE', 'SALE_UPDATE', 'SALE_DELETE',
    'ORDER_CREATE', 'ORDER_UPDATE', 'ORDER_DELETE',
    'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
    'AI_QUERY'
  ];
  
  return significantActions.includes(action) && statusCode >= 200 && statusCode < 300;
}

// Save audit log to database
async function saveAuditLog(auditData) {
  try {
    await prisma.auditLog.create({
      data: {
        action: auditData.action,
        tableName: auditData.tableName,
        recordId: auditData.recordId,
        oldValues: auditData.oldValues,
        newValues: auditData.newValues,
        ipAddress: auditData.ipAddress,
        userAgent: auditData.userAgent,
        userId: auditData.userId
      }
    });
  } catch (error) {
    logger.error('Failed to save audit log to database:', error);
  }
}

// Add method to log voice interactions specifically
auditLogger.logVoiceInteraction = async (userId, query, response) => {
  try {
    const auditData = {
      action: 'VOICE_INTERACTION',
      tableName: 'ai_interactions',
      recordId: `voice_${Date.now()}`,
      oldValues: null,
      newValues: {
        query,
        response: response.text,
        intent: response.intent
      },
      ipAddress: 'system',
      userAgent: 'voice_assistant',
      userId
    };

    await saveAuditLog(auditData);
    logger.auditLog('VOICE_INTERACTION', userId, auditData);
  } catch (error) {
    logger.error('Failed to log voice interaction:', error);
  }
};

module.exports = auditLogger;