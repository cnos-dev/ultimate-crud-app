/**
 * MySQL Setup Example for Ultimate CRUD
 * Demonstrates usage with MySQL database
 * 
 * @license MIT
 * @copyright 2025 cnos-dev
 */

const express = require('express');
const { Sequelize } = require('sequelize');
const UltimateCrud = require('../index');

const app = express();

// Initialize Sequelize with MySQL
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'test_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'password',
  logging: false,
  define: {
    timestamps: true, // Adds createdAt and updatedAt
    underscored: false // Use camelCase instead of snake_case
  }
});

// Define entities configuration
const entities = [
  {
    name: 'users',
    type: 'table',
    route: '/api/users',
    fields: {
      id: {
        type: 'INTEGER',
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: 'STRING(50)',
        allowNull: false,
        unique: true
      },
      email: {
        type: 'STRING(100)',
        allowNull: false,
        unique: true
      },
      firstName: {
        type: 'STRING(50)',
        allowNull: true
      },
      lastName: {
        type: 'STRING(50)',
        allowNull: true
      },
      isActive: {
        type: 'BOOLEAN',
        defaultValue: true
      }
    },
    responseMessages: {
      200: 'Users retrieved successfully',
      201: 'User created successfully',
      400: 'Invalid user data',
      404: 'User not found',
      500: 'Internal server error'
    }
  },
  {
    name: 'categories',
    type: 'table',
    route: '/api/categories',
    fields: {
      id: {
        type: 'INTEGER',
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: 'STRING(100)',
        allowNull: false
      },
      description: {
        type: 'TEXT',
        allowNull: true
      }
    },
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
    fields: {
      id: {
        type: 'INTEGER',
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: 'STRING',
        allowNull: false
      },
      content: {
        type: 'TEXT',
        allowNull: true
      },
      authorId: {
        type: 'INTEGER',
        allowNull: false,
        field: 'author_id'
      },
      categoryId: {
        type: 'INTEGER',
        allowNull: true,
        field: 'category_id'
      },
      views: {
        type: 'INTEGER',
        defaultValue: 0
      },
      published: {
        type: 'BOOLEAN',
        defaultValue: false
      }
    },
    associations: [
      {
        type: 'belongsTo',
        target: 'users',
        foreignKey: 'authorId',
        as: 'author'
      },
      {
        type: 'belongsTo',
        target: 'categories',
        foreignKey: 'categoryId',
        as: 'category'
      }
    ],
    responseMessages: {
      200: 'Posts retrieved successfully',
      201: 'Post created successfully',
      404: 'Post not found'
    }
  }
];

// Initialize Ultimate CRUD
const ultimateCrud = UltimateCrud.create({
  app,
  sequelize,
  entities,
  enableGraphQL: true,
  enableRest: true,
  enableOpenAPI: true
});

// Start the server
(async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('📊 Database synchronized');

    // Initialize Ultimate CRUD
    await ultimateCrud.initialize();
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`);
      console.log(`📋 OpenAPI Spec: http://localhost:${PORT}/openapi.json`);
      console.log('\n📖 Available REST endpoints:');
      entities.forEach(entity => {
        if (entity.type === 'table') {
          console.log(`   GET    ${entity.route}`);
          console.log(`   POST   ${entity.route}`);
          console.log(`   GET    ${entity.route}/:id`);
          console.log(`   PUT    ${entity.route}/:id`);
          console.log(`   DELETE ${entity.route}/:id`);
        }
      });
      
      console.log('\n🔥 Quick Test Commands:');
      console.log(`   curl http://localhost:${PORT}/api/users`);
      console.log(`   curl -X POST -H "Content-Type: application/json" -d '{"username":"john_doe","email":"john@example.com","firstName":"John","lastName":"Doe"}' http://localhost:${PORT}/api/users`);
      console.log(`   curl http://localhost:${PORT}/api/categories`);
      
      console.log('\n⚙️ Environment Variables:');
      console.log('   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS');
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    if (error.name === 'SequelizeConnectionError') {
      console.error('\n💡 Make sure your MySQL server is running and the database exists.');
      console.error('   You can create it with: CREATE DATABASE test_db;');
    }
    process.exit(1);
  }
})();
