/**
 * Basic Setup Example for Ultimate CRUD
 * Demonstrates basic configuration with MySQL
 * 
 * @license MIT
 * @copyright 2025 cnos-dev
 */

const express = require('express');
const { Sequelize } = require('sequelize');
const UltimateCrud = require('../index');

const app = express();

// Initialize Sequelize (MySQL example)
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'cnos',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'rootpassword',
  logging: false
});

// Define entities configuration
const entities = [
  {
    name: 'users',
    type: 'table',
    route: '/api/users',
    responseMessages: {
      200: 'Users retrieved successfully',
      201: 'User created successfully',
      400: 'Invalid user data',
      404: 'User not found',
      500: 'Internal server error'
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
        foreignKey: 'userId',
        as: 'author'
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
    console.log('✅ Database connection established successfully.');

    // Initialize Ultimate CRUD
    await ultimateCrud.initialize();
    
    // Start server
    const PORT = process.env.PORT || 3001;
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
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
})();
