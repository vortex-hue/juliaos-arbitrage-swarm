#!/bin/bash

# JuliaOS Arbitrage Swarm Bot - Ubuntu Server Deployment Script

echo "🚀 Deploying JuliaOS Arbitrage Swarm Bot to Ubuntu server..."

# Set variables
APP_DIR="/var/www/juliaos-arbitrage-swarm"
REPO_URL="https://github.com/vortex-hue/juliaos-arbitrage-swarm.git"
DOMAIN_FRONTEND="juliaos.xendex.com.ng"
DOMAIN_API="api.xendex.com.ng"

# Create application directory if it doesn't exist
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or pull repository
if [ -d "$APP_DIR/.git" ]; then
    echo "📥 Pulling latest changes..."
    cd $APP_DIR
    git pull origin main
else
    echo "📥 Cloning repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd $APP_DIR/server
npm install --production

cd $APP_DIR/frontend
npm install --production

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd $APP_DIR
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install Julia dependencies
echo "📦 Installing Julia dependencies..."
julia -e 'using Pkg; Pkg.activate("."); Pkg.instantiate()'

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo cp $APP_DIR/deployment/nginx-config.conf /etc/nginx/sites-available/juliaos-arbitrage-swarm
sudo ln -sf /etc/nginx/sites-available/juliaos-arbitrage-swarm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Set up PM2 ecosystem
echo "⚙️ Setting up PM2..."
cd $APP_DIR
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'juliaos-backend',
      cwd: '$APP_DIR/server',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'juliaos-julia',
      cwd: '$APP_DIR',
      script: 'julia',
      args: 'test_simple.jl',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '2G',
      env: {
        JULIA_NUM_THREADS: 'auto'
      }
    }
  ]
};
EOF

# Start applications with PM2
echo "🚀 Starting applications with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Set up SSL certificates with Certbot
echo "🔒 Setting up SSL certificates..."
sudo certbot --nginx -d $DOMAIN_FRONTEND -d $DOMAIN_API --non-interactive --agree-tos --email your-email@example.com

# Set up automatic SSL renewal
echo "⏰ Setting up automatic SSL renewal..."
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create systemd service for PM2
echo "⚙️ Creating systemd service for PM2..."
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp /home/$USER

echo "✅ Deployment completed!"
echo ""
echo "🌐 Your application is now available at:"
echo "   Frontend: https://$DOMAIN_FRONTEND"
echo "   API: https://$DOMAIN_API"
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "🔧 Useful commands:"
echo "   PM2 logs: pm2 logs"
echo "   PM2 restart: pm2 restart all"
echo "   PM2 stop: pm2 stop all"
echo "   Nginx status: sudo systemctl status nginx"
echo "   SSL renewal: sudo certbot renew" 