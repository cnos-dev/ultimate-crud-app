# Ultimate CRUD App with JWT Authentication

A **production-ready** demonstration of the **ultimate-crud** npm package featuring comprehensive **JWT authentication, authorization, and security**. This implementation showcases enterprise-level features including multi-database support, validation systems, and custom primary key handling.

## 🔐 **Authentication-Focused Implementation**

This project has been **streamlined to focus on the `src/` implementation** with complete JWT authentication system. All authentication-related changes are contained within the `src/` folder for clarity and maintainability.

### ✅ **What's Fully Working**

**🏗️ **Core Ultimate CRUD Features**:**
- ✅ **Auto Schema Discovery**: Reads database schema and generates models automatically  
- ✅ **Multi-Database Support**: MySQL, PostgreSQL, SQLite with zero configuration
- ✅ **REST API Generation**: Complete CRUD endpoints for tables, views, procedures
- ✅ **GraphQL Support**: Full API for table operations with schema introspection
- ✅ **Custom Primary Keys**: Comprehensive support for any primary key naming convention

**🔐 **JWT Authentication System (NEW)**:**
- ✅ **JWT Tokens**: Access tokens (24h) and refresh tokens (7d) with secure signing
- ✅ **User Registration/Login**: Complete authentication flow with password hashing
- ✅ **Role-Based Access Control**: User and admin roles with granular permissions
- ✅ **Entity-Level Security**: Configurable protection per entity (public/authenticated/admin)
- ✅ **Rate Limiting**: Protection against brute force attacks and API abuse
- ✅ **Security Middleware**: Comprehensive authentication and authorization layers

**🛡️ **Production Security Features**:**
- ✅ **Password Security**: bcrypt hashing with configurable salt rounds
- ✅ **Token Security**: HMAC SHA256 signatures with issuer/audience validation
- ✅ **Error Handling**: Secure error messages with proper HTTP status codes
- ✅ **CORS Protection**: Cross-origin request handling and security headers
- ✅ **Validation testing**: Comprehensive test cases for all validation layers
- ✅ **Database operations**: Verified MySQL stored procedures and data integrity

### 📊 **Current Package Version & Known Limitations**

**Ultimate CRUD v1.0.0-alpha.2** - All core functionality working:
- ✅ **REST API**: Complete support for tables, views, procedures, custom queries
- ✅ **GraphQL**: Full support for table operations (CRUD, relationships)
- ⚠️ **GraphQL limitations**: Procedures, views, and custom queries not yet exposed in schema
- 🔧 **Workaround**: All missing GraphQL features work perfectly via REST endpoints

## 🚀 Quick Start

### 🌟 Main Implementation (Recommended)
Complete production-ready setup with validation and error handling:

```bash
cd src
npm install
npm start
```

Visit http://localhost:3000 to explore the API with comprehensive validation!

## 🚀 **Quick Start Guide**

### **📁 Project Structure (Focused Implementation)**
```
ultimate-crud-app/
├── src/                          # 🎯 Main implementation with JWT auth
│   ├── middleware/               # Authentication & security middleware
│   │   ├── auth.js              # JWT authentication middleware
│   │   ├── security.js          # Entity-level security configuration
│   │   └── validation.js        # Business logic validation
│   ├── routes/                   # Authentication routes
│   │   └── auth.js              # Login, register, refresh, profile
│   ├── docs/                     # Documentation
│   │   └── authentication.md    # Complete auth guide
│   ├── data/                     # Database schemas & migrations
│   └── model/                    # Entity definitions
├── articles/                     # Technical articles & analysis
└── _backup/                      # 📦 Moved unused folders here
    └── unused-folders/           # (Advanced, Simple, mysql, etc.)
```

### **⚡ One-Command Setup**
```bash
# Navigate to main implementation
cd src/

# Setup database and create admin user
npm run setup:full

# Start the server with authentication
npm start
```

