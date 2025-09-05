# Docker Setup for Ultimate CRUD Simple Blog

This folder contains Docker Compose configurations to quickly set up MySQL and PostgreSQL databases for the Ultimate CRUD Simple Blog application.

## 🐳 Available Configurations

### 1. Complete Setup (Both Databases)
- **File**: `docker-compose.yml`
- **Includes**: MySQL, PostgreSQL, Adminer, phpMyAdmin, pgAdmin
- **Use case**: Development environment with multiple database options

### 2. MySQL Only
- **File**: `docker-compose.mysql.yml`
- **Includes**: MySQL + phpMyAdmin
- **Use case**: MySQL-focused development

### 3. PostgreSQL Only
- **File**: `docker-compose.postgres.yml`
- **Includes**: PostgreSQL + pgAdmin
- **Use case**: PostgreSQL-focused development

## 🚀 Quick Start

### Option 1: Complete Setup (Both Databases)
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# Stop all services
docker-compose down
```

### Option 2: MySQL Only
```bash
# Start MySQL and phpMyAdmin
docker-compose -f docker-compose.mysql.yml up -d

# Check status
docker-compose -f docker-compose.mysql.yml ps

# Stop services
docker-compose -f docker-compose.mysql.yml down
```

### Option 3: PostgreSQL Only
```bash
# Start PostgreSQL and pgAdmin
docker-compose -f docker-compose.postgres.yml up -d

# Check status
docker-compose -f docker-compose.postgres.yml ps

# Stop services
docker-compose -f docker-compose.postgres.yml down
```

## 📊 Database Connections

### MySQL Database
- **Host**: `localhost`
- **Port**: `3306`
- **Database**: `ultimate_crud_blog`
- **Username**: `bloguser`
- **Password**: `blogpassword`
- **Root Password**: `rootpassword`

### PostgreSQL Database
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `ultimate_crud_blog`
- **Username**: `bloguser`
- **Password**: `blogpassword`

## 🌐 Management Interfaces

### Adminer (Universal Database Tool)
- **URL**: http://localhost:8080
- **System**: MySQL or PostgreSQL
- **Server**: `mysql` or `postgres` (container names)
- **Username**: `bloguser`
- **Password**: `blogpassword`
- **Database**: `ultimate_crud_blog`

### phpMyAdmin (MySQL Management)
- **URL**: http://localhost:8081
- **Username**: `bloguser`
- **Password**: `blogpassword`

### pgAdmin (PostgreSQL Management)
- **URL**: http://localhost:8082
- **Email**: `admin@example.com`
- **Password**: `adminpassword`

**To connect to PostgreSQL in pgAdmin:**
1. Click "Add New Server"
2. General Tab: Name = "Ultimate CRUD Blog"
3. Connection Tab:
   - Host: `postgres`
   - Port: `5432`
   - Database: `ultimate_crud_blog`
   - Username: `bloguser`
   - Password: `blogpassword`

## 🔧 Environment Configuration

Update your `.env` file based on which database you're using:

### For MySQL:
```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ultimate_crud_blog
DB_USER=bloguser
DB_PASS=blogpassword
```

### For PostgreSQL:
```env
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ultimate_crud_blog
DB_USER=bloguser
DB_PASS=blogpassword
```

## 📝 Database Schema

The database schemas are automatically loaded on container startup:
- **MySQL**: `../data/database-mysql.sql`
- **PostgreSQL**: `../data/database-postgresql.sql`

The schemas include:
- Complete blog database structure (users, posts, categories, comments)
- Database views for analytics
- Stored procedures/functions
- Sample data for testing

## 🛠 Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mysql
docker-compose logs -f postgres
```

### Execute Commands in Containers
```bash
# MySQL
docker-compose exec mysql mysql -u bloguser -p ultimate_crud_blog

# PostgreSQL
docker-compose exec postgres psql -U bloguser -d ultimate_crud_blog
```

### Reset Databases
```bash
# Stop and remove volumes (WARNING: This deletes all data)
docker-compose down -v

# Start fresh
docker-compose up -d
```

### Backup Databases
```bash
# MySQL backup
docker-compose exec mysql mysqldump -u bloguser -p ultimate_crud_blog > backup-mysql.sql

# PostgreSQL backup
docker-compose exec postgres pg_dump -U bloguser ultimate_crud_blog > backup-postgres.sql
```

## 🔍 Troubleshooting

### Port Conflicts
If you get port conflicts, you can modify the ports in the docker-compose files:
```yaml
ports:
  - "3307:3306"  # Change 3306 to 3307 for MySQL
  - "5433:5432"  # Change 5432 to 5433 for PostgreSQL
```

### Connection Issues
1. Wait for health checks to pass: `docker-compose ps`
2. Check logs: `docker-compose logs [service-name]`
3. Verify containers are running: `docker ps`

### Permission Issues
On some systems, you might need to adjust file permissions:
```bash
chmod 644 ../data/database-*.sql
```

## 🚀 Next Steps

1. Choose your preferred database setup
2. Start the Docker containers
3. Update your `.env` file with the connection details
4. Run your Ultimate CRUD application: `npm start`
5. Test the API endpoints and database management interfaces

## 🧹 Cleanup

To completely remove all containers, volumes, and networks:
```bash
# Stop and remove everything
docker-compose down -v --remove-orphans

# Remove images (optional)
docker rmi mysql:8.0 postgres:15 adminer:4.8.1 phpmyadmin/phpmyadmin:5.2 dpage/pgadmin4:7
```
