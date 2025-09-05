/**
 * Blog Entity Definitions for Ultimate CRUD
 * Ultimate CRUD will automatically discover table schemas from the database
 * We only need to specify entity types, routes, and custom configurations
 */

const entities = [
  // ===========================================
  // TABLES (Schema auto-discovered from database)
  // ===========================================
  
  {
    name: 'users',
    type: 'table',
    route: '/api/users',
    validation: {
      uniqueFields: ['username', 'email'],
      conflictStatusCode: 409
    },
    // Schema will be auto-discovered from database
    // Custom associations can be defined if needed
    associations: [
      {
        type: 'hasMany',
        target: 'posts',
        foreignKey: 'userId',
        as: 'posts'
      },
      {
        type: 'hasMany',
        target: 'comments',
        foreignKey: 'userId',
        as: 'comments'
      }
    ],
    responseMessages: {
      200: 'Users retrieved successfully',
      201: 'User created successfully',
      400: 'Invalid user data',
      404: 'User not found',
      409: 'Username or email already exists'
    }
  },

  {
    name: 'categories',
    type: 'table',
    route: '/api/categories',
    validation: {
      uniqueFields: ['name', 'slug'],
      conflictStatusCode: 409
    },
    // Schema auto-discovered from database
    associations: [
      {
        type: 'hasMany',
        target: 'posts',
        foreignKey: 'categoryId',
        as: 'posts'
      }
    ],
    responseMessages: {
      200: 'Categories retrieved successfully',
      201: 'Category created successfully',
      400: 'Invalid category data',
      404: 'Category not found',
      409: 'Category name or slug already exists'
    }
  },

  {
    name: 'posts',
    type: 'table',
    route: '/api/posts',
    // Schema auto-discovered from database
    // Foreign key relationships will be detected automatically
    associations: [
      {
        type: 'belongsTo',
        target: 'users',
        foreignKey: 'userId',
        as: 'author'
      },
      {
        type: 'belongsTo',
        target: 'categories',
        foreignKey: 'categoryId',
        as: 'category'
      },
      {
        type: 'hasMany',
        target: 'comments',
        foreignKey: 'postId',
        as: 'comments'
      }
    ],
    responseMessages: {
      200: 'Posts retrieved successfully',
      201: 'Post created successfully',
      400: 'Invalid post data',
      404: 'Post not found'
    }
  },

  {
    name: 'comments',
    type: 'table',
    route: '/api/comments',
    // Schema auto-discovered from database
    associations: [
      {
        type: 'belongsTo',
        target: 'posts',
        foreignKey: 'postId',
        as: 'post'
      },
      {
        type: 'belongsTo',
        target: 'users',
        foreignKey: 'userId',
        as: 'user'
      },
      {
        type: 'belongsTo',
        target: 'comments',
        foreignKey: 'parentId',
        as: 'parent'
      },
      {
        type: 'hasMany',
        target: 'comments',
        foreignKey: 'parentId',
        as: 'replies'
      }
    ],
    responseMessages: {
      200: 'Comments retrieved successfully',
      201: 'Comment created successfully',
      404: 'Comment not found'
    }
  },

  // ===========================================
  // VIEWS (Database views - schema auto-discovered)
  // ===========================================
  
  {
    name: 'post_stats',
    type: 'view',
    route: '/api/post-stats',
    // Schema will be auto-discovered from the post_stats view in database
    responseMessages: {
      200: 'Post statistics retrieved successfully'
    }
  },

  {
    name: 'user_analytics', 
    type: 'view',
    route: '/api/user-analytics',
    // Schema will be auto-discovered from the user_analytics view in database
    responseMessages: {
      200: 'User analytics retrieved successfully'
    }
  },

  {
    name: 'category_summary',
    type: 'view', 
    route: '/api/category-summary',
    // Schema will be auto-discovered from the category_summary view in database
    responseMessages: {
      200: 'Category summary retrieved successfully'
    }
  },

  // ===========================================
  // CUSTOM QUERIES (Custom SQL statements)
  // ===========================================

  {
    name: 'recent_posts',
    type: 'query',
    route: '/api/recent-posts',
    sql: `
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.publishedAt,
        u.username as author,
        c.name as category,
        p.views,
        p.likes
      FROM posts p
      JOIN users u ON p.userId = u.id
      JOIN categories c ON p.categoryId = c.id
      WHERE p.status = 'published'
      ORDER BY p.publishedAt DESC
      LIMIT 10
    `,
    responseMessages: {
      200: 'Recent posts retrieved successfully'
    }
  },

  {
    name: 'search_posts',
    type: 'query',
    route: '/api/search-posts',
    sql: `
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.publishedAt,
        u.username as author,
        c.name as category,
        p.views,
        p.likes,
        MATCH(p.title, p.content) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM posts p
      JOIN users u ON p.userId = u.id
      JOIN categories c ON p.categoryId = c.id
      WHERE p.status = 'published'
        AND MATCH(p.title, p.content) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY relevance DESC, p.publishedAt DESC
      LIMIT 20
    `,
    parameters: [
      {
        name: 'search_term',
        type: 'STRING',
        required: true,
        description: 'Search term to look for in post title and content'
      }
    ],
    responseMessages: {
      200: 'Search results retrieved successfully',
      400: 'Search term is required'
    }
  },

  // ===========================================
  // STORED PROCEDURES / QUERIES (Database-specific)
  // ===========================================
  
  // Note: SQLite doesn't support stored procedures, so these become queries
  // MySQL and PostgreSQL support actual stored procedures
  
  {
    name: 'user_summary',
    type: 'procedure',
    route: '/api/user-summary',
    procedure: 'user_summary', // Explicit procedure name
    parameters: [
      {
        name: 'user_id',
        type: 'INTEGER',
        required: true,
        description: 'User ID to get summary for'
      }
    ],
    responseMessages: {
      200: 'User summary generated successfully',
      400: 'Invalid user ID provided',
      404: 'User not found'
    }
  },

  {
    name: 'popular_posts',
    type: 'query',
    route: '/api/popular-posts',
    sql: `
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.featuredImage,
        p.publishedAt,
        u.username as author,
        c.name as category,
        p.views,
        p.likes,
        COUNT(DISTINCT cm.id) as commentCount,
        (p.views * 0.6 + p.likes * 0.3 + COUNT(DISTINCT cm.id) * 0.1) as popularity_score
      FROM posts p
      JOIN users u ON p.userId = u.id
      JOIN categories c ON p.categoryId = c.id
      LEFT JOIN comments cm ON p.id = cm.postId AND cm.isApproved = true
      WHERE p.status = 'published' 
      AND p.publishedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY p.id, p.title, p.slug, p.excerpt, p.featuredImage, p.publishedAt, u.username, c.name, p.views, p.likes
      ORDER BY popularity_score DESC
      LIMIT 10
    `,
    parameters: [
      {
        name: 'days_back',
        type: 'INTEGER',
        required: false,
        default: 30,
        description: 'Number of days to look back (default: 30)'
      },
      {
        name: 'limit_count',
        type: 'INTEGER',
        required: false,
        default: 10,
        description: 'Maximum number of posts to return (default: 10)'
      }
    ],
    responseMessages: {
      200: 'Popular posts retrieved successfully',
      400: 'Invalid parameters provided'
    }
  },

  // ===========================================
  // TEST TABLES (Custom Primary Key Testing)
  // ===========================================
  
  {
    name: 'products',
    type: 'table',
    route: '/api/products',
    validation: {
      uniqueFields: ['sku'],
      conflictStatusCode: 409
    },
    // Primary key: product_id (auto-increment)
    // Ultimate CRUD should auto-discover this
    associations: [
      {
        type: 'hasMany',
        target: 'order_items',
        foreignKey: 'product_id',
        as: 'order_items'
      }
    ],
    responseMessages: {
      200: 'Products retrieved successfully',
      201: 'Product created successfully',
      400: 'Invalid product data',
      404: 'Product not found',
      409: 'SKU already exists'
    }
  },

  {
    name: 'orders',
    type: 'table',
    route: '/api/orders',
    // Primary key: order_uuid (VARCHAR, manual assignment)
    // Ultimate CRUD should auto-discover this
    associations: [
      {
        type: 'hasMany',
        target: 'order_items',
        foreignKey: 'order_uuid',
        as: 'order_items'
      }
    ],
    responseMessages: {
      200: 'Orders retrieved successfully',
      201: 'Order created successfully',
      400: 'Invalid order data',
      404: 'Order not found'
    }
  },

  {
    name: 'order_items',
    type: 'table',
    route: '/api/order-items',
    // Compound primary key: (order_uuid, product_id)
    // Ultimate CRUD should auto-discover this
    associations: [
      {
        type: 'belongsTo',
        target: 'orders',
        foreignKey: 'order_uuid',
        as: 'order'
      },
      {
        type: 'belongsTo',
        target: 'products',
        foreignKey: 'product_id',
        as: 'product'
      }
    ],
    responseMessages: {
      200: 'Order items retrieved successfully',
      201: 'Order item created successfully',
      400: 'Invalid order item data',
      404: 'Order item not found'
    }
  },

  {
    name: 'inventory',
    type: 'table',
    route: '/api/inventory',
    validation: {
      uniqueFields: ['location_code'],
      conflictStatusCode: 409
    },
    // Primary key: location_code (VARCHAR, manual assignment)
    // Ultimate CRUD should auto-discover this
    responseMessages: {
      200: 'Inventory retrieved successfully',
      201: 'Inventory location created successfully',
      400: 'Invalid inventory data',
      404: 'Inventory location not found',
      409: 'Location code already exists'
    }
  }
];

module.exports = entities;