### **🔐 Test Authentication (30 seconds)**
```bash
# 1. Login with admin user
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# 2. Copy the access_token from response

# 3. Access protected endpoint
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**🎉 You now have a production-ready CRUD API with JWT authentication!**

## 📋 **Implementation Summary**

This Ultimate CRUD application demonstrates enterprise-level features and best practices:

### **🏗️ Architecture & Setup**
- **Main Source Directory**: `src/` (renamed from Simple for clarity)
- **Multi-Database Support**: MySQL, PostgreSQL, SQLite with automated Docker setup
- **Environment Management**: Comprehensive `.env` configuration with examples
- **Documentation**: Complete setup guides and API documentation

### **🛡️ Validation System (Three Layers)**

#### **1. Database Level (Essential)**
```sql
-- Ensures data integrity at database level
CREATE TABLE users (
    username VARCHAR(50) NOT NULL UNIQUE,  -- Database constraint
    email VARCHAR(100) NOT NULL UNIQUE     -- Database constraint
);
```

#### **2. Entity Configuration (Required)**
```javascript
// Maps database constraints to proper API responses
{
  name: 'users',
  validation: {
    uniqueFields: ['username', 'email'],    // Links to DB constraints
    conflictStatusCode: 409                 // HTTP status for conflicts
  },
  responseMessages: {
    409: 'Username or email already exists'
  }
}
```

#### **3. Custom Middleware (Business Logic)**
```javascript
// Custom business rules (Gmail blocking, format validation, etc.)
app.use('/api/users', validateUserData);
```

### **🎯 Error Handling Results**
- **Unique Constraints**: `409 Conflict` with field-specific details
- **Business Rules**: `400 Bad Request` with detailed validation errors  
- **Multiple Errors**: Support for multiple validation failures
- **User-Friendly**: Clear field-level error messages

### **🧪 Features Demonstrated**
- ✅ **CRUD Operations**: Create, Read, Update, Delete with validation
- ✅ **Relationships**: One-to-many, many-to-many associations
- ✅ **Custom Queries**: Views, stored procedures, complex SQL
- ✅ **Authentication**: JWT-based authentication examples
- ✅ **Rate Limiting**: API protection and throttling
- ✅ **Testing**: Comprehensive validation and API testing

### **📡 API Support**
- **REST API**: Complete CRUD with all entities (tables, views, procedures)
- **GraphQL**: Full table operations (current limitation: procedures/views via REST only)
- **Documentation**: Auto-generated OpenAPI/Swagger documentation
- **Real-time**: WebSocket support for live updates

## 🎓 **Development Journey & Lessons Learned**

This project showcases the complete development lifecycle of a production-ready Ultimate CRUD application:

### **🔄 Project Evolution**
1. **Initial Setup**: Started with Simple and Advanced folder structure
2. **Focus Decision**: Consolidated to `src/` as main implementation (Advanced postponed)
3. **Package Updates**: Upgraded Ultimate CRUD from v1.0.0-alpha.1 to v1.0.0-alpha.2
4. **Validation Implementation**: Built comprehensive three-layer validation system
5. **Error Handling**: Implemented proper HTTP status codes and detailed error responses
6. **Testing & Validation**: Verified all functionality with comprehensive test cases

### **🛠️ Key Implementation Decisions**

#### **Folder Structure Simplification**
- **Decision**: Renamed `Simple/` to `src/` as primary implementation
- **Rationale**: Clearer naming, focused development, easier navigation
- **Impact**: Streamlined development process and documentation

#### **Three-Layer Validation Strategy**
- **Layer 1 (Database)**: Essential for data integrity and preventing race conditions
- **Layer 2 (Entity)**: Required for Ultimate CRUD to return proper HTTP status codes
- **Layer 3 (Middleware)**: Optional for custom business logic and user experience

#### **Package Version Upgrade Strategy**
- **Challenge**: Unique constraint validation issues in v1.0.0-alpha.1
- **Solution**: Upgraded to v1.0.0-alpha.2 with proper configuration
- **Result**: Proper 409 Conflict responses for duplicate data

### **🎯 Best Practices Demonstrated**

#### **Error Handling Philosophy**
```javascript
// Bad: Generic error responses
{ "error": "Bad Request" }

