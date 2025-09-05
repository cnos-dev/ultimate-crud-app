-- MySQL Database Schema for Ultimate CRUD Simple Implementation
-- Run this file with: mysql -u root -p ultimate_crud_blog < database-mysql.sql

-- ===========================================
-- TABLES
-- ===========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    bio TEXT,
    avatar VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_active (isActive)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_active (isActive)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    featuredImage VARCHAR(255),
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    publishedAt TIMESTAMP NULL,
    userId INT NOT NULL,
    categoryId INT NOT NULL,
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE RESTRICT,
    
    INDEX idx_status (status),
    INDEX idx_published_at (publishedAt),
    INDEX idx_user_id (userId),
    INDEX idx_category_id (categoryId),
    INDEX idx_slug (slug),
    FULLTEXT idx_search (title, content)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    postId INT NOT NULL,
    userId INT NOT NULL,
    parentId INT NULL,
    isApproved BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE CASCADE,
    
    INDEX idx_post_id (postId),
    INDEX idx_user_id (userId),
    INDEX idx_parent_id (parentId),
    INDEX idx_approved (isApproved)
);

-- ===========================================
-- VIEWS (MySQL syntax)
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
    COUNT(DISTINCT CASE WHEN cm.isApproved = TRUE THEN cm.id END) as approvedCommentCount,
    (p.views + p.likes * 2 + COUNT(DISTINCT cm.id) * 3) as popularityScore
FROM posts p
LEFT JOIN users u ON p.userId = u.id
LEFT JOIN categories c ON p.categoryId = c.id
LEFT JOIN comments cm ON p.id = cm.postId
GROUP BY p.id, p.title, p.slug, p.status, p.publishedAt, u.username, c.name, p.views, p.likes
ORDER BY popularityScore DESC;

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
    COALESCE(SUM(p.views), 0) as totalViews,
    COALESCE(SUM(p.likes), 0) as totalLikes,
    u.createdAt as joinedAt,
    DATEDIFF(NOW(), u.createdAt) as daysSinceJoined,
    (COALESCE(SUM(p.views), 0) + COALESCE(SUM(p.likes), 0) * 2 + COUNT(DISTINCT c.id) * 3) as engagementScore
FROM users u
LEFT JOIN posts p ON u.id = p.userId
LEFT JOIN comments c ON u.id = c.userId
WHERE u.isActive = TRUE
GROUP BY u.id, u.username, u.email, u.firstName, u.lastName, u.createdAt
ORDER BY engagementScore DESC;

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
    COALESCE(AVG(p.views), 0) as avgViews,
    COALESCE(SUM(p.likes), 0) as totalLikes,
    MAX(p.publishedAt) as lastPostDate,
    COUNT(DISTINCT p.userId) as uniqueAuthors
FROM categories c
LEFT JOIN posts p ON c.id = p.categoryId
WHERE c.isActive = TRUE
GROUP BY c.id, c.name, c.slug, c.description, c.color
ORDER BY postCount DESC, totalLikes DESC;

-- ===========================================
-- STORED PROCEDURES (MySQL syntax)
-- ===========================================

