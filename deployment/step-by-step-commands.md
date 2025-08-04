# 🚀 Ubuntu Server Deployment - Step by Step Commands

## **Step 1: Server Initial Setup**

### 1.1 Connect to your Ubuntu server
```bash
ssh root@your-server-ip
```

### 1.2 Update system packages
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Install essential packages
```bash
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

## **Step 2: Install Dependencies**

### 2.1 Install Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2.2 Install Python 3.8+
```bash
sudo apt install -y python3 python3-pip python3-venv
```

### 2.3 Install Julia
```bash
wget https://julialang-s3.julialang.org/bin/linux/x64/1.8/julia-1.8.5-linux-x86_64.tar.gz
sudo tar -xzf julia-1.8.5-linux-x86_64.tar.gz -C /opt
sudo ln -s /opt/julia-1.8.5/bin/julia /usr/local/bin/julia
rm julia-1.8.5-linux-x86_64.tar.gz
```

### 2.4 Install Nginx
```bash
sudo apt install -y nginx
```

### 2.5 Install Certbot for SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2.6 Install PM2 for process management
```bash
sudo npm install -g pm2
```

## **Step 3: Clone and Setup Application**

### 3.1 Create application directory
```bash
sudo mkdir -p /var/www/juliaos-arbitrage-swarm
sudo chown $USER:$USER /var/www/juliaos-arbitrage-swarm
```

### 3.2 Clone repository
```bash
cd /var/www
git clone https://github.com/vortex-hue/juliaos-arbitrage-swarm.git juliaos-arbitrage-swarm
cd juliaos-arbitrage-swarm
```

### 3.3 Install Node.js dependencies
```bash
cd server && npm install --production
cd ../frontend && npm install --production
```

### 3.4 Build frontend
```bash
npm run build
```

### 3.5 Install Python dependencies
```bash
cd ..
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3.6 Install Julia dependencies
```bash
julia -e 'using Pkg; Pkg.activate("."); Pkg.instantiate()'
```

## **Step 4: Configure Nginx**

### 4.1 Create Nginx configuration
```bash
sudo nano /etc/nginx/sites-available/juliaos-arbitrage-swarm
```

### 4.2 Copy the configuration (use the nginx-config.conf file content)
```bash
sudo cp deployment/nginx-config.conf /etc/nginx/sites-available/juliaos-arbitrage-swarm
```

### 4.3 Enable the site
```bash
sudo ln -sf /etc/nginx/sites-available/juliaos-arbitrage-swarm /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

### 4.4 Test Nginx configuration
```bash
sudo nginx -t
```

### 4.5 Restart Nginx
```bash
sudo systemctl restart nginx
```

## **Step 5: Setup PM2 Process Manager**

### 5.1 Create PM2 ecosystem file
```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'juliaos-backend',
      cwd: '/var/www/juliaos-arbitrage-swarm/server',
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
      cwd: '/var/www/juliaos-arbitrage-swarm',
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
```

### 5.2 Start applications with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## **Step 6: Configure DNS**

### 6.1 Point your domains to your server IP
Add these DNS records:
```
juliaos.xendex.com.ng  A  your-server-ip
api.xendex.com.ng      A  your-server-ip
```

## **Step 7: Setup SSL Certificates**

### 7.1 Get SSL certificates with Certbot
```bash
sudo certbot --nginx -d juliaos.xendex.com.ng -d api.xendex.com.ng --non-interactive --agree-tos --email your-email@example.com
```

### 7.2 Setup automatic renewal
```bash
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -
```

## **Step 8: Configure Firewall**

### 8.1 Allow necessary ports
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## **Step 9: Test Deployment**

### 9.1 Check PM2 status
```bash
pm2 status
```

### 9.2 Check Nginx status
```bash
sudo systemctl status nginx
```

### 9.3 Test your domains
```bash
curl -I https://juliaos.xendex.com.ng
curl -I https://api.xendex.com.ng
```

## **Step 10: Monitoring and Maintenance**

### 10.1 View PM2 logs
```bash
pm2 logs
```

### 10.2 Restart applications
```bash
pm2 restart all
```

### 10.3 Update application
```bash
cd /var/www/juliaos-arbitrage-swarm
git pull origin main
cd server && npm install --production
cd ../frontend && npm install --production && npm run build
pm2 restart all
```

### 10.4 Check SSL certificate renewal
```bash
sudo certbot renew --dry-run
```

## **🔧 Useful Commands**

### PM2 Commands
```bash
pm2 status          # Check application status
pm2 logs            # View logs
pm2 restart all     # Restart all applications
pm2 stop all        # Stop all applications
pm2 delete all      # Delete all applications
```

### Nginx Commands
```bash
sudo nginx -t                    # Test configuration
sudo systemctl restart nginx     # Restart Nginx
sudo systemctl status nginx      # Check status
sudo nginx -s reload            # Reload configuration
```

### SSL Commands
```bash
sudo certbot renew              # Renew certificates
sudo certbot certificates       # List certificates
sudo certbot delete --cert-name domain.com  # Delete certificate
```

### System Commands
```bash
sudo systemctl status nginx     # Check Nginx status
sudo journalctl -u nginx        # View Nginx logs
sudo ufw status                 # Check firewall status
```

## **🌐 Your Application URLs**

After deployment, your application will be available at:
- **Frontend**: https://juliaos.xendex.com.ng
- **API**: https://api.xendex.com.ng

## **📊 Monitoring**

### Check application health
```bash
# Check if applications are running
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check SSL certificates
sudo certbot certificates

# Check disk space
df -h

# Check memory usage
free -h
```

### View logs
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -f
``` 