// Good: Field-specific, actionable error responses
{
  "error": "Username or email already exists",
  "details": {
    "fields": ["username"],
    "message": "username must be unique"
  }
}
```

#### **Validation Configuration Pattern**
```javascript
// Comprehensive entity configuration
{
  name: 'users',
  validation: {
    uniqueFields: ['username', 'email'],    // Database constraint mapping
    conflictStatusCode: 409                 // Proper HTTP status
  },
  responseMessages: {
    409: 'Username or email already exists',
    400: 'Invalid user data provided'
  }
}
```

#### **Middleware Design Pattern**
```javascript
// Separation of concerns: business logic vs data integrity
const validateUserData = (req, res, next) => {
  // Business rules (format, domains, custom logic)
  // Returns 400 for business rule violations
};

// Ultimate CRUD handles database constraints
// Returns 409 for unique constraint violations
```

### **📊 Performance & Scalability Considerations**
- **Database Constraints**: Prevent race conditions in high-concurrency scenarios
- **Middleware Validation**: Early validation reduces database load
- **Error Responses**: Detailed errors improve API usability and debugging
- **Multi-Database**: Flexibility for different deployment environments

### **🔍 Troubleshooting & Debugging Techniques**
1. **Port Conflicts**: Killed existing processes on port 3000
2. **Database Connections**: Verified MySQL service and authentication
3. **GraphQL Schema**: Used introspection to identify available queries
4. **Package Issues**: Updated Ultimate CRUD version to resolve validation bugs
5. **Testing Methodology**: Used curl commands for comprehensive API testing

## 📦 Package Features

The `ultimate-crud` package provides:

- **Automatic API Generation**: REST and GraphQL endpoints
- **Multiple Database Support**: MySQL, PostgreSQL, SQLite
- **Entity Relationships**: belongsTo, hasMany, belongsToMany
- **Custom SQL Queries**: Views, stored procedures, custom queries
- **Built-in Validation**: Request validation and response formatting
- **OpenAPI Documentation**: Automatic API documentation generation
- **Real-time Features**: GraphQL subscriptions and live queries

## 🗂️ Project Structure

```
ultimate-crud-app/
├── src/                   # 🌟 Main application source
│   ├── index.js           # Main application file
│   ├── model/entities.js  # Entity definitions (tables, views, procedures)
│   ├── data/              # Database schemas and sample data
│   ├── docker/            # Docker setup for databases
│   ├── package.json       # Dependencies
│   └── README.md          # Comprehensive setup guide
│
├── examples/              # 📚 Usage examples and tutorials
│   ├── basic-setup.js     # Basic ultimate-crud setup
│   ├── blog-api.js        # Blog API example
│   ├── ecommerce-api.js   # E-commerce example
│   └── README.md          # Example documentation
│
└── README.md              # This file
│   ├── sqlite/           # SQLite implementation
│   ├── bin/              # CLI tools
│   └── scripts/          # Setup utilities
│
└── examples/             # Original example files
```

## 🛠️ Prerequisites

- Node.js 16+ 
- npm or yarn
- Docker (optional, for database setup)

### Database Requirements

- **MySQL**: 5.7+ or 8.0+
- **PostgreSQL**: 12+
- **SQLite**: No additional setup required

## ⚡ Quick Start

### Simple Implementation (5 minutes)

```bash
# 1. Navigate to main implementation
cd src

# 2. Install dependencies
npm install

# 3. Set up database (automated setup available)
# For SQLite (fastest): npm run setup:sqlite
# For MySQL: npm run setup:mysql  
# For PostgreSQL: npm run setup:postgres

# 4. Start the application
npm start

# 5. Open browser
# REST API: http://localhost:3000/api
# GraphQL: http://localhost:3000/graphql
# Documentation: http://localhost:3000/docs
```

### Advanced Implementation (Full Setup)

```bash
# 1. Navigate to Advanced implementation
cd Advanced

