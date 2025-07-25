const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'No token provided or invalid format' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        isActive: true 
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'User not found or inactive' 
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Add user to request object
    req.user = user;
    
    // Log the authentication
    logger.auditLog('AUTH_SUCCESS', user.id, { 
      endpoint: req.path,
      method: req.method,
      ip: req.ip 
    });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.securityLog('INVALID_TOKEN', { 
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'Token expired' 
      });
    }

    logger.error('Authentication middleware error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication failed' 
    });
  }
};

// Role-based access control middleware
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'User not authenticated' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.securityLog('UNAUTHORIZED_ACCESS', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        endpoint: req.path,
        ip: req.ip
      });
      
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Permission-based access control
const requirePermission = (permission) => {
  const rolePermissions = {
    ADMIN: ['*'], // Admin has all permissions
    PHARMACIST: [
      'inventory:read', 'inventory:write', 'inventory:delete',
      'products:read', 'products:write', 'products:delete',
      'sales:read', 'sales:write',
      'orders:read', 'orders:write',
      'suppliers:read', 'suppliers:write',
      'reports:read',
      'knowledge:read', 'knowledge:write'
    ],
    PHARMACY_TECHNICIAN: [
      'inventory:read', 'inventory:write',
      'products:read', 'products:write',
      'sales:read', 'sales:write',
      'orders:read',
      'knowledge:read'
    ],
    CASHIER: [
      'inventory:read',
      'products:read',
      'sales:read', 'sales:write'
    ],
    INVENTORY_MANAGER: [
      'inventory:read', 'inventory:write', 'inventory:delete',
      'products:read', 'products:write', 'products:delete',
      'orders:read', 'orders:write', 'orders:delete',
      'suppliers:read', 'suppliers:write',
      'reports:read'
    ]
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Access denied',
        message: 'User not authenticated' 
      });
    }

    const userPermissions = rolePermissions[req.user.role] || [];
    
    // Check if user has all permissions or specific permission
    const hasPermission = userPermissions.includes('*') || 
                         userPermissions.includes(permission);

    if (!hasPermission) {
      logger.securityLog('PERMISSION_DENIED', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredPermission: permission,
        endpoint: req.path,
        ip: req.ip
      });
      
      return res.status(403).json({ 
        error: 'Access denied',
        message: `Permission '${permission}' required` 
      });
    }

    next();
  };
};

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user context
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        isActive: true 
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth, just continue without user context
    next();
  }
};

module.exports = {
  authMiddleware,
  requireRole,
  requirePermission,
  optionalAuth
};