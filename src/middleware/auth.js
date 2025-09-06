/**
 * JWT Authentication Middleware for Ultimate CRUD
 * Provides comprehensive authentication and authorization for API endpoints
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {Object} Access and refresh tokens
 */
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role || 'user'
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'ultimate-crud-app',
    audience: 'ultimate-crud-api'
  });

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' }, 
    JWT_SECRET, 
    { 
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      issuer: 'ultimate-crud-app',
      audience: 'ultimate-crud-api'
    }
  );

  return { accessToken, refreshToken };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'ultimate-crud-app',
      audience: 'ultimate-crud-api'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
const hashPassword = async (password) => {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {boolean} Password match result
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Authentication middleware - verifies JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid Bearer token in Authorization header',
        details: {
          required_format: 'Authorization: Bearer <your-jwt-token>',
          status: 'UNAUTHORIZED'
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);
    
    // Add user info to request object
    req.user = decoded;
    req.isAuthenticated = true;
    
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: error.message,
      details: {
        status: 'UNAUTHORIZED',
        timestamp: new Date().toISOString()
      }
    });
  }
};

/**
 * Simple authorization middleware - just checks if user is authenticated
 * Developers can add their own authorization logic after this basic check
 * @returns {Function} Express middleware function
 */
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide a valid JWT token to access this endpoint',
      details: { 
        status: 'UNAUTHORIZED',
        required_format: 'Authorization: Bearer <your-jwt-token>'
      }
    });
  }
  
  // User is authenticated, proceed to next middleware
  // Developers can add their own authorization logic here
  next();
};

/**
 * Optional authentication middleware - sets user if token is provided
 * Use this for endpoints that can work with or without authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
      req.isAuthenticated = true;
    } else {
      req.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    // For optional auth, continue without authentication on token errors
    req.isAuthenticated = false;
    next();
  }
};

module.exports = {
  // Core functions
  generateTokens,
  verifyToken,
  hashPassword,
  comparePassword,
  
  // Middleware functions
  authenticate,        // Validates JWT token and sets req.user
  requireAuth,         // Simple check: requires authentication (no role logic)
  optionalAuth,        // Sets user if token provided, continues if not
  
  // Configuration constants
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN
};
