-- Database Migration: Add Authentication Fields
-- Run this script to add password and role fields to existing users table

-- SQLite Migration
-- ALTER TABLE users ADD COLUMN password TEXT;
-- ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';

-- MySQL Migration
-- ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';
-- ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user';
-- ALTER TABLE users ADD INDEX idx_role (role);

-- PostgreSQL Migration
-- ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';
-- ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'));
-- CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Note: After running this migration, you'll need to:
-- 1. Update existing users with proper passwords (they won't be able to login without passwords)
-- 2. Consider creating a default admin user for initial setup

-- Example: Create default admin user (update password hash as needed)
-- INSERT INTO users (username, email, password, role) 
-- VALUES ('admin', 'admin@example.com', '$2b$12$placeholder_hash_here', 'admin');
