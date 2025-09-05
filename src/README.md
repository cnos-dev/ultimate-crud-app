# Ultimate CRUD Simple Blog App

A comprehensive blog application demonstrating the power of the **Ultimate CRUD** package. This implementation shows how Ultimate CRUD can automatically generate REST APIs and GraphQL endpoints by reading your database schema.

## 🚀 Key Features

- **Automatic Schema Discovery**: Ultimate CRUD reads your database schema and generates models automatically
- **Multi-Database Support**: Works with MySQL, PostgreSQL, and SQLite
- **REST API Generation**: Automatic CRUD endpoints for all tables
- **GraphQL Support**: Full GraphQL API with queries and mutations
- **Database Views**: Read-only endpoints for complex aggregated data
- **Stored Procedures**: Custom business logic endpoints
- **OpenAPI Documentation**: Auto-generated API documentation
- **Docker Integration**: Complete containerization with management tools
- **Automated Setup**: One-command database setup for all supported databases

## 📁 Project Structure

```
src/
├── index.js                  # Main application entry point
├── package.json             # Dependencies and npm scripts
├── setup-db.sh             # Database setup automation script
├── .env                     # Environment configuration
├── .env.example             # Environment template
├── blog.db                  # SQLite database file (auto-generated)
├── model/
│   └── entities.js          # Entity definitions (tables, views, procedures)
├── data/
│   ├── database-mysql.sql   # MySQL schema with procedures
│   ├── database-postgresql.sql # PostgreSQL schema with functions
│   └── database-sqlite.sql # SQLite schema with queries
└── docker/
    ├── docker-compose.yml         # Complete setup (both databases)
    ├── docker-compose.mysql.yml   # MySQL only + phpMyAdmin
    ├── docker-compose.postgres.yml # PostgreSQL only + pgAdmin
    └── README.md                   # Docker setup guide
```

## 🛠 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database (Choose One)

**🚀 Fastest Start - SQLite (No Docker needed):**
```bash
npm run setup:sqlite
npm run start:sqlite
```

**🐳 Docker - MySQL:**
```bash
npm run setup:mysql
npm run start:mysql
```

**🐳 Docker - PostgreSQL:**
```bash
npm run setup:postgres
npm run start:postgres
```

**🐳 Docker - Both Databases:**
```bash
npm run setup:both
# Choose database and start
npm run start:mysql     # or
npm run start:postgres  # or
npm start               # (uses .env DB_DIALECT setting)
```

### 3. Access the Application

Once started, the application will be available at:
- **API Base**: http://localhost:3000/api
- **GraphQL Playground**: http://localhost:3000/graphql
- **Health Check**: http://localhost:3000/health

## 📋 Available NPM Scripts

### Database Setup Scripts
```bash
npm run setup           # Default SQLite setup
npm run setup:sqlite    # SQLite setup
npm run setup:mysql     # MySQL with Docker
npm run setup:postgres  # PostgreSQL with Docker
npm run setup:both      # Both databases with Docker
```

### Database Management
```bash
npm run db:status       # Show Docker container status
npm run db:stop         # Stop all containers
npm run db:reset        # Stop and remove all data
npm run db:logs         # View container logs
```

### Application Scripts
```bash
npm start               # Start with default database (from .env)
npm run start:sqlite    # Start with SQLite
npm run start:mysql     # Start with MySQL
npm run start:postgres  # Start with PostgreSQL
npm run dev             # Start with nodemon (auto-reload)
npm run dev:sqlite      # Development mode with SQLite
npm run dev:mysql       # Development mode with MySQL
npm run dev:postgres    # Development mode with PostgreSQL
npm test                # Show setup instructions
```

## 🗄 Database Schemas

Each database has optimized schemas with database-specific features:

### MySQL (`data/database-mysql.sql`)
- Full CRUD tables with foreign keys
- Optimized indexes and full-text search
- Native stored procedures
- Auto-updating timestamps
- ENUM types for status fields

### PostgreSQL (`data/database-postgresql.sql`)
- SERIAL primary keys and custom types
- Advanced triggers for timestamps
- Functions instead of procedures
- Full-text search with GIN indexes
- Advanced data types and constraints

