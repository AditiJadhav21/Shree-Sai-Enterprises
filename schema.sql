-- =====================================================================
-- SHREE SAI ENTERPRISES - SOLAR ENERGY SOLUTIONS
-- Authorised Vendor: PM Surya Ghar Muft Bijli Yojana (MNRE)
-- Dindori, Nashik, Maharashtra
-- Database Schema: MySQL 8.0+
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `shree_sai_enterprises`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `shree_sai_enterprises`;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `hsn_code` VARCHAR(20) DEFAULT '85414011',
  `icon` VARCHAR(50) DEFAULT 'sun',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Products Table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `short_info` VARCHAR(500) NOT NULL,
  `full_description` TEXT NULL,
  `approx_price` DECIMAL(12, 2) NOT NULL,
  `gst_rate` DECIMAL(5, 2) NOT NULL DEFAULT 12.00,
  `hsn_code` VARCHAR(20) DEFAULT '85414011',
  `stock_qty` INT NOT NULL DEFAULT 10,
  `stock_status` ENUM('in_stock', 'limited_stock', 'out_of_stock') DEFAULT 'in_stock',
  `primary_image` VARCHAR(255) NOT NULL,
  `warranty` VARCHAR(100) NOT NULL DEFAULT '25 Years Performance Warranty',
  `specifications` JSON NULL,
  `key_features` JSON NULL,
  `is_featured` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Product Additional Images Table
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Services Table
CREATE TABLE IF NOT EXISTS `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `short_desc` VARCHAR(500) NOT NULL,
  `full_desc` TEXT NULL,
  `icon` VARCHAR(50) DEFAULT 'wrench',
  `key_features` JSON NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Quotations Table
CREATE TABLE IF NOT EXISTS `quotes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quote_number` VARCHAR(50) NOT NULL UNIQUE,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(20) NOT NULL,
  `customer_email` VARCHAR(100) NULL,
  `customer_address` TEXT NOT NULL,
  `city` VARCHAR(100) DEFAULT 'Dindori',
  `district` VARCHAR(100) DEFAULT 'Nashik',
  `pincode` VARCHAR(10) DEFAULT '422202',
  `customer_notes` TEXT NULL,
  `subtotal` DECIMAL(12, 2) NOT NULL,
  `discount_amount` DECIMAL(12, 2) DEFAULT 0.00,
  `taxable_amount` DECIMAL(12, 2) NOT NULL,
  `cgst_amount` DECIMAL(12, 2) NOT NULL,
  `sgst_amount` DECIMAL(12, 2) NOT NULL,
  `total_gst` DECIMAL(12, 2) NOT NULL,
  `grand_total` DECIMAL(12, 2) NOT NULL,
  `grand_total_words` VARCHAR(500) NOT NULL,
  `validity_days` INT DEFAULT 15,
  `status` ENUM('Pending', 'Replied', 'Closed') DEFAULT 'Pending',
  `admin_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Quotation Items Table
CREATE TABLE IF NOT EXISTS `quote_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quote_id` INT NOT NULL,
  `product_id` INT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `category_name` VARCHAR(100) DEFAULT 'Solar Equipment',
  `hsn_code` VARCHAR(20) DEFAULT '85414011',
  `quantity` INT NOT NULL DEFAULT 1,
  `unit_price` DECIMAL(12, 2) NOT NULL,
  `discount` DECIMAL(12, 2) DEFAULT 0.00,
  `taxable_amount` DECIMAL(12, 2) NOT NULL,
  `gst_rate` DECIMAL(5, 2) NOT NULL,
  `cgst_amount` DECIMAL(12, 2) NOT NULL,
  `sgst_amount` DECIMAL(12, 2) NOT NULL,
  `total_amount` DECIMAL(12, 2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_quote_items_quote` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Gallery Table
CREATE TABLE IF NOT EXISTS `gallery` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(200) NOT NULL,
  `category` ENUM('Installations', 'Materials', 'Documentation') NOT NULL,
  `description` TEXT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `location` VARCHAR(100) DEFAULT 'Dindori, Nashik',
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Admin Users Table
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `role` VARCHAR(50) DEFAULT 'admin',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Contact Messages Table
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100) NULL,
  `subject` VARCHAR(200) DEFAULT 'General Inquiry',
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for performance
CREATE INDEX idx_products_category ON `products` (`category_id`);
CREATE INDEX idx_products_stock ON `products` (`stock_status`);
CREATE INDEX idx_quotes_status ON `quotes` (`status`);
CREATE INDEX idx_gallery_cat ON `gallery` (`category`);
