/**
 * Custom Validation Middleware for Ultimate CRUD
 * Handles business logic validations that go beyond database constraints
 */

const customValidations = {
  // Email domain validation
  validateEmailDomain: (email) => {
    const blockedDomains = ['gmail.com', 'tempmail.org', '10minutemail.com'];
    const domain = email.split('@')[1];
    if (blockedDomains.includes(domain)) {
      return {
        valid: false,
        message: `Email addresses from ${domain} are not allowed`
      };
    }
    return { valid: true };
  },

  // Age validation (if age field exists)
  validateAge: (age) => {
    if (age !== undefined && age !== null) {
      if (age < 18) {
        return {
          valid: false,
          message: 'Age must be at least 18 years old'
        };
      }
      if (age > 120) {
        return {
          valid: false,
          message: 'Age must be less than 120 years'
        };
      }
    }
    return { valid: true };
  },

  // Username format validation
  validateUsername: (username) => {
    if (username) {
      if (username.length < 3) {
        return {
          valid: false,
          message: 'Username must be at least 3 characters long'
        };
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return {
          valid: false,
          message: 'Username can only contain letters, numbers, and underscores'
        };
      }
    }
    return { valid: true };
  }
};

// Validation middleware for users
const validateUserData = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const { email, age, username } = req.body;
    const errors = [];

    // Validate email domain
    if (email) {
      const emailValidation = customValidations.validateEmailDomain(email);
      if (!emailValidation.valid) {
        errors.push({
          field: 'email',
          message: emailValidation.message
        });
      }
    }

    // Validate age
    if (age !== undefined) {
      const ageValidation = customValidations.validateAge(age);
      if (!ageValidation.valid) {
        errors.push({
          field: 'age',
          message: ageValidation.message
        });
      }
    }

    // Validate username
    if (username) {
      const usernameValidation = customValidations.validateUsername(username);
      if (!usernameValidation.valid) {
        errors.push({
          field: 'username',
          message: usernameValidation.message
        });
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: {
          message: 'The following fields have validation errors',
          validation_errors: errors
        }
      });
    }
  }

  next();
};

// Validation middleware for categories
const validateCategoryData = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const { name, slug } = req.body;
    const errors = [];

    // Validate category name
    if (name && name.length < 2) {
      errors.push({
        field: 'name',
        message: 'Category name must be at least 2 characters long'
      });
    }

    // Validate slug format
    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      errors.push({
        field: 'slug',
        message: 'Slug can only contain lowercase letters, numbers, and hyphens'
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: {
          message: 'The following fields have validation errors',
          validation_errors: errors
        }
      });
    }
  }

  next();
};

module.exports = {
  validateUserData,
  validateCategoryData,
  customValidations
};
