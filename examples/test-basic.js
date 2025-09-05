/**
 * Basic Test for Ultimate CRUD
 * Used for npm package verification
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
  storage: path.join(__dirname, '../test-demo.db'),
  logging: false // Disable logging for tests
});

// Define entities configuration
const entities = [
  {
    name: 'users',
    type: 'table',
    route: '/api/users'
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
    ]
  }
];

// Test function
async function runTest() {
  console.log('🔄 Starting Ultimate CRUD package test...');
  
  try {
    console.log('🔄 Testing database connection...');
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection test passed');

    console.log('🔄 Creating test tables...');
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

    console.log('✅ Database tables created/verified');

    console.log('🔄 Initializing Ultimate CRUD...');
    // Initialize Ultimate CRUD
    const ultimateCrud = UltimateCrud.create({
      app,
      sequelize,
      entities,
      enableGraphQL: true,
      enableRest: true,
      enableOpenAPI: true
    });

    await ultimateCrud.initialize();
    console.log('✅ Ultimate CRUD initialization test passed');

    console.log('🔄 Cleaning up...');
    // Clean up
    await sequelize.close();
    console.log('✅ All tests passed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

runTest();
