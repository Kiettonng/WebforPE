-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS webforpe;

-- Use the database
USE webforpe;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_path VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create logs table for tracking user actions
CREATE TABLE IF NOT EXISTS logs (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id INT(11) NOT NULL,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create database user
CREATE USER IF NOT EXISTS 'webuser'@'localhost' IDENTIFIED BY 'ubun';
GRANT ALL PRIVILEGES ON webforpe.* TO 'webuser'@'localhost';
FLUSH PRIVILEGES;