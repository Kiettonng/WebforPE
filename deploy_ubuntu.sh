#!/bin/bash

# Update package lists
sudo apt update

# Install Apache, PHP, and required PHP extensions
sudo apt install -y apache2 php libapache2-mod-php php-mysql php-curl php-mbstring php-zip php-gd php-xml unzip

# Enable Apache PHP module and restart Apache
sudo a2enmod php
sudo systemctl restart apache2

# Copy project files to Apache web root
# Assumes this script is run from the project root directory containing 'html' folder
sudo cp -r html/* /var/www/html/

# Set ownership and permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# Create uploads directory for avatar uploads
sudo mkdir -p /var/www/html/uploads
sudo chown -R www-data:www-data /var/www/html/uploads
sudo chmod -R 755 /var/www/html/uploads

echo "Deployment completed."
echo "You can access the web application at http://localhost/ or your server IP."
