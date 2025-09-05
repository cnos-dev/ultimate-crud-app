/**
 * Simple Blog Application using Ultimate CRUD
 * Demonstrates tables, views, procedures, and associations
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const UltimateCrud = require('ultimate-crud');
const entities = require('./model/entities');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Configuration
const dbConfig = {
  dialect: process.env.DB_DIALECT || 'sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false, // Disable SQL logging in production
  
  define: {
    timestamps: true,
    underscored: false
  }
};

// Configure based on database type
if (dbConfig.dialect === 'sqlite') {
  dbConfig.storage = process.env.SQLITE_PATH || './blog.db';
} else {
  dbConfig.host = process.env.DB_HOST || 'localhost';
  dbConfig.port = process.env.DB_PORT || (dbConfig.dialect === 'postgres' ? 5432 : 3306);
  dbConfig.database = process.env.DB_NAME || 'ultimate_crud_blog';
  dbConfig.username = process.env.DB_USER || (dbConfig.dialect === 'postgres' ? 'postgres' : 'root');
  dbConfig.password = process.env.DB_PASS || 'password';
}

const sequelize = new Sequelize(dbConfig);

// Initialize Ultimate CRUD
const initializeApp = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Initialize Ultimate CRUD with entities
    const ultimateCrud = UltimateCrud.create({
      app,
      sequelize,
      entities,
      config: {
        enableGraphQL: true,
        enableRest: true,
        enableOpenAPI: true,
        
        // API configuration
        apiPrefix: '/api',
        
        // GraphQL configuration
        graphql: {
          path: '/graphql',
          playground: true,
          introspection: true
        },
        
        // OpenAPI configuration
        openapi: {
          title: 'Simple Blog API',
          version: '1.0.0',
          description: 'A simple blog API built with Ultimate CRUD',
          servers: [
            {
              url: `http://localhost:${process.env.PORT || 3000}`,
              description: 'Development server'
            }
          ]
        },
        
        // Error handling configuration
        errorHandling: {
          uniqueConstraintCode: 409,
          detailedErrors: true
        }
      }
    });

    // Initialize Ultimate CRUD
    await ultimateCrud.initialize();
    console.log('✅ Ultimate CRUD initialized successfully.');

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'OK',
        message: 'Simple Blog API is running',
        timestamp: new Date().toISOString(),
        database: 'Connected'
      });
    });

    // Welcome endpoint
    app.get('/', (req, res) => {
      res.json({
        message: '🚀 Welcome to Simple Blog API powered by Ultimate CRUD!',
        endpoints: {
          health: '/health',
          api: '/api',
          graphql: '/graphql',
          docs: '/docs',
          openapi: '/openapi.json'
        },
        entities: entities.map(e => ({
          name: e.name,
          type: e.type,
          route: e.route
        }))
      });
    });

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log('\n🚀 Simple Blog API Started!');
      console.log(`📍 Server: http://localhost:${PORT}`);
      console.log(`🌐 API Base: http://localhost:${PORT}/api`);
      console.log(`🎮 GraphQL: http://localhost:${PORT}/graphql`);
      console.log(`📚 Documentation: http://localhost:${PORT}/docs`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      
      console.log('\n📖 Available REST Endpoints:');
      console.log('   GET/POST    /api/users');
      console.log('   GET/PUT/DEL /api/users/:id');
      console.log('   GET/POST    /api/categories');
      console.log('   GET/POST    /api/posts');
      console.log('   GET/POST    /api/comments');
      console.log('   GET         /api/post-stats        (view)');
      console.log('   GET         /api/user-analytics    (view)');
      console.log('   POST        /api/user-summary      (procedure)');
      
      console.log('\n🎯 Quick Test Commands:');
      console.log('   curl http://localhost:' + PORT + '/health');
      console.log('   curl http://localhost:' + PORT + '/api/users');
      console.log('   curl http://localhost:' + PORT + '/graphql -X POST -H "Content-Type: application/json" -d \'{"query":"{ users { id username email } }"}\'');
      
      console.log('\n📝 Next Steps:');
      console.log('   1. Test the endpoints above');
      console.log('   2. Open GraphQL playground in browser');
      console.log('   3. Check API documentation');
      console.log('   4. Create some test data');
      console.log('\n');
    });

  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Database is running and accessible');
    console.error('   2. Database credentials are correct');
    console.error('   3. Database schema is created (run data/database-[dialect].sql)');
    console.error('   4. Required npm packages are installed');
    console.error('   5. For Docker: run docker-compose up -d in docker/ folder');
    process.exit(1);
  }
};

// Start the application
initializeApp();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await sequelize.close();
  console.log('✅ Database connection closed.');
  process.exit(0);
});

module.exports = app;
