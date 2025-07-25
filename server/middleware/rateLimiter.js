const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const logger = require('../utils/logger');

// Create different rate limiters for different endpoints
const createRateLimiter = (options) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Math.ceil(options.windowMs / 1000)
    },
    handler: (req, res) => {
      logger.securityLog('RATE_LIMIT_EXCEEDED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl,
        userId: req.user?.id
      });
      
      res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil(options.windowMs / 1000)
        },
        timestamp: new Date().toISOString()
      });
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/health';
    }
  };

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

// General API rate limiter
const generalLimiter = createRateLimiter({
  max: 1000, // Limit each IP to 1000 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the general rate limit. Please try again later.'
  }
});

// Authentication rate limiter (more strict)
const authLimiter = createRateLimiter({
  max: 5, // Limit each IP to 5 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many failed login attempts. Please try again in 15 minutes.'
  },
  skipSuccessfulRequests: true
});

// API endpoints rate limiter
const apiLimiter = createRateLimiter({
  max: 500, // Limit each IP to 500 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: {
    error: 'Too many API requests',
    message: 'You have exceeded the API rate limit. Please try again later.'
  }
});

// AI/Voice query rate limiter (more strict due to processing cost)
const aiLimiter = createRateLimiter({
  max: 50, // Limit each IP to 50 AI requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: {
    error: 'Too many AI requests',
    message: 'You have exceeded the AI service rate limit. Please try again later.'
  }
});

// File upload rate limiter
const uploadLimiter = createRateLimiter({
  max: 20, // Limit each IP to 20 uploads per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: {
    error: 'Too many upload requests',
    message: 'You have exceeded the file upload rate limit. Please try again later.'
  }
});

// Create user-specific rate limiter for authenticated requests
const createUserRateLimiter = (options) => {
  return createRateLimiter({
    ...options,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id || req.ip;
    }
  });
};

// User-specific rate limiter for authenticated users
const userApiLimiter = createUserRateLimiter({
  max: 2000, // Higher limit for authenticated users
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: {
    error: 'Too many requests',
    message: 'You have exceeded your personal rate limit. Please try again later.'
  }
});

// Middleware function to apply appropriate rate limiter based on route
const rateLimiterMiddleware = (req, res, next) => {
  const path = req.path.toLowerCase();
  
  // Apply specific rate limiters based on the endpoint
  if (path.includes('/auth/login') || path.includes('/auth/register')) {
    return authLimiter(req, res, next);
  }
  
  if (path.includes('/ai') || path.includes('/voice')) {
    return aiLimiter(req, res, next);
  }
  
  if (path.includes('/upload')) {
    return uploadLimiter(req, res, next);
  }
  
  if (path.startsWith('/api/')) {
    // Use user-specific limiter if authenticated, otherwise general API limiter
    if (req.user) {
      return userApiLimiter(req, res, next);
    } else {
      return apiLimiter(req, res, next);
    }
  }
  
  // Default general limiter for all other requests
  return generalLimiter(req, res, next);
};

module.exports = rateLimiterMiddleware;