# Ultimate CRUD App

A comprehensive demonstration application showcasing the **ultimate-crud** npm package functionality with both simple and advanced implementations.

## 🚀 Quick Start

### 🌟 Main Implementation (Recommended)
Perfect for learning and getting started quickly:

```bash
cd src
npm install
npm start
```

Visit http://localhost:3000 to explore the API!

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
- **Validations**: Request/response validation
- **Authentication**: JWT-based authentication examples
- **Rate Limiting**: API rate limiting implementations

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

Run tests for all database implementations:

```bash
# Run all tests
npm test

# Run specific database tests
npm run test:mysql
npm run test:postgresql
npm run test:sqlite
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
