#!/bin/bash

# Quick CORS Fix Script
echo "🔧 Fixing CORS issues on production server..."

# Set variables
APP_DIR="/var/www/juliaos-arbitrage-swarm"

# Navigate to application directory
cd $APP_DIR

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Update Nginx configuration
echo "🌐 Updating Nginx configuration..."
sudo cp deployment/nginx-config.conf /etc/nginx/sites-available/juliaos-arbitrage-swarm
sudo nginx -t
sudo systemctl reload nginx

# Restart PM2 processes
echo "🚀 Restarting PM2 processes..."
pm2 restart all

# Wait a moment
sleep 3

# Test the fix
echo "🧪 Testing CORS fix..."
curl -H "Origin: https://juliaos.xendex.com.ng" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.xendex.com.ng/api/bot/start

echo "✅ CORS fix applied!"
echo "🌐 Test your application at: https://juliaos.xendex.com.ng" 