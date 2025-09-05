-- SQLite Database Schema for Ultimate CRUD Simple Implementation
-- Run this file with: sqlite3 blog.db < database-sqlite.sql

-- ===========================================
-- Enable foreign key constraints
-- ===========================================
PRAGMA foreign_keys = ON;

-- ===========================================
-- TABLES
-- ===========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    firstName TEXT,
    lastName TEXT,
    bio TEXT,
    avatar TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(isActive);

-- Create trigger for updatedAt
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        UPDATE users SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#007bff',
    isActive INTEGER DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for categories table
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(isActive);

-- Create trigger for updatedAt
CREATE TRIGGER IF NOT EXISTS update_categories_updated_at 
    AFTER UPDATE ON categories
    FOR EACH ROW
    BEGIN
        UPDATE categories SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featuredImage TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    publishedAt DATETIME NULL,
    userId INTEGER NOT NULL,
    categoryId INTEGER NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Create indexes for posts table
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(publishedAt);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(userId);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(categoryId);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- Create full-text search virtual table for SQLite
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(title, content, content='posts', content_rowid='id');

-- Create trigger to keep FTS table in sync
CREATE TRIGGER IF NOT EXISTS posts_fts_insert AFTER INSERT ON posts BEGIN
    INSERT INTO posts_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
END;

CREATE TRIGGER IF NOT EXISTS posts_fts_delete AFTER DELETE ON posts BEGIN
    INSERT INTO posts_fts(posts_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
END;

CREATE TRIGGER IF NOT EXISTS posts_fts_update AFTER UPDATE ON posts BEGIN
    INSERT INTO posts_fts(posts_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
    INSERT INTO posts_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
END;

-- Create trigger for updatedAt
CREATE TRIGGER IF NOT EXISTS update_posts_updated_at 
    AFTER UPDATE ON posts
    FOR EACH ROW
    BEGIN
        UPDATE posts SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    parentId INTEGER NULL,
    isApproved INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE CASCADE
);

-- Create indexes for comments table
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(postId);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(userId);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parentId);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(isApproved);

-- Create trigger for updatedAt
CREATE TRIGGER IF NOT EXISTS update_comments_updated_at 
    AFTER UPDATE ON comments
    FOR EACH ROW
    BEGIN
        UPDATE comments SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- ===========================================
-- VIEWS (SQLite syntax)
-- ===========================================

-- Post statistics view
CREATE VIEW IF NOT EXISTS post_stats AS
SELECT 
    p.id,
    p.title,
    p.slug,
    p.status,
    p.publishedAt,
    u.username as author,
    c.name as category,
    p.views,
    p.likes,
    COUNT(DISTINCT cm.id) as commentCount,
    COUNT(DISTINCT CASE WHEN cm.isApproved = 1 THEN cm.id END) as approvedCommentCount,
    (p.views + p.likes * 2 + COUNT(DISTINCT cm.id) * 3) as popularityScore
FROM posts p
LEFT JOIN users u ON p.userId = u.id
LEFT JOIN categories c ON p.categoryId = c.id
LEFT JOIN comments cm ON p.id = cm.postId
GROUP BY p.id, p.title, p.slug, p.status, p.publishedAt, u.username, c.name, p.views, p.likes
ORDER BY popularityScore DESC;

-- User analytics view
CREATE VIEW IF NOT EXISTS user_analytics AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.firstName,
    u.lastName,
    COUNT(DISTINCT p.id) as totalPosts,
    COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) as publishedPosts,
    COUNT(DISTINCT c.id) as totalComments,
    COALESCE(SUM(p.views), 0) as totalViews,
    COALESCE(SUM(p.likes), 0) as totalLikes,
    u.createdAt as joinedAt,
    JULIANDAY('now') - JULIANDAY(u.createdAt) as daysSinceJoined,
    (COALESCE(SUM(p.views), 0) + COALESCE(SUM(p.likes), 0) * 2 + COUNT(DISTINCT c.id) * 3) as engagementScore
FROM users u
LEFT JOIN posts p ON u.id = p.userId
LEFT JOIN comments c ON u.id = c.userId
WHERE u.isActive = 1
GROUP BY u.id, u.username, u.email, u.firstName, u.lastName, u.createdAt
ORDER BY engagementScore DESC;

-- Category summary view
CREATE VIEW IF NOT EXISTS category_summary AS
SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    c.color,
    COUNT(DISTINCT p.id) as postCount,
    COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) as publishedPostCount,
    COALESCE(AVG(p.views), 0) as avgViews,
    COALESCE(SUM(p.likes), 0) as totalLikes,
    MAX(p.publishedAt) as lastPostDate,
    COUNT(DISTINCT p.userId) as uniqueAuthors
FROM categories c
LEFT JOIN posts p ON c.id = p.categoryId
WHERE c.isActive = 1
GROUP BY c.id, c.name, c.slug, c.description, c.color
ORDER BY postCount DESC, totalLikes DESC;

-- ===========================================
-- NOTE: SQLite doesn't support stored procedures
-- These would be implemented as application-level functions
-- that execute the following SQL queries
-- ===========================================

