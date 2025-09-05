-- Blog Database Schema for Ultimate CRUD Simple Implementation
-- This file creates the complete blog database structure including tables, views, and procedures

-- ===========================================
-- TABLES
-- ===========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    bio TEXT,
    avatar VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featuredImage VARCHAR(255),
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    publishedAt TIMESTAMP NULL,
    userId INTEGER NOT NULL,
    categoryId INTEGER NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    parentId INTEGER NULL,
    isApproved BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE CASCADE
);

-- ===========================================
-- INDEXES for Performance
-- ===========================================

CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(publishedAt);
CREATE INDEX idx_posts_user_id ON posts(userId);
CREATE INDEX idx_posts_category_id ON posts(categoryId);
CREATE INDEX idx_comments_post_id ON comments(postId);
CREATE INDEX idx_comments_user_id ON comments(userId);
CREATE INDEX idx_comments_parent_id ON comments(parentId);

-- ===========================================
-- VIEWS (Read-only aggregated data)
-- ===========================================

-- Post statistics view
CREATE OR REPLACE VIEW post_stats AS
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
    COUNT(DISTINCT CASE WHEN cm.isApproved = TRUE THEN cm.id END) as approvedCommentCount
FROM posts p
LEFT JOIN users u ON p.userId = u.id
LEFT JOIN categories c ON p.categoryId = c.id
LEFT JOIN comments cm ON p.id = cm.postId
GROUP BY p.id, p.title, p.slug, p.status, p.publishedAt, u.username, c.name, p.views, p.likes;

-- User analytics view
CREATE OR REPLACE VIEW user_analytics AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.firstName,
    u.lastName,
    COUNT(DISTINCT p.id) as totalPosts,
    COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) as publishedPosts,
    COUNT(DISTINCT c.id) as totalComments,
    SUM(p.views) as totalViews,
    SUM(p.likes) as totalLikes,
    u.createdAt as joinedAt
FROM users u
LEFT JOIN posts p ON u.id = p.userId
LEFT JOIN comments c ON u.id = c.userId
GROUP BY u.id, u.username, u.email, u.firstName, u.lastName, u.createdAt;

-- Category summary view
CREATE OR REPLACE VIEW category_summary AS
SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    c.color,
    COUNT(DISTINCT p.id) as postCount,
    COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) as publishedPostCount,
    AVG(p.views) as avgViews,
    SUM(p.likes) as totalLikes,
    MAX(p.publishedAt) as lastPostDate
FROM categories c
LEFT JOIN posts p ON c.id = p.categoryId
GROUP BY c.id, c.name, c.slug, c.description, c.color;

-- ===========================================
-- STORED PROCEDURES
-- ===========================================

-- User summary procedure
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS user_summary(IN user_id INT)
BEGIN
    SELECT 
        u.id,
        u.username,
        u.email,
        CONCAT(u.firstName, ' ', u.lastName) as fullName,
        u.bio,
        u.isActive,
        COUNT(DISTINCT p.id) as totalPosts,
        COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) as publishedPosts,
        COUNT(DISTINCT c.id) as totalComments,
        SUM(p.views) as totalViews,
        SUM(p.likes) as totalLikes,
        u.createdAt as joinedAt,
        DATEDIFF(NOW(), u.createdAt) as daysSinceJoined
    FROM users u
    LEFT JOIN posts p ON u.id = p.userId
    LEFT JOIN comments c ON u.id = c.userId
    WHERE u.id = user_id
    GROUP BY u.id;
END //
DELIMITER ;

-- Popular posts procedure
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS popular_posts(IN days_back INT DEFAULT 30, IN limit_count INT DEFAULT 10)
BEGIN
    SELECT 
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.featuredImage,
        p.publishedAt,
        u.username as author,
        c.name as category,
        p.views,
        p.likes,
        COUNT(DISTINCT cm.id) as commentCount,
        (p.views * 0.6 + p.likes * 0.3 + COUNT(DISTINCT cm.id) * 0.1) as popularity_score
    FROM posts p
    JOIN users u ON p.userId = u.id
    JOIN categories c ON p.categoryId = c.id
    LEFT JOIN comments cm ON p.id = cm.postId AND cm.isApproved = TRUE
    WHERE p.status = 'published' 
    AND p.publishedAt >= DATE_SUB(NOW(), INTERVAL days_back DAY)
    GROUP BY p.id, p.title, p.slug, p.excerpt, p.featuredImage, p.publishedAt, u.username, c.name, p.views, p.likes
    ORDER BY popularity_score DESC
    LIMIT limit_count;
END //
DELIMITER ;

-- ===========================================
-- SAMPLE DATA (Optional - for testing)
-- ===========================================

-- Insert sample users
INSERT IGNORE INTO users (username, email, firstName, lastName, bio) VALUES
('admin', 'admin@blog.com', 'Admin', 'User', 'Blog administrator'),
('johndoe', 'john@example.com', 'John', 'Doe', 'Tech enthusiast and blogger'),
('janedoe', 'jane@example.com', 'Jane', 'Doe', 'Writer and content creator');

-- Insert sample categories
INSERT IGNORE INTO categories (name, slug, description, color) VALUES
('Technology', 'technology', 'Latest tech news and tutorials', '#007bff'),
('Lifestyle', 'lifestyle', 'Life tips and personal experiences', '#28a745'),
('Travel', 'travel', 'Travel guides and experiences', '#ffc107'),
('Food', 'food', 'Recipes and restaurant reviews', '#dc3545');

-- Insert sample posts
INSERT IGNORE INTO posts (title, slug, content, excerpt, status, publishedAt, userId, categoryId, views, likes) VALUES
('Getting Started with Node.js', 'getting-started-nodejs', 'Complete guide to Node.js development...', 'Learn Node.js from scratch', 'published', NOW(), 2, 1, 150, 25),
('10 Tips for Better Living', 'tips-better-living', 'Improve your daily life with these tips...', 'Simple tips to enhance your lifestyle', 'published', NOW(), 3, 2, 89, 12),
('Best Coffee Shops in NYC', 'best-coffee-shops-nyc', 'Discover amazing coffee shops in New York...', 'Coffee lover\'s guide to NYC', 'published', NOW(), 2, 4, 234, 45);

-- Insert sample comments
INSERT IGNORE INTO comments (content, postId, userId, isApproved) VALUES
('Great tutorial! Very helpful.', 1, 3, TRUE),
('Thanks for sharing these tips.', 2, 2, TRUE),
('Love the coffee recommendations!', 3, 1, TRUE);
