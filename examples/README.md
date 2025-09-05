# Ultimate CRUD Examples

This directory contains example implementations showcasing different use cases and configurations for Ultimate CRUD.

## Examples

### 1. Basic Setup (`basic-setup.js`)
A minimal example showing the basic configuration and usage of Ultimate CRUD with MySQL.

**Features:**
- Basic table entities (users, posts)
- Simple associations
- Custom response messages

**Run:**
```bash
node examples/basic-setup.js
```

### 2. Blog API (`blog-api.js`)
A comprehensive blog API implementation using PostgreSQL with advanced features.

**Features:**
- Multiple entity types (tables, views, queries, procedures)
- Complex associations (belongsTo, hasMany)
- Custom SQL queries
- Stored procedure integration
- PostgreSQL schema support

**Database Setup:**

#### PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE blog_db;

-- Example tables
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  author_id INTEGER REFERENCES users(id),
  category_id INTEGER REFERENCES categories(id),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id),
  user_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example view
CREATE VIEW post_stats AS
SELECT 
  p.id,
  p.title,
  u.username as author,
  COUNT(c.id) as comment_count,
  p.views
FROM posts p
LEFT JOIN users u ON p.author_id = u.id
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY p.id, p.title, u.username, p.views;

-- Example function (PostgreSQL)
CREATE OR REPLACE FUNCTION generate_user_activity_report(user_id INTEGER)
RETURNS TABLE(
  posts_count INTEGER,
  comments_count INTEGER,
  total_views INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM posts WHERE author_id = user_id),
    (SELECT COUNT(*)::INTEGER FROM comments WHERE user_id = user_id),
    (SELECT COALESCE(SUM(views), 0)::INTEGER FROM posts WHERE author_id = user_id);
END;
$$ LANGUAGE plpgsql;
```

#### MySQL Setup
```sql
-- Create database
CREATE DATABASE blog_db;
USE blog_db;

-- Example tables
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  author_id INT,
  category_id INT,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT,
  user_id INT,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Example view
CREATE VIEW post_stats AS
SELECT 
  p.id,
  p.title,
  u.username as author,
  COUNT(c.id) as comment_count,
  p.views
FROM posts p
LEFT JOIN users u ON p.author_id = u.id
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY p.id, p.title, u.username, p.views;

-- Example stored procedure (MySQL)
DELIMITER //
CREATE PROCEDURE generate_user_activity_report(IN input_user_id INT)
BEGIN
  SELECT 
    (SELECT COUNT(*) FROM posts WHERE author_id = input_user_id) as posts_count,
    (SELECT COUNT(*) FROM comments WHERE user_id = input_user_id) as comments_count,
    (SELECT COALESCE(SUM(views), 0) FROM posts WHERE author_id = input_user_id) as total_views;
END //
DELIMITER ;
```

**Run:**
```bash
DB_HOST=localhost DB_NAME=blog_db DB_USER=postgres DB_PASS=password node examples/blog-api.js
```

### 3. E-commerce API (`ecommerce-api.js`)
A complete e-commerce API using SQLite, perfect for development and testing.

**Features:**
- E-commerce entities (customers, products, orders, etc.)
- Inventory management
- Sales reporting
- Popular products tracking
- SQLite database (no setup required)

**Run:**
```bash
node examples/ecommerce-api.js
```

## Environment Variables

All examples support the following environment variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306          # 5432 for PostgreSQL
DB_NAME=your_database
DB_USER=your_username
DB_PASS=your_password

# Server Configuration
PORT=3000
```

## Testing the Examples

### 1. Using cURL

```bash
# Get all users
curl http://localhost:3000/api/users

# Create a new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "email": "john@example.com"}'

# Get user by ID
curl http://localhost:3000/api/users/1

# Update user
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"username": "john_updated"}'

# Delete user
curl -X DELETE http://localhost:3000/api/users/1
```

## Working with Associations in REST

Ultimate CRUD automatically generates REST endpoints for managing associations between entities. Here's how to work with them:

### Association Types Supported

#### 1. belongsTo Association
When a model belongs to another (e.g., Post belongs to User):

```javascript
// Entity configuration
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
```

**REST Endpoints Generated:**
```bash
# Get post with author information
GET /api/posts/1?include=author

# Response includes associated data
{
  "id": 1,
  "title": "My First Post",
  "content": "Post content...",
  "userId": 5,
  "author": {
    "id": 5,
    "username": "john_doe",
    "email": "john@example.com"
  }
}

# Create post with association
POST /api/posts
{
  "title": "New Post",
  "content": "Content here...",
  "userId": 5  // Reference to existing user
}
```

