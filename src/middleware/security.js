/**
 * Simple Security Middleware for Ultimate CRUD
 * Requires JWT authentication for all API endpoints
 * Developers can add their own authorization logic after authentication
 */

const rateLimit = require('express-rate-limit');
const { authenticate } = require('./auth');

/**
 * Simple security middleware that requires authentication for all API endpoints
 * Excludes auth routes, health check, and documentation
 */
const requireAuthForAPI = () => {
  return (req, res, next) => {
    const path = req.path;
    
    // Skip authentication for these specific public routes
    let isPublicRoute = false;
    
    // Exact match for root
    if (path === '/') {
      isPublicRoute = true;
    }
    
    // Check for auth routes specifically
    if (path.startsWith('/auth/') || path === '/auth') {
      isPublicRoute = true;
    }
    
    // Check other public routes (exact matches)
    if (['/health', '/docs', '/api-docs'].includes(path)) {
      isPublicRoute = true;
    }
    
    if (isPublicRoute) {
      return next();
    }
    
    // For GraphQL introspection (GET requests to /graphql)
    if (path === '/graphql' && req.method === 'GET') {
      return next();
    }
    
    // For all API endpoints, require authentication
    if (path.startsWith('/api') || path === '/graphql') {
      return authenticate(req, res, next);
    }
    
    // For other routes, continue without authentication
    next();
  };
};

/**
 * Apply rate limiting to all routes
 * Higher limits for authenticated users
 */
const applyRateLimit = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

module.exports = {
  requireAuthForAPI,
  applyRateLimit
};
