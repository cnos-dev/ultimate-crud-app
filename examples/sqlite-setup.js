/**
 * SQLite Example for Ultimate CRUD
 * Demonstrates usage with SQLite database (no external database required)
 * 
 * @license MIT
 * @copyright 2025 cnos-dev
 */

const express = require('express');
const { Sequelize } = require('sequelize');
const UltimateCrud = require('../index');
const path = require('path');

const app = express();

// Initialize Sequelize with SQLite (no external database required)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../demo.db'), // Creates a local SQLite file
  logging: console.log // Enable logging to see SQL queries
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

    // Create tables if they don't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        userId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `);

    console.log('✅ Database tables created/verified successfully.');

    // Initialize Ultimate CRUD (this will create tables if they don't exist)
    await ultimateCrud.initialize();
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`);
      console.log(`📋 OpenAPI Spec: http://localhost:${PORT}/openapi.json`);
      console.log(`📁 SQLite Database: ${path.join(__dirname, '../demo.db')}`);
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
      console.log(`   curl -X POST -H "Content-Type: application/json" -d '{"name":"John Doe","email":"john@example.com"}' http://localhost:${PORT}/api/users`);
      console.log(`   curl http://localhost:${PORT}/api/posts`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
})();