#### 2. hasMany Association
When a model has many of another (e.g., User has many Posts):

```javascript
// Entity configuration
{
  name: 'users',
  type: 'table',
  route: '/api/users',
  associations: [
    {
      type: 'hasMany',
      target: 'posts',
      foreignKey: 'userId',
      as: 'posts'
    }
  ]
}
```

**REST Endpoints Generated:**
```bash
# Get user with all their posts
GET /api/users/1?include=posts

# Response includes associated data
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "posts": [
    {
      "id": 1,
      "title": "First Post",
      "content": "Content...",
      "userId": 1
    },
    {
      "id": 2,
      "title": "Second Post",
      "content": "More content...",
      "userId": 1
    }
  ]
}

# Get user's posts directly
GET /api/users/1/posts

# Create a new post for a specific user
POST /api/users/1/posts
{
  "title": "New Post for User",
  "content": "This will automatically set userId to 1"
}
```

#### 3. hasOne Association
When a model has one of another (e.g., User has one Profile):

```javascript
// Entity configuration
{
  name: 'users',
  type: 'table',
  route: '/api/users',
  associations: [
    {
      type: 'hasOne',
      target: 'profiles',
      foreignKey: 'userId',
      as: 'profile'
    }
  ]
}
```

**REST Endpoints Generated:**
```bash
# Get user with profile
GET /api/users/1?include=profile

# Get user's profile directly
GET /api/users/1/profile

# Create profile for user
POST /api/users/1/profile
{
  "bio": "User biography",
  "avatar": "avatar.jpg"
}

# Update user's profile
PUT /api/users/1/profile
{
  "bio": "Updated biography"
}
```

#### 4. belongsToMany Association (Many-to-Many)
When models have a many-to-many relationship (e.g., User belongs to many Roles):

```javascript
// Entity configuration
{
  name: 'users',
  type: 'table',
  route: '/api/users',
  associations: [
    {
      type: 'belongsToMany',
      target: 'roles',
      through: 'user_roles',
      foreignKey: 'userId',
      otherKey: 'roleId',
      as: 'roles'
    }
  ]
}
```

**REST Endpoints Generated:**
```bash
# Get user with all roles
GET /api/users/1?include=roles

# Get user's roles directly
GET /api/users/1/roles

# Add role to user
POST /api/users/1/roles
{
  "roleId": 3
}

# Remove role from user
DELETE /api/users/1/roles/3

# Replace all user roles
PUT /api/users/1/roles
{
  "roleIds": [1, 2, 4]
}
```

### Advanced Association Queries

#### Including Multiple Associations
```bash
# Include multiple related entities
GET /api/posts/1?include=author,comments,category

# Include nested associations
GET /api/posts/1?include=author,comments.user

# Response with nested data
{
  "id": 1,
  "title": "My Post",
  "content": "Content...",
  "author": {
    "id": 5,
    "username": "john_doe"
  },
  "comments": [
    {
      "id": 1,
      "content": "Great post!",
      "user": {
        "id": 3,
        "username": "jane_doe"
      }
    }
  ],
  "category": {
    "id": 2,
    "name": "Technology"
  }
}
```

#### Filtering by Associations
```bash
# Get posts by specific author
GET /api/posts?filter[author.username]=john_doe

# Get users with specific role
GET /api/users?include=roles&filter[roles.name]=admin

# Get posts in specific category
GET /api/posts?include=category&filter[category.name]=technology
```

#### Sorting by Associations
```bash
# Sort posts by author name
GET /api/posts?include=author&sort=author.username

# Sort users by latest post
GET /api/users?include=posts&sort=-posts.createdAt
```

#### Pagination with Associations
```bash
# Paginate posts with authors
GET /api/posts?include=author&page=1&limit=10

# Paginate user's posts
GET /api/users/1/posts?page=2&limit=5
```

### Complex Association Examples

#### Blog Example with Multiple Associations
```bash
# Get post with all related data
GET /api/posts/1?include=author,category,comments.user,tags

# Create post with associations
POST /api/posts
{
  "title": "New Blog Post",
  "content": "Post content here...",
  "userId": 5,        // belongsTo association
  "categoryId": 2,    // belongsTo association
  "tagIds": [1, 3, 5] // belongsToMany association
}

# Update post associations
PUT /api/posts/1/tags
{
  "tagIds": [2, 4, 6]  // Replace all tags
}

# Add single tag to post
POST /api/posts/1/tags
{
  "tagId": 7
}
```

