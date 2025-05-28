#!/bin/bash

# Build the frontend
echo "Building frontend..."
npm run build

# Create deployment directory if it doesn't exist
echo "Creating deployment directory..."
sudo mkdir -p /var/www/html/your-app

# Copy frontend build files
echo "Copying frontend files..."
sudo cp -r dist/* /var/www/html/your-app/

# Copy API files
echo "Copying API files..."
sudo cp -r api /var/www/html/your-app/

# Set permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data /var/www/html/your-app
sudo chmod -R 755 /var/www/html/your-app

echo "Deployment complete!"