-- User summary procedure
DELIMITER //
CREATE PROCEDURE user_summary(IN user_id INT)
BEGIN
    SELECT 
        u.id,
        u.username,
        u.email,
        CONCAT(COALESCE(u.firstName, ''), ' ', COALESCE(u.lastName, '')) as fullName,
        u.bio,
        u.isActive,
        COUNT(DISTINCT p.id) as totalPosts,
        COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) as publishedPosts,
        COUNT(DISTINCT c.id) as totalComments,
        COALESCE(SUM(p.views), 0) as totalViews,
        COALESCE(SUM(p.likes), 0) as totalLikes,
        u.createdAt as joinedAt,
        DATEDIFF(NOW(), u.createdAt) as daysSinceJoined,
        (COALESCE(SUM(p.views), 0) + COALESCE(SUM(p.likes), 0) * 2 + COUNT(DISTINCT c.id) * 3) as engagementScore,
        CASE 
            WHEN (COALESCE(SUM(p.views), 0) + COALESCE(SUM(p.likes), 0) * 2 + COUNT(DISTINCT c.id) * 3) > 100 THEN 'High'
            WHEN (COALESCE(SUM(p.views), 0) + COALESCE(SUM(p.likes), 0) * 2 + COUNT(DISTINCT c.id) * 3) > 50 THEN 'Medium'
            ELSE 'Low'
        END as engagementLevel
    FROM users u
    LEFT JOIN posts p ON u.id = p.userId
    LEFT JOIN comments c ON u.id = c.userId
    WHERE u.id = user_id
    GROUP BY u.id, u.username, u.email, u.firstName, u.lastName, u.bio, u.isActive, u.createdAt;
END //
DELIMITER ;

-- Popular posts procedure
DELIMITER //
CREATE PROCEDURE popular_posts(IN days_back INT DEFAULT 30, IN limit_count INT DEFAULT 10)
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
-- SAMPLE DATA
-- ===========================================

-- Insert sample users
INSERT IGNORE INTO users (username, email, firstName, lastName, bio) VALUES
('admin', 'admin@blog.com', 'Admin', 'User', 'Blog administrator'),
('johndoe', 'john@example.com', 'John', 'Doe', 'Tech enthusiast and blogger'),
('janedoe', 'jane@example.com', 'Jane', 'Doe', 'Writer and content creator'),
('mikejones', 'mike@example.com', 'Mike', 'Jones', 'Developer and writer');

-- Insert sample categories
INSERT IGNORE INTO categories (name, slug, description, color) VALUES
('Technology', 'technology', 'Latest tech news and tutorials', '#007bff'),
('Lifestyle', 'lifestyle', 'Life tips and personal experiences', '#28a745'),
('Travel', 'travel', 'Travel guides and experiences', '#ffc107'),
('Food', 'food', 'Recipes and restaurant reviews', '#dc3545'),
('Programming', 'programming', 'Coding tutorials and best practices', '#6f42c1');

-- Insert sample posts
INSERT IGNORE INTO posts (title, slug, content, excerpt, status, publishedAt, userId, categoryId, views, likes) VALUES
('Getting Started with Node.js', 'getting-started-nodejs', 'Complete guide to Node.js development...', 'Learn Node.js from scratch', 'published', NOW(), 2, 1, 150, 25),
('10 Tips for Better Living', 'tips-better-living', 'Improve your daily life with these tips...', 'Simple tips to enhance your lifestyle', 'published', NOW(), 3, 2, 89, 12),
('Best Coffee Shops in NYC', 'best-coffee-shops-nyc', 'Discover amazing coffee shops in New York...', 'Coffee lover\'s guide to NYC', 'published', NOW(), 2, 4, 234, 45),
('JavaScript ES6 Features', 'javascript-es6-features', 'Exploring the latest JavaScript features...', 'Modern JavaScript development', 'published', NOW(), 4, 5, 312, 67),
('Travel Photography Tips', 'travel-photography-tips', 'How to take stunning photos while traveling...', 'Capture your adventures', 'draft', NULL, 3, 3, 0, 0);

-- Insert sample comments
INSERT IGNORE INTO comments (content, postId, userId, isApproved) VALUES
('Great tutorial! Very helpful for beginners.', 1, 3, TRUE),
('Thanks for sharing these practical tips.', 2, 2, TRUE),
('Love the coffee recommendations! Will definitely visit.', 3, 1, TRUE),
('Excellent explanation of ES6 features.', 4, 2, TRUE),
('This helped me understand arrow functions better.', 4, 3, TRUE),
('Could you add more examples?', 1, 4, FALSE);

-- Show completion message
SELECT 'MySQL database schema created successfully!' as message;