#### E-commerce Example
```bash
# Get order with customer and items
GET /api/orders/1?include=customer,items.product

# Get customer with orders and addresses
GET /api/customers/1?include=orders,addresses

# Create order with items
POST /api/orders
{
  "customerId": 5,
  "status": "pending",
  "items": [
    {
      "productId": 10,
      "quantity": 2,
      "price": 25.99
    },
    {
      "productId": 15,
      "quantity": 1,
      "price": 49.99
    }
  ]
}
```

### Error Handling for Associations

#### Common Association Errors
```bash
# Invalid foreign key
POST /api/posts
{
  "title": "Test Post",
  "userId": 999  // Non-existent user
}

# Response: 400 Bad Request
{
  "error": "Foreign key constraint failed",
  "details": "User with id 999 does not exist"
}

# Missing required association
POST /api/posts
{
  "title": "Test Post"
  // Missing required userId
}

# Response: 400 Bad Request
{
  "error": "Validation error",
  "details": "userId cannot be null"
}
```

### Association Configuration Tips

#### 1. Define Both Sides of the Relationship
```javascript
// User entity
{
  name: 'users',
  associations: [
    {
      type: 'hasMany',
      target: 'posts',
      foreignKey: 'userId',
      as: 'posts'
    }
  ]
}

// Post entity
{
  name: 'posts',
  associations: [
    {
      type: 'belongsTo',
      target: 'users',
      foreignKey: 'userId',
      as: 'author'
    }
  ]
}
```

#### 2. Use Meaningful Aliases
```javascript
{
  type: 'belongsTo',
  target: 'users',
  foreignKey: 'authorId',
  as: 'author'  // Use 'author' instead of 'user' for clarity
}
```

#### 3. Handle Cascade Operations
```javascript
{
  name: 'users',
  associations: [
    {
      type: 'hasMany',
      target: 'posts',
      foreignKey: 'userId',
      as: 'posts',
      onDelete: 'CASCADE'  // Delete posts when user is deleted
    }
  ]
}
```

### Performance Considerations

#### 1. Use Selective Including
```bash
# Instead of including all associations
GET /api/posts?include=author,comments,category,tags

# Include only what you need
GET /api/posts?include=author,category
```

#### 2. Paginate Association Collections
```bash
# Paginate user's posts
GET /api/users/1/posts?page=1&limit=10

# Instead of loading all posts at once
GET /api/users/1?include=posts
```

#### 3. Use Projection for Large Objects
```bash
# Select specific fields from associations
GET /api/posts?include=author&fields=title,content&fields[author]=username,email
```

### 2. Using GraphQL

Visit `http://localhost:3000/graphql` in your browser to access GraphiQL playground.

Example queries:
```graphql
# Get all users
query {
  usersList {
    id
    username
    email
  }
}

# Create a user
mutation {
  createusers(input: {
    username: "jane_doe"
    email: "jane@example.com"
  }) {
    id
    username
    email
  }
}

# Get posts with authors (if using blog example)
query {
  postsList {
    id
    title
    author {
      username
    }
    comments {
      content
      user {
        username
      }
    }
  }
}
```

### 3. OpenAPI Documentation

Visit the OpenAPI endpoint to see the auto-generated API documentation:
- `http://localhost:3000/openapi.json`

You can import this into tools like:
- Swagger UI
- Postman
- Insomnia
- API testing tools

## Common Issues and Solutions

### Database Connection Issues
```bash
# MySQL
npm install mysql2

# PostgreSQL
npm install pg pg-hstore

# SQLite (included with sequelize)
# No additional installation required
```

### Port Already in Use
```bash
# Use a different port
PORT=3001 node examples/basic-setup.js
```

### Database Doesn't Exist
Make sure to create the database before running the examples:

```sql
-- MySQL
CREATE DATABASE your_database_name;

-- PostgreSQL
CREATE DATABASE your_database_name;
```

## Next Steps

1. **Customize the examples** for your specific use case
2. **Add authentication** and authorization middleware
3. **Implement validation** using libraries like Joi or express-validator
4. **Add rate limiting** for production use
5. **Set up logging** and monitoring
6. **Deploy to production** with proper environment configuration

## Need Help?

- Check the main [README.md](../README.md) for detailed documentation
- Open an issue on GitHub for bugs or feature requests
- Join our community discussions for questions and tips
