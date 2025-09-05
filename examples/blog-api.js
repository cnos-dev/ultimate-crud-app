/**
 * Blog API Example for Ultimate CRUD
 * Demonstrates advanced features with PostgreSQL
 * 
 * @license MIT
 * @copyright 2025 cnos-dev
 */

const express = require('express');
const { Sequelize } = require('sequelize');
const UltimateCrud = require('../index');

const app = express();

// PostgreSQL configuration
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'blog_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  schema: 'public',
  logging: false
});

// Comprehensive blog API entities
const entities = [
  {
    name: 'users',
    type: 'table',
    route: '/api/users',
    schema: 'public',
    responseMessages: {
      200: 'Users retrieved successfully',
      201: 'User created successfully',
      400: 'Invalid user data provided',
      404: 'User not found',
      500: 'Internal server error occurred'
    }
  },
  {
    name: 'categories',
    type: 'table',
    route: '/api/categories',
    responseMessages: {
      200: 'Categories loaded successfully',
      201: 'Category created successfully'
    }
  },
  {
    name: 'posts',
    type: 'table',
    route: '/api/posts',
    associations: [
      {
        type: 'belongsTo',
        target: 'users',
        foreignKey: 'authorId',
        targetKey: 'id',
        as: 'author'
      },
      {
        type: 'belongsTo',
        target: 'categories',
        foreignKey: 'categoryId',
        targetKey: 'id',
        as: 'category'
      },
      {
        type: 'hasMany',
        target: 'comments',
        foreignKey: 'postId',
        sourceKey: 'id',
        as: 'comments'
      }
    ],
    responseMessages: {
      200: 'Posts retrieved successfully',
      201: 'Post published successfully',
      404: 'Post not found',
      400: 'Invalid post data'
    }
  },
  {
    name: 'comments',
    type: 'table',
    route: '/api/comments',
    associations: [
      {
        type: 'belongsTo',
        target: 'posts',
        foreignKey: 'postId',
        targetKey: 'id',
        as: 'post'
      },
      {
        type: 'belongsTo',
        target: 'users',
        foreignKey: 'userId',
        targetKey: 'id',
        as: 'user'
      }
    ],
    responseMessages: {
      200: 'Comments retrieved successfully',
      201: 'Comment posted successfully'
    }
  },
  {
    name: 'post_stats',
    type: 'view',
    route: '/api/stats/posts',
    responseMessages: {
      200: 'Post statistics retrieved successfully'
    }
  },
  {
    name: 'trending_posts',
    type: 'query',
    route: '/api/posts/trending',
    sql: `
      SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.views,
        p.created_at,
        u.username as author_name,
        c.name as category_name,
        COUNT(com.id) as comment_count 
      FROM posts p 
      LEFT JOIN users u ON p.author_id = u.id 
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN comments com ON p.id = com.post_id 
      WHERE p.created_at > CURRENT_DATE - INTERVAL '7 days'
      GROUP BY p.id, u.username, c.name
      ORDER BY p.views DESC, comment_count DESC 
      LIMIT 10
    `,
    responseMessages: {
      200: 'Trending posts retrieved successfully',
      500: 'Error fetching trending posts'
    }
  },
  {
    name: 'user_report',
    type: 'procedure',
    route: '/api/reports/users',
    procedure: 'generate_user_activity_report',
    responseMessages: {
      200: 'User activity report generated successfully',
      500: 'Error generating user report'
    }
  }
];

// Initialize Ultimate CRUD with advanced configuration
const ultimateCrud = UltimateCrud.create({
  app,
  sequelize,
  entities,
  
  // Feature configuration
  enableGraphQL: true,
  enableRest: true,
  enableOpenAPI: true,
  
  // Custom paths
  graphqlPath: '/graphql',
  openapiPath: '/api/docs/openapi.json',
  
  // Database options
  syncDatabase: true
});

// Custom middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Something went wrong!',
    message: error.message
  });
});

// Start the comprehensive blog API
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection established successfully.');

    await ultimateCrud.initialize();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Blog API Server running on http://localhost:${PORT}`);
      console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`);
      console.log(`📋 OpenAPI Documentation: http://localhost:${PORT}/api/docs/openapi.json`);
      console.log('\n📚 Blog API Endpoints:');
      console.log('   👥 Users: /api/users');
      console.log('   📂 Categories: /api/categories');
      console.log('   📝 Posts: /api/posts');
      console.log('   💬 Comments: /api/comments');
      console.log('   📊 Stats: /api/stats/posts');
      console.log('   🔥 Trending: /api/posts/trending');
      console.log('   📈 Reports: /api/reports/users');
    });
  } catch (error) {
    console.error('❌ Failed to start blog API:', error);
    process.exit(1);
  }
})();