-- User summary query (to be used in application code)
-- SELECT 
--     u.id,
--     u.username,
--     u.email,
--     (COALESCE(u.firstName, '') || ' ' || COALESCE(u.lastName, '')) as fullName,
--     u.bio,
--     u.isActive,
--     COUNT(DISTINCT p.id) as totalPosts,
--     COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) as publishedPosts,
--     COUNT(DISTINCT c.id) as totalComments,
--     COALESCE(SUM(p.views), 0) as totalViews,
--     COALESCE(SUM(p.likes), 0) as totalLikes,
--     u.createdAt as joinedAt,
--     JULIANDAY('now') - JULIANDAY(u.createdAt) as daysSinceJoined,
--     (COALESCE(SUM(p.views), 0) + COALESCE(SUM(p.likes), 0) * 2 + COUNT(DISTINCT c.id) * 3) as engagementScore,
--     CASE 
--         WHEN (COALESCE(SUM(p.views), 0) + COALESCE(SUM(p.likes), 0) * 2 + COUNT(DISTINCT c.id) * 3) > 100 THEN 'High'
--         WHEN (COALESCE(SUM(p.views), 0) + COALESCE(SUM(p.likes), 0) * 2 + COUNT(DISTINCT c.id) * 3) > 50 THEN 'Medium'
--         ELSE 'Low'
--     END as engagementLevel
-- FROM users u
-- LEFT JOIN posts p ON u.id = p.userId
-- LEFT JOIN comments c ON u.id = c.userId
-- WHERE u.id = ? -- parameter: user_id
-- GROUP BY u.id, u.username, u.email, u.firstName, u.lastName, u.bio, u.isActive, u.createdAt;

-- Popular posts query (to be used in application code)
-- SELECT 
--     p.id,
--     p.title,
--     p.slug,
--     p.excerpt,
--     p.featuredImage,
--     p.publishedAt,
--     u.username as author,
--     c.name as category,
--     p.views,
--     p.likes,
--     COUNT(DISTINCT cm.id) as commentCount,
--     (p.views * 0.6 + p.likes * 0.3 + COUNT(DISTINCT cm.id) * 0.1) as popularity_score
-- FROM posts p
-- JOIN users u ON p.userId = u.id
-- JOIN categories c ON p.categoryId = c.id
-- LEFT JOIN comments cm ON p.id = cm.postId AND cm.isApproved = 1
-- WHERE p.status = 'published' 
-- AND p.publishedAt >= datetime('now', '-' || ? || ' days') -- parameter: days_back
-- GROUP BY p.id, p.title, p.slug, p.excerpt, p.featuredImage, p.publishedAt, u.username, c.name, p.views, p.likes
-- ORDER BY popularity_score DESC
-- LIMIT ?; -- parameter: limit_count

-- ===========================================
-- SAMPLE DATA
-- ===========================================

-- Insert sample users
INSERT OR IGNORE INTO users (username, email, firstName, lastName, bio) VALUES
('admin', 'admin@blog.com', 'Admin', 'User', 'Blog administrator'),
('johndoe', 'john@example.com', 'John', 'Doe', 'Tech enthusiast and blogger'),
('janedoe', 'jane@example.com', 'Jane', 'Doe', 'Writer and content creator'),
('mikejones', 'mike@example.com', 'Mike', 'Jones', 'Developer and writer');

-- Insert sample categories
INSERT OR IGNORE INTO categories (name, slug, description, color) VALUES
('Technology', 'technology', 'Latest tech news and tutorials', '#007bff'),
('Lifestyle', 'lifestyle', 'Life tips and personal experiences', '#28a745'),
('Travel', 'travel', 'Travel guides and experiences', '#ffc107'),
('Food', 'food', 'Recipes and restaurant reviews', '#dc3545'),
('Programming', 'programming', 'Coding tutorials and best practices', '#6f42c1');

-- Insert sample posts
INSERT OR IGNORE INTO posts (title, slug, content, excerpt, status, publishedAt, userId, categoryId, views, likes) VALUES
('Getting Started with Node.js', 'getting-started-nodejs', 'Complete guide to Node.js development...', 'Learn Node.js from scratch', 'published', datetime('now'), 2, 1, 150, 25),
('10 Tips for Better Living', 'tips-better-living', 'Improve your daily life with these tips...', 'Simple tips to enhance your lifestyle', 'published', datetime('now'), 3, 2, 89, 12),
('Best Coffee Shops in NYC', 'best-coffee-shops-nyc', 'Discover amazing coffee shops in New York...', 'Coffee lover''s guide to NYC', 'published', datetime('now'), 2, 4, 234, 45),
('JavaScript ES6 Features', 'javascript-es6-features', 'Exploring the latest JavaScript features...', 'Modern JavaScript development', 'published', datetime('now'), 4, 5, 312, 67),
('Travel Photography Tips', 'travel-photography-tips', 'How to take stunning photos while traveling...', 'Capture your adventures', 'draft', NULL, 3, 3, 0, 0);

-- Insert sample comments
INSERT INTO comments (content, postId, userId, isApproved) VALUES
('Great tutorial! Very helpful for beginners.', 1, 3, 1),
('Thanks for sharing these practical tips.', 2, 2, 1),
('Love the coffee recommendations! Will definitely visit.', 3, 1, 1),
('Excellent explanation of ES6 features.', 4, 2, 1),
('This helped me understand arrow functions better.', 4, 3, 1),
('Could you add more examples?', 1, 4, 0);

-- Show completion message
SELECT 'SQLite database schema created successfully!' as message;
