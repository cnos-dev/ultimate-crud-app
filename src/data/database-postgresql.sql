-- PostgreSQL Database Schema for Ultimate CRUD Simple Implementation
-- Run this file with: psql ultimate_crud_blog < database-postgresql.sql

-- ===========================================
-- TABLES
-- ===========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    bio TEXT,
    avatar VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(isActive);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#007bff',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for categories table
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(isActive);

-- Create trigger for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create custom enum type for post status
DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featuredImage VARCHAR(255),
    status post_status DEFAULT 'draft',
    publishedAt TIMESTAMP NULL,
    userId INTEGER NOT NULL,
    categoryId INTEGER NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Create indexes for posts table
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(publishedAt);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(userId);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON posts(categoryId);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- Create full-text search index for PostgreSQL
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING gin(to_tsvector('english', title || ' ' || content));

-- Create trigger for updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    parentId INTEGER NULL,
    isApproved BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE CASCADE
);

-- Create indexes for comments table
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(postId);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(userId);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parentId);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(isApproved);

-- Create trigger for updated_at
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- VIEWS (PostgreSQL syntax)
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
    EXTRACT(DAY FROM (NOW() - u.createdAt)) as daysSinceJoined,
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
-- STORED PROCEDURES (PostgreSQL functions)
-- ===========================================

-- User summary function (PostgreSQL equivalent of stored procedure)
CREATE OR REPLACE FUNCTION user_summary(user_id INTEGER)
RETURNS TABLE(
    id INTEGER,
    username VARCHAR(50),
    email VARCHAR(100),
    fullName TEXT,
    bio TEXT,
    isActive BOOLEAN,
    totalPosts BIGINT,
    publishedPosts BIGINT,
    totalComments BIGINT,
    totalViews BIGINT,
    totalLikes BIGINT,
    joinedAt TIMESTAMP,
    daysSinceJoined INTEGER,
    engagementScore BIGINT,
    engagementLevel TEXT
) AS $$
BEGIN
    RETURN QUERY
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
        EXTRACT(DAY FROM (NOW() - u.createdAt))::INTEGER as daysSinceJoined,
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
END;
$$ LANGUAGE plpgsql;

-- Popular posts function
CREATE OR REPLACE FUNCTION popular_posts(days_back INTEGER DEFAULT 30, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    id INTEGER,
    title VARCHAR(200),
    slug VARCHAR(200),
    excerpt TEXT,
    featuredImage VARCHAR(255),
    publishedAt TIMESTAMP,
    author VARCHAR(50),
    category VARCHAR(100),
    views INTEGER,
    likes INTEGER,
    commentCount BIGINT,
    popularity_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
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
    AND p.publishedAt >= (NOW() - INTERVAL '1 day' * days_back)
    GROUP BY p.id, p.title, p.slug, p.excerpt, p.featuredImage, p.publishedAt, u.username, c.name, p.views, p.likes
    ORDER BY popularity_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- SAMPLE DATA
-- ===========================================

-- Insert sample users
INSERT INTO users (username, email, firstName, lastName, bio) VALUES
('admin', 'admin@blog.com', 'Admin', 'User', 'Blog administrator'),
('johndoe', 'john@example.com', 'John', 'Doe', 'Tech enthusiast and blogger'),
('janedoe', 'jane@example.com', 'Jane', 'Doe', 'Writer and content creator'),
('mikejones', 'mike@example.com', 'Mike', 'Jones', 'Developer and writer')
ON CONFLICT (username) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, slug, description, color) VALUES
('Technology', 'technology', 'Latest tech news and tutorials', '#007bff'),
('Lifestyle', 'lifestyle', 'Life tips and personal experiences', '#28a745'),
('Travel', 'travel', 'Travel guides and experiences', '#ffc107'),
('Food', 'food', 'Recipes and restaurant reviews', '#dc3545'),
('Programming', 'programming', 'Coding tutorials and best practices', '#6f42c1')
ON CONFLICT (name) DO NOTHING;

-- Insert sample posts
INSERT INTO posts (title, slug, content, excerpt, status, publishedAt, userId, categoryId, views, likes) VALUES
('Getting Started with Node.js', 'getting-started-nodejs', 'Complete guide to Node.js development...', 'Learn Node.js from scratch', 'published', NOW(), 2, 1, 150, 25),
('10 Tips for Better Living', 'tips-better-living', 'Improve your daily life with these tips...', 'Simple tips to enhance your lifestyle', 'published', NOW(), 3, 2, 89, 12),
('Best Coffee Shops in NYC', 'best-coffee-shops-nyc', 'Discover amazing coffee shops in New York...', 'Coffee lover''s guide to NYC', 'published', NOW(), 2, 4, 234, 45),
('JavaScript ES6 Features', 'javascript-es6-features', 'Exploring the latest JavaScript features...', 'Modern JavaScript development', 'published', NOW(), 4, 5, 312, 67),
('Travel Photography Tips', 'travel-photography-tips', 'How to take stunning photos while traveling...', 'Capture your adventures', 'draft', NULL, 3, 3, 0, 0)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample comments
INSERT INTO comments (content, postId, userId, isApproved) VALUES
('Great tutorial! Very helpful for beginners.', 1, 3, TRUE),
('Thanks for sharing these practical tips.', 2, 2, TRUE),
('Love the coffee recommendations! Will definitely visit.', 3, 1, TRUE),
('Excellent explanation of ES6 features.', 4, 2, TRUE),
('This helped me understand arrow functions better.', 4, 3, TRUE),
('Could you add more examples?', 1, 4, FALSE);

-- Show completion message
SELECT 'PostgreSQL database schema created successfully!' as message;
