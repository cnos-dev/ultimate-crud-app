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
      404: 'Category not found'
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
    type: process.env.DB_DIALECT === 'sqlite' ? 'query' : 'procedure',
    route: '/api/user-summary',
    // For SQLite, we need to provide the SQL query
    // For MySQL/PostgreSQL, it calls the existing procedure
    ...(process.env.DB_DIALECT === 'sqlite' ? {
      sql: `
        SELECT 
          u.id,
          u.username,
          u.email,
          (COALESCE(u.firstName, '') || ' ' || COALESCE(u.lastName, '')) as fullName,
          u.bio,
          u.isActive,
          COUNT(DISTINCT p.id) as totalPosts,
          COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) as publishedPosts,
          COUNT(DISTINCT c.id) as totalComments,
          COALESCE(SUM(p.views), 0) as totalViews,
          COALESCE(SUM(p.likes), 0) as totalLikes,
          u.createdAt as joinedAt,
          JULIANDAY('now') - JULIANDAY(u.createdAt) as daysSinceJoined,
          (COALESCE(SUM(p.views), 0) + COALESCE(SUM(p.likes), 0) * 2 + COUNT(DISTINCT c.id) * 3) as engagementScore,
          CASE 
            WHEN (COALESCE(SUM(p.views), 0) + COALESCE(SUM(p.likes), 0) * 2 + COUNT(DISTINCT c.id) * 3) > 100 THEN 'High'
            WHEN (COALESCE(SUM(p.views), 0) + COALESCE(SUM(p.likes), 0) * 2 + COUNT(DISTINCT c.id) * 3) > 50 THEN 'Medium'
            ELSE 'Low'
          END as engagementLevel
        FROM users u
        LEFT JOIN posts p ON u.id = p.userId
        LEFT JOIN comments c ON u.id = c.userId
        WHERE u.id = ?
        GROUP BY u.id, u.username, u.email, u.firstName, u.lastName, u.bio, u.isActive, u.createdAt
      `
    } : {}),
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
    type: process.env.DB_DIALECT === 'sqlite' ? 'query' : 'procedure',
    route: '/api/popular-posts',
    // For SQLite, we need to provide the SQL query
    // For MySQL/PostgreSQL, it calls the existing procedure
    ...(process.env.DB_DIALECT === 'sqlite' ? {
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
        LEFT JOIN comments cm ON p.id = cm.postId AND cm.isApproved = 1
        WHERE p.status = 'published' 
        AND p.publishedAt >= datetime('now', '-' || ? || ' days')
        GROUP BY p.id, p.title, p.slug, p.excerpt, p.featuredImage, p.publishedAt, u.username, c.name, p.views, p.likes
        ORDER BY popularity_score DESC
        LIMIT ?
      `
    } : {}),
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
  }
];

module.exports = entities;
