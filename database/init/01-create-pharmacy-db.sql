-- Pharmacy Management System Database Schema
-- This is a placeholder for when we implement a real database

CREATE DATABASE IF NOT EXISTS pharmacy_db;
USE pharmacy_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('super_admin', 'pharmacy_owner', 'pharmacy_manager', 'pharmacist', 'pharmacy_technician', 'cashier', 'inventory_manager') NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    pharmacy_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pharmacies table
CREATE TABLE IF NOT EXISTS pharmacies (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    license VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    strength VARCHAR(50),
    form VARCHAR(50),
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'KSh',
    prescription_required BOOLEAN DEFAULT FALSE,
    storage_conditions TEXT,
    pharmacy_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255),
    quantity INT NOT NULL DEFAULT 0,
    reorder_level INT DEFAULT 0,
    expiry_date DATE,
    batch_number VARCHAR(100),
    supplier VARCHAR(255),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample data comment
-- Sample data will be inserted via the Node.js seeding script

SELECT 'Pharmacy database schema created successfully!' as message;