# 2. Interactive setup
npm install
npm run setup
```

**Note**: The Advanced implementation is currently postponed as we focus on the complete src implementation.

## 🌟 Features Demonstrated

### Basic CRUD Operations
- Create, Read, Update, Delete operations
- Pagination and filtering
- Sorting and search functionality

### Advanced Features
- **Relationships**: One-to-many, many-to-many associations
- **Custom Queries**: Complex SQL queries and views
- **Stored Procedures**: Database-specific procedures
- **Validations**: Multiple validation layers (database, entity, middleware)
- **Error Handling**: Proper HTTP status codes and detailed error messages
- **Authentication**: JWT-based authentication examples
- **Rate Limiting**: API rate limiting implementations

## 🛡️ Validation & Error Handling

Ultimate CRUD provides a comprehensive validation system with multiple layers:

### **Layer 1: Database Constraints (Required)**
Database-level constraints ensure data integrity and prevent duplicates:
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,  -- Database constraint
    email VARCHAR(100) NOT NULL UNIQUE     -- Database constraint
);
```

### **Layer 2: Entity Configuration (Required)**
Maps database constraints to proper API error responses:
```javascript
{
  name: 'users',
  validation: {
    uniqueFields: ['username', 'email'],   // Maps to DB constraints
    conflictStatusCode: 409                // Proper HTTP status
  },
  responseMessages: {
    409: 'Username or email already exists' // Custom error message
  }
}
```

### **Layer 3: Custom Middleware (Optional)**
Business logic validation for custom rules:
```javascript
// Gmail blocking, format validation, business rules
app.use('/api/users', validateUserData);
```

### **Validation Results:**
- **Unique Constraints**: Returns `409 Conflict` with field-specific details
- **Business Rules**: Returns `400 Bad Request` with validation errors
- **Data Integrity**: Protected at all levels (database + application)

**Example Error Response:**
```json
{
  "error": "Username or email already exists",
  "details": {
    "fields": ["username"],
    "message": "username must be unique"
  }
}
```

## 🔑 Custom Primary Key Support

**Ultimate CRUD fully supports custom primary key names and types** through automatic schema discovery. You can use any primary key naming convention without configuration changes.

### **✅ Supported Primary Key Types**

#### **1. Custom Integer Primary Keys**
```sql
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,  -- Custom PK name
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);
```

**API Results:**
- ✅ `GET /api/products` - Returns all products with `product_id` field
- ✅ `GET /api/products/123` - Gets product by `product_id` value
- ✅ `POST /api/products` - Creates product (auto-generates `product_id`)

#### **2. UUID Primary Keys**
```sql
CREATE TABLE orders (
    order_uuid VARCHAR(36) PRIMARY KEY,  -- UUID as PK
    customer_name VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL
);
```

**API Results:**
- ✅ `GET /api/orders` - Returns all orders with `order_uuid` field
- ✅ `GET /api/orders/550e8400-e29b-41d4-a716-446655440001` - Gets order by UUID
- ✅ `POST /api/orders` - Creates order (requires UUID in request body)

#### **3. String Primary Keys**
```sql
CREATE TABLE inventory (
    location_code VARCHAR(10) PRIMARY KEY,  -- String PK
    warehouse_name VARCHAR(100) NOT NULL,
    capacity INT DEFAULT 0
);
```

**API Results:**
- ✅ `GET /api/inventory` - Returns all locations with `location_code` field
- ✅ `GET /api/inventory/WH01` - Gets location by code
- ✅ `POST /api/inventory` - Creates location (requires manual `location_code`)

#### **4. Compound Primary Keys**
```sql
CREATE TABLE order_items (
    order_uuid VARCHAR(36),
    product_id INT,
    quantity INT NOT NULL,
    PRIMARY KEY (order_uuid, product_id)  -- Compound PK
);
```

**API Results:**
- ✅ `GET /api/order-items` - Returns all items with both PK fields
- ✅ `POST /api/order-items` - Creates item (requires both PK values)

