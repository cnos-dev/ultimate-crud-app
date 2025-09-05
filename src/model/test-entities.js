/**
 * Test entities for custom primary key names
 * This tests how Ultimate CRUD handles different primary key scenarios
 */

const testEntities = [
  // Table with custom primary key name (product_id)
  {
    name: 'products',
    type: 'table',
    route: '/api/products',
    validation: {
      uniqueFields: ['sku'],
      conflictStatusCode: 409
    },
    responseMessages: {
      200: 'Products retrieved successfully',
      201: 'Product created successfully',
      404: 'Product not found',
      409: 'SKU already exists'
    }
  },

  // Table with UUID primary key (order_uuid)
  {
    name: 'orders',
    type: 'table',
    route: '/api/orders',
    validation: {
      uniqueFields: ['order_uuid'],
      conflictStatusCode: 409
    },
    responseMessages: {
      200: 'Orders retrieved successfully',
      201: 'Order created successfully',
      404: 'Order not found',
      409: 'Order UUID already exists'
    }
  },

  // Table with compound primary key
  {
    name: 'order_items',
    type: 'table',
    route: '/api/order-items',
    responseMessages: {
      200: 'Order items retrieved successfully',
      201: 'Order item created successfully',
      404: 'Order item not found'
    }
  },

  // Table with non-auto-increment primary key
  {
    name: 'inventory',
    type: 'table',
    route: '/api/inventory',
    validation: {
      uniqueFields: ['location_code'],
      conflictStatusCode: 409
    },
    responseMessages: {
      200: 'Inventory retrieved successfully',
      201: 'Inventory location created successfully',
      404: 'Inventory location not found',
      409: 'Location code already exists'
    }
  }
];

module.exports = testEntities;