### SQLite (`data/database-sqlite.sql`)
- INTEGER PRIMARY KEY AUTOINCREMENT
- CHECK constraints for enums
- Virtual FTS5 tables for search
- Triggers for maintenance
- Query-based procedures (since SQLite doesn't support stored procedures)

### Core Database Schema

#### Tables
- **users** - User accounts and profiles with authentication
- **categories** - Post categories with metadata and colors
- **posts** - Blog posts with rich content and publishing workflow
- **comments** - Nested comment system with approval workflow

#### Views
- **post_stats** - Aggregated post performance metrics and engagement
- **user_analytics** - User activity summaries and statistics
- **category_summary** - Category performance and post counts

#### Procedures/Functions
- **user_summary(user_id)** - Detailed user activity summary
- **popular_posts(days_back, limit_count)** - Popular posts with ranking algorithm

## 🌐 API Endpoints

### REST API

**Tables (Full CRUD):**
- `GET/POST /api/users` - User management
- `GET/PUT/DELETE /api/users/:id` - Individual user operations
- `GET/POST /api/categories` - Category management  
- `GET/PUT/DELETE /api/categories/:id` - Individual category operations
- `GET/POST /api/posts` - Post management
- `GET/PUT/DELETE /api/posts/:id` - Individual post operations
- `GET/POST /api/comments` - Comment management
- `GET/PUT/DELETE /api/comments/:id` - Individual comment operations

**Views (Read-only Analytics):**
- `GET /api/post-stats` - Post statistics with engagement metrics
- `GET /api/user-analytics` - User engagement analytics
- `GET /api/category-summary` - Category performance summary

**Custom Queries:**
- `GET /api/recent-posts` - Latest published posts
- `GET /api/search-posts?search_term=keyword` - Full-text search

**Procedures (Custom Operations):**
- `POST /api/user-summary` - Get detailed user summary (body: {user_id: 1})
- `POST /api/popular-posts` - Get popular posts with parameters (body: {days_back: 30, limit_count: 10})

### GraphQL

Access the GraphQL playground at `http://localhost:3000/graphql`

**Key Features:**
- Full schema auto-generated from database
- Interactive playground enabled
- Automatic relationship resolution
- Real-time introspection

**Available Queries:**
- `usersList`, `users` - User data queries
- `postsList`, `posts` - Post data queries  
- `categoriesList`, `categories` - Category data queries
- `commentsList`, `comments` - Comment data queries

**Example Queries:**

```graphql
# Get all users (working query)
query {
  usersList {
    id
    username
    email
    firstName
    lastName
    bio
  }
}

# Get all posts
query {
  postsList {
    id
    title
    content
    status
  }
}

# Get all categories
query {
  categoriesList {
    id
    name
    slug
    description
  }
}

# Get all comments
query {
  commentsList {
    id
    content
    status
  }
}
```

## 🐳 Docker Management

### Management Interfaces
When using Docker, you get access to web-based database management tools:
- **Adminer**: http://localhost:8080 (universal database tool)
- **phpMyAdmin**: http://localhost:8081 (MySQL management)
- **pgAdmin**: http://localhost:8082 (PostgreSQL management)

### Container Commands
```bash
# Start specific database
docker-compose -f docker/docker-compose.mysql.yml up -d
docker-compose -f docker/docker-compose.postgres.yml up -d

# Check status
docker ps --filter "name=ultimate-crud"

# View logs
docker-compose -f docker/docker-compose.mysql.yml logs -f

# Stop and clean up
docker-compose -f docker/docker-compose.mysql.yml down -v
```

### Database Credentials (Docker)
- **Username**: `bloguser`
- **Password**: `blogpassword`
- **Database**: `ultimate_crud_blog`
- **Root/Admin Password**: `rootpassword` (MySQL)

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Database Selection
DB_DIALECT=sqlite|mysql|postgres

# MySQL (Docker)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ultimate_crud_blog
DB_USER=bloguser
DB_PASS=blogpassword

# PostgreSQL (Docker)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ultimate_crud_blog
DB_USER=bloguser
DB_PASS=blogpassword

# SQLite
SQLITE_PATH=./blog.db

# Application Settings
NODE_ENV=development
PORT=3000

# Ultimate CRUD Features
ENABLE_REST_API=true
ENABLE_GRAPHQL=true
ENABLE_ADMIN_UI=true
API_PREFIX=/api
GRAPHQL_ENDPOINT=/graphql
```

## 📊 Entity Types Explained

This application demonstrates all Ultimate CRUD entity types:

### 1. Tables (`type: 'table'`)
- **Purpose**: Standard CRUD operations on database tables
- **Schema**: Auto-discovered from database
- **Examples**: `users`, `posts`, `categories`, `comments`

```javascript
{
  name: 'users',
  type: 'table',
  route: '/api/users',
  // Schema auto-discovered from database
  // Only associations and custom config needed
}
```

### 2. Views (`type: 'view'`)
- **Purpose**: Read-only access to database views
- **Schema**: Auto-discovered from database view definition
- **Examples**: `post_stats`, `user_analytics`, `category_summary`

```javascript
{
  name: 'post_stats',
  type: 'view',
  route: '/api/post-stats',
  // References the post_stats view in database
  // Schema auto-discovered from view definition
}
```

### 3. Custom Queries (`type: 'query'`)
- **Purpose**: Custom SQL queries with explicit SQL statements
- **Schema**: Defined by SQL query results
- **Examples**: `recent_posts`, `search_posts`

```javascript
{
  name: 'recent_posts',
  type: 'query',
  route: '/api/recent-posts',
  sql: `
    SELECT p.id, p.title, u.username as author
    FROM posts p
    JOIN users u ON p.userId = u.id
    WHERE p.status = 'published'
    ORDER BY p.publishedAt DESC
    LIMIT 10
  `
}
```

### 4. Stored Procedures (`type: 'procedure'`)
- **Purpose**: Execute existing stored procedures in database
- **Parameters**: Defined in entity configuration
- **Examples**: `user_summary`, `popular_posts`

```javascript
{
  name: 'user_summary',
  type: 'procedure',
  route: '/api/user-summary',
  // Calls existing user_summary procedure in database
  parameters: [
    {
      name: 'user_id',
      type: 'INTEGER',
      required: true
    }
  ]
}
```

### GraphQL

Access the GraphQL playground at `http://localhost:3000/graphql`

**Example Queries:**

```graphql
# Get all users with their posts
query {
  users {
    id
    username
    email
    posts {
      id
      title
      status
    }
  }
}

# Get posts with authors and categories
query {
  posts {
    id
    title
    content
    author {
      username
      email
    }
    category {
      name
      slug
    }
    comments {
      id
      content
      user {
        username
      }
    }
  }
}
```

## 🗄 Database Schema

The application uses a complete blog schema with database-specific implementations:

### Database Files
- **`database-mysql.sql`** - MySQL/MariaDB optimized schema with procedures and full-text search
- **`database-postgresql.sql`** - PostgreSQL schema with functions and advanced triggers
- **`database-sqlite.sql`** - SQLite schema with virtual FTS tables and query-based procedures

### Tables
- **users** - User accounts and profiles
- **categories** - Post categories with metadata
- **posts** - Blog posts with rich content
- **comments** - Nested comments with approval system

### Views
- **post_stats** - Aggregated post performance metrics
- **user_analytics** - User engagement and activity analytics
- **category_summary** - Category performance summaries

### Procedures/Functions
- **user_summary(user_id)** - Detailed user activity summary
- **popular_posts(days_back, limit_count)** - Popular posts with ranking

**Note:** SQLite doesn't support stored procedures, so these are implemented as parameterized queries in the application code.

## 🧪 Testing the Setup

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Test REST API
```bash
# Get all users
curl http://localhost:3000/api/users

# Create a new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","firstName":"Test","lastName":"User"}'

# Get user analytics
curl http://localhost:3000/api/user-analytics

# Get post statistics
curl http://localhost:3000/api/post-stats
```

### 3. Test GraphQL
```bash
curl http://localhost:3000/graphql \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ users { id username email } }"}'
```

### 4. Test Procedures
```bash
# User summary
curl -X POST http://localhost:3000/api/user-summary \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1}'

# Popular posts
curl -X POST http://localhost:3000/api/popular-posts \
  -H "Content-Type: application/json" \
  -d '{"days_back": 7, "limit_count": 5}'
```

## 📚 Key Features Demonstrated

### 1. Schema Auto-Discovery
- No field definitions needed in entities
- Ultimate CRUD reads database structure automatically
- Automatic relationship detection from foreign keys
- Dynamic model generation

### 2. Multi-Database Support
- Single codebase works with MySQL, PostgreSQL, and SQLite
- Database-specific optimizations and features
- Easy switching via environment configuration
- Optimized queries for each database type

### 3. Advanced Database Features
- **Views**: Complex analytics with read-only endpoints
- **Stored Procedures/Functions**: Custom business logic with parameters
- **Full-text Search**: Database-optimized search capabilities
- **Proper Indexing**: Performance-optimized database schemas

### 4. Development Experience
- **Docker Integration**: Easy database setup with management tools
- **Automated Setup Scripts**: One-command database initialization
- **Hot Reload**: Development mode with automatic restart
- **Comprehensive Documentation**: API docs and interactive GraphQL playground

### 5. Production-Ready Features
- **Environment Configuration**: Flexible deployment settings
- **Error Handling**: Comprehensive error reporting and logging
- **Health Monitoring**: Built-in health check endpoints
- **API Documentation**: Auto-generated OpenAPI specifications

## 🔄 Development Workflow

1. **Choose Database**: Run setup script for your preferred database
2. **Develop**: Use `npm run dev` for auto-reload development
3. **Test**: Use management interfaces to inspect and modify data
4. **Deploy**: Update environment configuration for production database

## 🛠 Troubleshooting

### Common Issues

1. **Port Conflicts**: 
   - Modify docker-compose ports if needed
   - Check if ports 3000, 3306, 5432, 8080-8082 are available

2. **Permission Errors**: 
   - Check file permissions on SQL files
   - Ensure setup script is executable: `chmod +x setup-db.sh`

3. **Connection Issues**: 
   - Verify Docker containers are healthy: `npm run db:status`
   - Check database credentials in .env file

4. **Schema Errors**: 
   - Verify database-specific SQL syntax
   - Check if database initialization completed successfully

### Logs and Debugging

```bash
# Application logs
npm start

# Docker container logs
npm run db:logs

# Container status
npm run db:status

# Reset everything and start fresh
npm run db:reset
npm run setup:sqlite
npm start
```

### Database-Specific Troubleshooting

**SQLite Issues:**
- Check if blog.db file has proper permissions
- Verify SQLite version supports FTS5

**MySQL Issues:**
- Ensure Docker container is running: `docker ps`
- Check MySQL logs: `docker logs ultimate-crud-mysql`
- Verify port 3306 is not blocked

**PostgreSQL Issues:**
- Check PostgreSQL container status
- Verify port 5432 connectivity
- Check pgAdmin access at http://localhost:8082

## 🚀 Production Considerations

### 1. Security
```javascript
// Add authentication middleware to entities
middleware: {
  auth: true,
  permissions: ['read', 'write']
}
```

### 2. Performance
- **Database Connection Pooling**: Configured automatically by Sequelize
- **Query Optimization**: Use database-specific indexes and constraints
- **Caching Strategies**: Implement Redis or in-memory caching for frequent queries
- **Rate Limiting**: Add API rate limiting for production environments

### 3. Monitoring
- **Health Check Endpoints**: Built-in `/health` endpoint
- **Request Logging**: Morgan middleware for HTTP request logging
- **Error Tracking**: Comprehensive error handling and reporting
- **Performance Metrics**: Monitor database query performance

### 4. Deployment
```bash
# Production environment setup
NODE_ENV=production
npm ci --only=production
npm start
```

**Docker Deployment:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 How Ultimate CRUD Works

1. **Schema Discovery**: Ultimate CRUD automatically reads your database schema
2. **Model Generation**: Creates Sequelize models from discovered tables  
3. **API Generation**: Generates REST endpoints and GraphQL types automatically
4. **Association Detection**: Detects foreign key relationships automatically
5. **Custom Configuration**: Allows custom routes, associations, and business logic

### Entity Configuration

The `entities.js` file only needs to specify:
- Entity type (`table`, `view`, `procedure`, `query`)
- Custom routes (optional)
- Custom associations (optional)  
- Response messages (optional)
- SQL for views and procedures

**No field definitions needed!** Ultimate CRUD discovers the schema automatically.

## 📚 Learn More

- **Ultimate CRUD Documentation**: [npm package](https://www.npmjs.com/package/ultimate-crud)
- **Advanced Examples**: Advanced implementation is postponed for future development
- **GraphQL**: Visit `/graphql` for interactive schema exploration
- **Docker Guide**: See `docker/README.md` for detailed Docker setup instructions

## 🤝 Contributing

This is a demonstration project. For the main Ultimate CRUD package:
1. Fork the repository
2. Create your feature branch
3. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Ultimate CRUD Simple Blog** - A complete demonstration of database-to-API automation with multi-database support and Docker integration! 🚀
