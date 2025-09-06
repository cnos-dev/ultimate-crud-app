/**
 * Authentication Routes for Ultimate CRUD
 * Provides login, register, refresh token, and user management endpoints
 */

const express = require('express');
const { Sequelize } = require('sequelize');
const rateLimit = require('express-rate-limit');
const { 
  generateTokens, 
  hashPassword, 
  comparePassword, 
  authenticate, 
  authorize
} = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: { error: 'Too many authentication attempts, please try again later.' }
});
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes
  message: { error: 'Too many requests, please try again later.' }
});

/**
 * Register a new user
 * POST /auth/register
 */
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Username, email, and password are required',
        details: {
          required_fields: ['username', 'email', 'password'],
          optional_fields: ['role']
        }
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Password must be at least 8 characters long',
        details: {
          password_requirements: {
            min_length: 8,
            recommended: 'Use a mix of letters, numbers, and special characters'
          }
        }
      });
    }

    // Get sequelize instance
    const sequelize = req.app.locals.sequelize;
    if (!sequelize) {
      return res.status(500).json({
        error: 'Database error',
        message: 'Database connection not available'
      });
    }

    // Check if user already exists
    const existingUser = await sequelize.query(
      'SELECT id FROM users WHERE username = :username OR email = :email LIMIT 1',
      {
        replacements: { username, email },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this username or email already exists',
        details: {
          status: 'CONFLICT',
          suggestion: 'Try a different username or email'
        }
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new user
    const [insertResult] = await sequelize.query(
      `INSERT INTO users (username, email, password, role, createdAt, updatedAt) 
       VALUES (:username, :email, :password, :role, NOW(), NOW())`,
      {
        replacements: { 
          username, 
          email, 
          password: hashedPassword, 
          role: role === 'admin' ? 'user' : role // Prevent admin registration
        },
        type: Sequelize.QueryTypes.INSERT
      }
    );

    // Get the created user
    const [newUser] = await sequelize.query(
      'SELECT id, username, email, role FROM users WHERE id = :id',
      {
        replacements: { id: insertResult },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    // Generate tokens
    const tokens = generateTokens(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      tokens: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_type: 'Bearer',
        expires_in: '24h'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Login user
 * POST /auth/login
 */
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Username and password are required',
        details: {
          required_fields: ['username', 'password'],
          note: 'You can use either username or email as username'
        }
      });
    }

    // Get sequelize instance
    const sequelize = req.app.locals.sequelize;
    if (!sequelize) {
      return res.status(500).json({
        error: 'Database error',
        message: 'Database connection not available'
      });
    }

    // Find user by username or email
    const [user] = await sequelize.query(
      'SELECT id, username, email, password, role FROM users WHERE username = :username OR email = :username LIMIT 1',
      {
        replacements: { username },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username or password',
        details: {
          status: 'UNAUTHORIZED',
          suggestion: 'Check your credentials and try again'
        }
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username or password',
        details: {
          status: 'UNAUTHORIZED',
          suggestion: 'Check your credentials and try again'
        }
      });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      tokens: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_type: 'Bearer',
        expires_in: '24h'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Refresh access token
 * POST /auth/refresh
 */
router.post('/refresh', generalRateLimit, async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Refresh token is required',
        details: {
          required_fields: ['refresh_token']
        }
      });
    }

    // Verify refresh token
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    
    let decoded;
    try {
      decoded = jwt.verify(refresh_token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'The refresh token is invalid or expired',
        details: {
          status: 'UNAUTHORIZED'
        }
      });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid token type',
        message: 'This is not a valid refresh token'
      });
    }

    // Get current user data
    const sequelize = req.app.locals.sequelize;
    const [user] = await sequelize.query(
      'SELECT id, username, email, role FROM users WHERE id = :id LIMIT 1',
      {
        replacements: { id: decoded.id },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'The user associated with this token no longer exists'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      message: 'Token refreshed successfully',
      tokens: {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_type: 'Bearer',
        expires_in: '24h'
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'An error occurred while refreshing the token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Get current user profile
 * GET /auth/me
 */
router.get('/me', authenticate, generalRateLimit, async (req, res) => {
  try {
    const sequelize = req.app.locals.sequelize;
    
    // Get user data with additional fields
    const [user] = await sequelize.query(
      'SELECT id, username, email, role, createdAt, updatedAt FROM users WHERE id = :id LIMIT 1',
      {
        replacements: { id: req.user.id },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    res.json({
      message: 'User profile retrieved successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'An error occurred while fetching user profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Update user profile
 * PUT /auth/me
 */
router.put('/me', authenticate, generalRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;
    const updates = {};
    const replacements = { id: req.user.id };

    if (email) {
      updates.email = ':email';
      replacements.email = email;
    }

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Password must be at least 8 characters long'
        });
      }
      updates.password = ':password';
      replacements.password = await hashPassword(password);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'No updates provided',
        message: 'Please provide fields to update',
        details: {
          updatable_fields: ['email', 'password']
        }
      });
    }

    const sequelize = req.app.locals.sequelize;
    
    // Build update query
    const setClause = Object.entries(updates)
      .map(([field, placeholder]) => `${field} = ${placeholder}`)
      .join(', ');

    await sequelize.query(
      `UPDATE users SET ${setClause}, updatedAt = NOW() WHERE id = :id`,
      {
        replacements,
        type: Sequelize.QueryTypes.UPDATE
      }
    );

    res.json({
      message: 'Profile updated successfully',
      updated_fields: Object.keys(updates)
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'An error occurred while updating profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Logout (invalidate token - client-side implementation)
 * POST /auth/logout
 */
router.post('/logout', authenticate, (req, res) => {
  res.json({
    message: 'Logout successful',
    note: 'Please remove the token from client storage',
    details: {
      token_removal: 'Delete access_token and refresh_token from client storage',
      security_note: 'Tokens will expire automatically after their set lifetime'
    }
  });
});

module.exports = router;
