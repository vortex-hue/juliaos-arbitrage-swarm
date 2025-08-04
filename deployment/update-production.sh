#!/bin/bash

# Update Production Server Script
# This script updates the server with CORS fixes and restarts services

echo "🔄 Updating production server with CORS fixes..."

# Set variables
APP_DIR="/var/www/juliaos-arbitrage-swarm"

# Navigate to application directory
cd $APP_DIR

# Pull latest changes
echo "📥 Pulling latest changes from repository..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
cd server && npm install --production
cd ../frontend && npm install --production

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Restart PM2 processes
echo "🚀 Restarting PM2 processes..."
pm2 restart all

# Test the application
echo "🧪 Testing application..."
sleep 5

# Check if services are running
echo "📊 Checking service status..."
pm2 status

# Test API endpoints
echo "🌐 Testing API endpoints..."
curl -s https://api.xendex.com.ng/api/status | head -5

echo "✅ Production update completed!"
echo ""
echo "🌐 Your application is now available at:"
echo "   Frontend: https://juliaos.xendex.com.ng"
echo "   API: https://api.xendex.com.ng"
echo ""
echo "📊 Check PM2 status: pm2 status"
echo "📋 View logs: pm2 logs" 