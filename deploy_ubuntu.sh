#!/bin/bash

# Update package lists
sudo apt update

# Install Apache, PHP, and required PHP extensions
sudo apt install -y apache2 php8.1 libapache2-mod-php8.1 php8.1-mysql php8.1-curl php8.1-mbstring php8.1-zip php8.1-gd php8.1-xml unzip

# Enable Apache modules
sudo a2enmod php8.1
sudo a2enmod rewrite

# Restart Apache
sudo systemctl restart apache2

# Create MySQL database and user
sudo mysql -e "CREATE DATABASE IF NOT EXISTS webforpe;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'webuser'@'localhost' IDENTIFIED BY 'ubun';"
sudo mysql -e "GRANT ALL PRIVILEGES ON webforpe.* TO 'webuser'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Import database schema
sudo mysql webforpe < supabase/migrations/20250602115341_empty_cliff.sql

# Copy project files to Apache web root
sudo rm -rf /var/www/html/*
sudo cp -r html/* /var/www/html/

# Set ownership and permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# Create uploads directory for avatar uploads
sudo mkdir -p /var/www/html/uploads
sudo chown -R www-data:www-data /var/www/html/uploads
sudo chmod -R 755 /var/www/html/uploads

echo "Deployment completed!"
echo "You can access the web application at http://localhost/ or your server IP."