### **🔧 Zero Configuration Required**

```javascript
// This is ALL you need - no PK field specification!
{
  name: 'products',
  type: 'table',
  route: '/api/products'
  // Ultimate CRUD auto-detects product_id as primary key
}
```

**Ultimate CRUD automatically:**
- 🔍 **Detects** custom primary key names through schema discovery
- 🚀 **Generates** proper REST routes using detected primary keys
- 📊 **Preserves** custom field names in API responses
- 🎯 **Handles** all CRUD operations with correct primary key values

### **📊 API Response Examples**

**Custom Primary Key Response:**
```json
{
  "message": "Products retrieved successfully",
  "data": [
    {
      "product_id": 1,        // ← Custom PK name preserved
      "name": "Laptop",
      "price": "1000.00",
      "sku": "LAP001"
    }
  ]
}
```

**UUID Primary Key Response:**
```json
{
  "message": "Orders retrieved successfully",
  "data": [
    {
      "order_uuid": "550e8400-e29b-41d4-a716-446655440001",  // ← UUID PK
      "customer_name": "John Doe",
      "total_amount": "1109.97",
      "status": "completed"
    }
  ]
}
```

### **🎯 Best Practices**

**✅ Recommended:**
- Use descriptive, domain-specific primary key names (`product_id`, `order_uuid`, `customer_number`)
- Maintain consistent naming conventions across related tables
- Consider UUIDs for distributed systems or when global uniqueness is required

**⚠️ Considerations:**
- **Manual Primary Keys**: Must provide values in POST requests (UUIDs, strings)
- **Compound Primary Keys**: Individual record operations may need special handling
- **Performance**: String/UUID primary keys have different performance characteristics than integers

### **🧪 Testing Custom Primary Keys**

```bash
# Test auto-increment custom PK
curl http://localhost:3000/api/products
curl http://localhost:3000/api/products/1

# Test UUID PK
curl "http://localhost:3000/api/orders/550e8400-e29b-41d4-a716-446655440001"

# Test string PK
curl http://localhost:3000/api/inventory/WH01

# Test creation with manual PK
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "order_uuid": "550e8400-e29b-41d4-a716-446655440999",
    "customer_name": "Test Customer",
    "total_amount": 99.99
  }'
```

**Result:** Ultimate CRUD adapts to your database schema, not the other way around. Use meaningful primary key names that fit your business domain!

### **📚 Complete Analysis Available**

For comprehensive details including:
- **Complete test results** with all scenarios tested
- **Best practices** for database design with custom primary keys  
- **Migration strategies** from standard `id` to custom primary keys
- **Performance considerations** and limitations
- **Real-world examples** from e-commerce and SaaS applications

