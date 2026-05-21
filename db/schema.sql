-- Create Database
CREATE DATABASE IF NOT EXISTS `insurance_management` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `insurance_management`;

-- Drop tables if exist
DROP TABLE IF EXISTS `employees`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `insurance_packages`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

-- Create Roles Table
CREATE TABLE `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Users Table
CREATE TABLE `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(120) NOT NULL,
    `role_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Employees Table
CREATE TABLE `employees` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `employee_code` VARCHAR(20) NOT NULL UNIQUE,
    `full_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(15),
    `position` VARCHAR(50),
    `department` VARCHAR(50),
    `salary` DOUBLE,
    `hire_date` DATE,
    `user_id` BIGINT UNIQUE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Customers Table
CREATE TABLE `customers` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `customer_code` VARCHAR(20) NOT NULL UNIQUE,
    `full_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(15),
    `address` VARCHAR(255),
    `date_of_birth` DATE,
    `gender` VARCHAR(10),
    `identity_card` VARCHAR(20),
    `user_id` BIGINT UNIQUE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create Insurance Packages Table
CREATE TABLE `insurance_packages` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `package_code` VARCHAR(20) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `description` TEXT,
    `price` DOUBLE NOT NULL,
    `duration_months` INT NOT NULL,
    `max_benefit` DOUBLE NOT NULL,
    `conditions` TEXT,
    `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Roles
INSERT INTO `roles` (`id`, `name`) VALUES 
(1, 'ROLE_ADMIN'),
(2, 'ROLE_EMPLOYEE'),
(3, 'ROLE_CUSTOMER');

-- Insert Users (Password is '123456' hashed with BCrypt)
-- Hash: $2a$10$y58yqCj1tWn91UhpwE0aUu3lApxF2197m61d15PpxWqYmE1Z.pGde
INSERT INTO `users` (`id`, `email`, `password`, `role_id`) VALUES 
(1, 'admin@insurance.com', '$2a$10$y58yqCj1tWn91UhpwE0aUu3lApxF2197m61d15PpxWqYmE1Z.pGde', 1),
(2, 'employee@insurance.com', '$2a$10$y58yqCj1tWn91UhpwE0aUu3lApxF2197m61d15PpxWqYmE1Z.pGde', 2),
(3, 'customer@insurance.com', '$2a$10$y58yqCj1tWn91UhpwE0aUu3lApxF2197m61d15PpxWqYmE1Z.pGde', 3);

-- Insert Employee profile for default employee user
INSERT INTO `employees` (`employee_code`, `full_name`, `phone_number`, `position`, `department`, `salary`, `hire_date`, `user_id`) VALUES
('EMP001', 'Nguyễn Văn Nhân Viên', '0987654321', 'Chuyên viên tư vấn', 'Phòng Kinh doanh', 12000000.0, '2026-01-15', 2);

-- Insert Customer profile for default customer user
INSERT INTO `customers` (`customer_code`, `full_name`, `phone_number`, `address`, `date_of_birth`, `gender`, `identity_card`, `user_id`) VALUES
('CUS001', 'Trần Thị Khách Hàng', '0912345678', '123 Đường Lê Lợi, Quận 1, TP. HCM', '1995-08-20', 'Nữ', '123456789', 3);

-- Insert Insurance Packages
INSERT INTO `insurance_packages` (`package_code`, `name`, `type`, `description`, `price`, `duration_months`, `max_benefit`, `conditions`, `status`) VALUES
('PKG-HEALTH-01', 'Bảo hiểm Sức khỏe Toàn diện', 'HEALTH', 'Hỗ trợ chi phí khám chữa bệnh nội trú và ngoại trú tại các bệnh viện liên kết.', 1500000.0, 12, 100000000.0, 'Khách hàng tuổi từ 1 đến 65, không mắc bệnh hiểm nghèo.', 'ACTIVE'),
('PKG-LIFE-02', 'An Sinh Thịnh Vượng', 'LIFE', 'Bảo hiểm nhân thọ tích lũy tài chính cho gia đình trước các rủi ro lớn.', 5000000.0, 36, 500000000.0, 'Độ tuổi từ 18 đến 55, khám sức khỏe đạt yêu cầu.', 'ACTIVE'),
('PKG-VEHICLE-03', 'Bảo hiểm Ô tô An Tâm', 'VEHICLE', 'Bồi thường thiệt hại vật chất xe và trách nhiệm dân sự đối với bên thứ ba.', 2000000.0, 12, 150000000.0, 'Xe ô tô đăng ký hợp lệ, không quá 10 năm sử dụng.', 'ACTIVE');

