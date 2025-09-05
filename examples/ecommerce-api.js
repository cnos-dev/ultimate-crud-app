/**
 * E-commerce API Example for Ultimate CRUD
 * Demonstrates complete e-commerce implementation with SQLite
 * 
 * @license MIT
 * @copyright 2025 cnos-dev
 */

const express = require('express');
const { Sequelize } = require('sequelize');
const UltimateCrud = require('../index');

const app = express();

// SQLite configuration for development
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './ecommerce.db',
  logging: false
});

// E-commerce API entities
const entities = [
  {
    name: 'customers',
    type: 'table',
    route: '/api/customers',
    responseMessages: {
      200: 'Customers retrieved successfully',
      201: 'Customer registered successfully',
      404: 'Customer not found'
    }
  },
  {
    name: 'products',
    type: 'table',
    route: '/api/products',
    associations: [
      {
        type: 'belongsTo',
        target: 'categories',
        foreignKey: 'categoryId',
        as: 'category'
      },
      {
        type: 'hasMany',
        target: 'order_items',
        foreignKey: 'productId',
        as: 'orderItems'
      }
    ],
    responseMessages: {
      200: 'Products loaded successfully',
      201: 'Product added to catalog',
      404: 'Product not found'
    }
  },
  {
    name: 'categories',
    type: 'table',
    route: '/api/categories',
    associations: [
      {
        type: 'hasMany',
        target: 'products',
        foreignKey: 'categoryId',
        as: 'products'
      }
    ]
  },
  {
    name: 'orders',
    type: 'table',
    route: '/api/orders',
    associations: [
      {
        type: 'belongsTo',
        target: 'customers',
        foreignKey: 'customerId',
        as: 'customer'
      },
      {
        type: 'hasMany',
        target: 'order_items',
        foreignKey: 'orderId',
        as: 'items'
      }
    ],
    responseMessages: {
      200: 'Orders retrieved successfully',
      201: 'Order placed successfully'
    }
  },
  {
    name: 'order_items',
    type: 'table',
    route: '/api/order-items',
    associations: [
      {
        type: 'belongsTo',
        target: 'orders',
        foreignKey: 'orderId',
        as: 'order'
      },
      {
        type: 'belongsTo',
        target: 'products',
        foreignKey: 'productId',
        as: 'product'
      }
    ]
  },
  {
    name: 'inventory_view',
    type: 'view',
    route: '/api/inventory',
    responseMessages: {
      200: 'Inventory data retrieved successfully'
    }
  },
  {
    name: 'popular_products',
    type: 'query',
    route: '/api/products/popular',
    sql: `
      SELECT 
        p.id,
        p.name,
        p.price,
        COUNT(oi.id) as order_count,
        SUM(oi.quantity) as total_sold
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      GROUP BY p.id, p.name, p.price
      HAVING order_count > 0
      ORDER BY total_sold DESC, order_count DESC
      LIMIT 20
    `,
    responseMessages: {
      200: 'Popular products retrieved successfully'
    }
  },
  {
    name: 'sales_report',
    type: 'query',
    route: '/api/reports/sales',
    sql: `
      SELECT 
        DATE(o.created_at) as sale_date,
        COUNT(DISTINCT o.id) as total_orders,
        COUNT(oi.id) as total_items,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.created_at >= DATE('now', '-30 days')
      GROUP BY DATE(o.created_at)
      ORDER BY sale_date DESC
    `,
    responseMessages: {
      200: 'Sales report generated successfully'
    }
  }
];

// Initialize with custom configuration
const ultimateCrud = UltimateCrud.create({
  app,
  sequelize,
  entities,
  enableGraphQL: true,
  enableRest: true,
  enableOpenAPI: true,
  syncDatabase: true
});

// CORS middleware for frontend integration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Custom health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'E-commerce API'
  });
});

// Start the e-commerce API
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite database connection established.');

    await ultimateCrud.initialize();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🛒 E-commerce API Server running on http://localhost:${PORT}`);
      console.log(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`);
      console.log(`📋 API Documentation: http://localhost:${PORT}/openapi.json`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log('\n🛍️ E-commerce API Endpoints:');
      console.log('   👥 Customers: /api/customers');
      console.log('   📦 Products: /api/products');
      console.log('   📂 Categories: /api/categories');
      console.log('   🧾 Orders: /api/orders');
      console.log('   📋 Order Items: /api/order-items');
      console.log('   📊 Inventory: /api/inventory');
      console.log('   🔥 Popular Products: /api/products/popular');
      console.log('   📈 Sales Report: /api/reports/sales');
    });
  } catch (error) {
    console.error('❌ Failed to start e-commerce API:', error);
    process.exit(1);
  }
})();