See:
- **Detailed Implementation**: [`src/README.md`](src/README.md#-custom-primary-key-support-tested--verified-) 
- **Complete Analysis**: [`articles/custom-primary-key-analysis.md`](articles/custom-primary-key-analysis.md)

### API Types
- **REST API**: Traditional REST endpoints
- **GraphQL**: Query and mutation operations
- **Real-time**: WebSocket connections and subscriptions

### Documentation
- **OpenAPI/Swagger**: Auto-generated API documentation
- **Schema Introspection**: GraphQL schema exploration
- **Postman Collections**: Ready-to-use API collections

## 📖 Documentation

- [Configuration Guide](./config/README.md)
- [Entity Definitions](./config/entities/README.md)
- [Migration System](./config/migrations/README.md)
- [Testing Guide](./config/tests/README.md)

## 🧪 Testing

### **Comprehensive Validation Testing**

The application includes extensive testing for all validation layers:

#### **Unique Constraint Testing (409 Conflict)**
```bash
# Test duplicate username
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "email": "new@example.com"}'

# Expected: 409 Conflict with field-specific details
```

#### **Business Logic Testing (400 Bad Request)**
```bash
# Test Gmail blocking
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@gmail.com"}'

# Expected: 400 Bad Request with validation errors
```

#### **Multiple Validation Errors**
```bash
# Test multiple failures
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "A", "slug": "Invalid@Slug!"}'

# Expected: 400 Bad Request with multiple error details
```

### **API Functionality Testing**
```bash
# Test REST API endpoints
curl http://localhost:3000/api/users              # Get all users
curl http://localhost:3000/api/categories         # Get all categories
curl -X POST http://localhost:3000/api/user-summary # Stored procedure

# Test GraphQL
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ usersList { id username email } }"}'
```

### **Database-Specific Testing**
Run tests for all database implementations:

```bash
# Run all tests
npm test

# Run specific database tests
npm run test:mysql
npm run test:postgresql
npm run test:sqlite
```

## 🚀 **Quick Reference for Developers**

### **Essential Commands**
```bash
# Setup and start (fastest)
cd src && npm install && npm start

# With specific database
npm run setup:mysql && npm run start:mysql
npm run setup:postgres && npm run start:postgres
npm run setup:sqlite && npm run start:sqlite

# Development mode (auto-reload)
npm run dev
```

### **Testing Validation Layers**
```bash
# Layer 1: Database constraints (automatic)
# Layer 2: Entity configuration (automatic)
# Layer 3: Custom middleware
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "ab", "email": "test@gmail.com"}'
```

### **Key API Endpoints**
- **REST Base**: `http://localhost:3000/api`
- **GraphQL**: `http://localhost:3000/graphql`
- **Health Check**: `http://localhost:3000/health`
- **Stored Procedures**: `POST /api/user-summary`
- **Custom Queries**: `GET /api/popular-posts`

### **Configuration Files**
- **Entities**: `src/model/entities.js` (database mapping + validation)
- **Middleware**: `src/middleware/validation.js` (business rules)
- **Environment**: `src/.env` (database configuration)
- **Docker**: `src/docker/` (automated database setup)

## ⚠️ Known Issues

### GraphQL Schema Limitations (Ultimate CRUD v1.0.0-alpha.2)

The current version of Ultimate CRUD has some limitations in GraphQL schema generation:

**✅ Working in GraphQL:**
- Table entities (CRUD operations): `usersList`, `users`, `postsList`, `posts`, etc.
- Basic queries and mutations for database tables
- Associations and relationships between tables

**❌ Not Currently Exposed in GraphQL:**
- Stored procedures (e.g., `user_summary`) 
- Custom SQL queries (e.g., `popular_posts`, `recent_posts`)
- Database views (e.g., `post_stats`, `user_analytics`)
- Complex parameterized queries

**🔧 Workaround:**
All functionality works perfectly through REST API endpoints:
- `POST /api/user-summary` - Stored procedure calls
- `GET /api/popular-posts` - Custom queries  
- `GET /api/post-stats` - Database views

**Status:**
These limitations are being addressed in future versions of Ultimate CRUD. The GraphQL schema generation will be enhanced to support all entity types including procedures, views, and custom queries.

### ✅ Resolved Issues (v1.0.0-alpha.2)

**Unique Constraint Validation - FIXED ✅**
- **Issue**: Unique constraint violations returned generic 400 errors
- **Resolution**: Now returns proper 409 Conflict status with field-specific details
- **Configuration**: Requires explicit `procedure` property for stored procedures and `uniqueFields` for constraints

**Example Working Configuration:**
```javascript
{
  name: 'users',
  validation: {
    uniqueFields: ['username', 'email'],
    conflictStatusCode: 409
  },
  responseMessages: {
    409: 'Username or email already exists'
  }
}
```

**Example Working Response:**
```json
{
  "error": "Username or email already exists",
  "details": {
    "fields": ["username"],
    "message": "username must be unique"
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Ultimate CRUD NPM Package](https://www.npmjs.com/package/ultimate-crud)
- [Documentation](https://github.com/ultimate-crud/docs)
- [Examples Repository](https://github.com/ultimate-crud/examples)

---

**Happy Coding! 🎉**
