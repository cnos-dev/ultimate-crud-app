/**
 * Example: Custom Authorization Middleware
 * 
 * This is an example of how developers can implement their own authorization logic
 * after the basic JWT authentication is handled by the auth middleware.
 * 
 * The auth middleware ensures req.user is set and req.isAuthenticated is true.
 * You can then add your own business-specific authorization rules.
 */

/**
 * Example 1: Simple role-based authorization
 * Use this after the basic auth middleware to check user roles
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // At this point, authentication is already verified by the auth middleware
    // req.user contains the JWT payload with user information
    
    const userRole = req.user?.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${userRole}`,
        details: {
          required_roles: roles,
          user_role: userRole
        }
      });
    }
    
    next();
  };
};

/**
 * Example 2: Resource ownership authorization
 * Check if user owns the resource being accessed
 */
const requireOwnership = (resourceField = 'userId') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user.id;
      const sequelize = req.app.locals.sequelize;
      
      // Extract entity name from URL path
      const entityName = req.path.split('/')[2]; // /api/posts/123 -> posts
      
      // Check if resource belongs to user
      const [resource] = await sequelize.query(
        `SELECT ${resourceField} FROM ${entityName} WHERE id = :resourceId LIMIT 1`,
        {
          replacements: { resourceId },
          type: sequelize.QueryTypes.SELECT
        }
      );
      
      if (!resource) {
        return res.status(404).json({
          error: 'Resource not found',
          message: `${entityName} with id ${resourceId} not found`
        });
      }
      
      if (resource[resourceField] !== userId) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only access your own resources'
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        error: 'Authorization check failed',
        message: error.message
      });
    }
  };
};

/**
 * Example 3: Business logic authorization
 * Custom business rules based on your application requirements
 */
const checkBusinessRules = () => {
  return (req, res, next) => {
    const user = req.user;
    const method = req.method;
    const entityName = req.path.split('/')[2];
    
    // Example: Only premium users can create more than 10 posts
    if (entityName === 'posts' && method === 'POST') {
      if (user.plan !== 'premium' && user.postCount >= 10) {
        return res.status(403).json({
          error: 'Plan limit exceeded',
          message: 'Upgrade to premium to create more posts',
          details: {
            current_plan: user.plan,
            posts_created: user.postCount,
            limit: 10
          }
        });
      }
    }
    
    // Example: Users can only delete their own comments
    if (entityName === 'comments' && method === 'DELETE') {
      // You would implement ownership check here
      // This is just an example structure
    }
    
    next();
  };
};

/**
 * Example usage in your routes:
 * 
 * // Require admin role for user management
 * app.use('/api/users', requireRole(['admin']));
 * 
 * // Require ownership for posts
 * app.use('/api/posts/:id', requireOwnership('authorId'));
 * 
 * // Apply business rules to specific endpoints
 * app.use('/api/posts', checkBusinessRules());
 * 
 * // Or combine multiple authorization checks
 * app.use('/api/admin/*', requireRole(['admin', 'moderator']));
 */

module.exports = {
  requireRole,
  requireOwnership,
  checkBusinessRules
};
