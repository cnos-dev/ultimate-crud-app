#!/bin/bash

# Ultimate CRUD Simple Blog - Database Setup Script

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$SCRIPT_DIR/docker"
DATA_DIR="$SCRIPT_DIR/data"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "================================================"
    echo "  Ultimate CRUD Simple Blog - Database Setup"
    echo "================================================"
    echo -e "${NC}"
}

print_usage() {
    echo -e "${YELLOW}Usage: $0 [COMMAND]${NC}"
    echo ""
    echo "Commands:"
    echo "  sqlite     - Set up SQLite database (default)"
    echo "  mysql      - Start MySQL with Docker"
    echo "  postgres   - Start PostgreSQL with Docker"
    echo "  both       - Start both MySQL and PostgreSQL"
    echo "  stop       - Stop all Docker containers"
    echo "  reset      - Stop containers and remove volumes"
    echo "  status     - Show container status"
    echo "  logs       - Show container logs"
    echo ""
    echo "Examples:"
    echo "  $0 sqlite"
    echo "  $0 mysql"
    echo "  $0 postgres"
    echo "  $0 stop"
}

setup_sqlite() {
    echo -e "${GREEN}Setting up SQLite database...${NC}"
    
    # Remove existing database
    if [ -f "$SCRIPT_DIR/blog.db" ]; then
        rm "$SCRIPT_DIR/blog.db"
        echo "Removed existing blog.db"
    fi
    
    # Create new database
    sqlite3 "$SCRIPT_DIR/blog.db" < "$DATA_DIR/database-sqlite.sql"
    
    # Update .env file
    cat > "$SCRIPT_DIR/.env" << EOF
# Database Configuration - SQLite
NODE_ENV=development
PORT=3000
DB_DIALECT=sqlite
SQLITE_PATH=./blog.db

# Ultimate CRUD Settings
ENABLE_REST_API=true
ENABLE_GRAPHQL=true
ENABLE_ADMIN_UI=true
API_PREFIX=/api
GRAPHQL_ENDPOINT=/graphql
EOF
    
    echo -e "${GREEN}✅ SQLite database created successfully!${NC}"
    echo -e "${BLUE}Database file: $SCRIPT_DIR/blog.db${NC}"
    echo -e "${BLUE}Ready to run: npm start${NC}"
}

setup_mysql() {
    echo -e "${GREEN}Starting MySQL with Docker...${NC}"
    
    cd "$DOCKER_DIR"
    docker-compose -f docker-compose.mysql.yml up -d
    
    echo "Waiting for MySQL to be ready..."
    sleep 10
    
    # Update .env file
    cat > "$SCRIPT_DIR/.env" << EOF
# Database Configuration - MySQL (Docker)
NODE_ENV=development
PORT=3000
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ultimate_crud_blog
DB_USER=bloguser
DB_PASS=blogpassword

# Ultimate CRUD Settings
ENABLE_REST_API=true
ENABLE_GRAPHQL=true
ENABLE_ADMIN_UI=true
API_PREFIX=/api
GRAPHQL_ENDPOINT=/graphql
EOF
    
    echo -e "${GREEN}✅ MySQL started successfully!${NC}"
    echo -e "${BLUE}MySQL: localhost:3306${NC}"
    echo -e "${BLUE}phpMyAdmin: http://localhost:8081${NC}"
    echo -e "${BLUE}Ready to run: npm start${NC}"
}

setup_postgres() {
    echo -e "${GREEN}Starting PostgreSQL with Docker...${NC}"
    
    cd "$DOCKER_DIR"
    docker-compose -f docker-compose.postgres.yml up -d
    
    echo "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Update .env file
    cat > "$SCRIPT_DIR/.env" << EOF
# Database Configuration - PostgreSQL (Docker)
NODE_ENV=development
PORT=3000
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ultimate_crud_blog
DB_USER=bloguser
DB_PASS=blogpassword

# Ultimate CRUD Settings
ENABLE_REST_API=true
ENABLE_GRAPHQL=true
ENABLE_ADMIN_UI=true
API_PREFIX=/api
GRAPHQL_ENDPOINT=/graphql
EOF
    
    echo -e "${GREEN}✅ PostgreSQL started successfully!${NC}"
    echo -e "${BLUE}PostgreSQL: localhost:5432${NC}"
    echo -e "${BLUE}pgAdmin: http://localhost:8082${NC}"
    echo -e "${BLUE}Ready to run: npm start${NC}"
}

setup_both() {
    echo -e "${GREEN}Starting both MySQL and PostgreSQL with Docker...${NC}"
    
    cd "$DOCKER_DIR"
    docker-compose up -d
    
    echo "Waiting for databases to be ready..."
    sleep 15
    
    echo -e "${GREEN}✅ Both databases started successfully!${NC}"
    echo -e "${BLUE}MySQL: localhost:3306${NC}"
    echo -e "${BLUE}PostgreSQL: localhost:5432${NC}"
    echo -e "${BLUE}Adminer: http://localhost:8080${NC}"
    echo -e "${BLUE}phpMyAdmin: http://localhost:8081${NC}"
    echo -e "${BLUE}pgAdmin: http://localhost:8082${NC}"
    echo -e "${YELLOW}Update your .env file to choose which database to use${NC}"
}

stop_containers() {
    echo -e "${YELLOW}Stopping Docker containers...${NC}"
    
    cd "$DOCKER_DIR"
    docker-compose down 2>/dev/null || true
    docker-compose -f docker-compose.mysql.yml down 2>/dev/null || true
    docker-compose -f docker-compose.postgres.yml down 2>/dev/null || true
    
    echo -e "${GREEN}✅ All containers stopped${NC}"
}

reset_containers() {
    echo -e "${RED}Stopping containers and removing volumes...${NC}"
    
    cd "$DOCKER_DIR"
    docker-compose down -v 2>/dev/null || true
    docker-compose -f docker-compose.mysql.yml down -v 2>/dev/null || true
    docker-compose -f docker-compose.postgres.yml down -v 2>/dev/null || true
    
    echo -e "${GREEN}✅ Containers and volumes removed${NC}"
}

show_status() {
    echo -e "${BLUE}Docker container status:${NC}"
    docker ps --filter "name=ultimate-crud" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

show_logs() {
    echo -e "${BLUE}Choose container logs to view:${NC}"
    echo "1. MySQL"
    echo "2. PostgreSQL" 
    echo "3. All"
    read -p "Enter choice (1-3): " choice
    
    cd "$DOCKER_DIR"
    case $choice in
        1) docker-compose logs -f mysql ;;
        2) docker-compose logs -f postgres ;;
        3) docker-compose logs -f ;;
        *) echo "Invalid choice" ;;
    esac
}

# Main script
print_header

case "${1:-}" in
    "sqlite")
        setup_sqlite
        ;;
    "mysql")
        setup_mysql
        ;;
    "postgres")
        setup_postgres
        ;;
    "both")
        setup_both
        ;;
    "stop")
        stop_containers
        ;;
    "reset")
        reset_containers
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "")
        echo -e "${YELLOW}No command specified. Setting up SQLite by default...${NC}"
        setup_sqlite
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        print_usage
        exit 1
        ;;
esac
