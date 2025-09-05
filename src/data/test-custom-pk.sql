-- Test SQL schema for different primary key names
-- This file tests how Ultimate CRUD handles non-standard primary key names

-- Test table with custom primary key name
CREATE TABLE IF NOT EXISTS products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test table with UUID primary key
CREATE TABLE IF NOT EXISTS orders (
    order_uuid VARCHAR(36) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test table with compound primary key
CREATE TABLE IF NOT EXISTS order_items (
    order_uuid VARCHAR(36),
    product_id INT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (order_uuid, product_id),
    FOREIGN KEY (order_uuid) REFERENCES orders(order_uuid) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Test table with no auto-increment primary key
CREATE TABLE IF NOT EXISTS inventory (
    location_code VARCHAR(10) PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL,
    address TEXT,
    capacity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert test data
INSERT INTO products (name, price, description, sku) VALUES 
('Laptop', 999.99, 'High-performance laptop', 'LAP001'),
('Mouse', 29.99, 'Wireless mouse', 'MOU001'),
('Keyboard', 79.99, 'Mechanical keyboard', 'KEY001');

INSERT INTO orders (order_uuid, customer_name, total_amount, status) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'John Doe', 1109.97, 'completed'),
('550e8400-e29b-41d4-a716-446655440002', 'Jane Smith', 109.98, 'pending');

INSERT INTO order_items (order_uuid, product_id, quantity, unit_price) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 1, 1, 999.99),
('550e8400-e29b-41d4-a716-446655440001', 2, 1, 29.99),
('550e8400-e29b-41d4-a716-446655440001', 3, 1, 79.99),
('550e8400-e29b-41d4-a716-446655440002', 2, 2, 29.99),
('550e8400-e29b-41d4-a716-446655440002', 3, 1, 79.99);

INSERT INTO inventory (location_code, warehouse_name, address, capacity) VALUES 
('WH01', 'Main Warehouse', '123 Storage St, City', 10000),
('WH02', 'Secondary Warehouse', '456 Backup Ave, Town', 5000);
