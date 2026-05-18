-- Create Database
CREATE DATABASE IF NOT EXISTS `insurance_management` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `insurance_management`;

-- Drop tables if exist
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

-- Insert Roles
INSERT INTO `roles` (`id`, `name`) VALUES 
(1, 'ROLE_ADMIN'),
(2, 'ROLE_EMPLOYEE'),
(3, 'ROLE_CUSTOMER');

-- Insert Users (Password is '123456' hashed with BCrypt)
-- Hash: $2a$10$y58yqCj1tWn91UhpwE0aUu3lApxF2197m61d15PpxWqYmE1Z.pGde
INSERT INTO `users` (`email`, `password`, `role_id`) VALUES 
('admin@insurance.com', '$2a$10$y58yqCj1tWn91UhpwE0aUu3lApxF2197m61d15PpxWqYmE1Z.pGde', 1),
('employee@insurance.com', '$2a$10$y58yqCj1tWn91UhpwE0aUu3lApxF2197m61d15PpxWqYmE1Z.pGde', 2),
('customer@insurance.com', '$2a$10$y58yqCj1tWn91UhpwE0aUu3lApxF2197m61d15PpxWqYmE1Z.pGde', 3);
