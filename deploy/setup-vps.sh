#!/usr/bin/env bash
# ==============================================================================
# AI Bus VPS Automated Setup Script (Ubuntu 22.04 / 24.04 LTS)
# ==============================================================================
set -e

echo "=========================================================="
echo "🚀 Setting up Ubuntu VPS for AI Bus Deployment"
echo "=========================================================="

# 1. Update and upgrade system packages
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl wget git ufw apt-transport-https ca-certificates gnupg lsb-release

# 2. Configure UFW Firewall
echo "🛡️ Configuring UFW Firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable
sudo ufw status

# 3. Install Docker & Docker Compose Plugin
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine and Docker Compose..."
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Allow current user to run docker without sudo
    sudo usermod -aG docker $USER
    echo "Docker installed successfully!"
else
    echo "Docker is already installed."
fi

# 4. Install Nginx and Certbot
echo "🌐 Installing Nginx and Certbot..."
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Start and enable Nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# 5. Create deployment directory
APP_DIR="/var/www/aibus"
echo "📁 Setting up deployment directory at $APP_DIR..."
sudo mkdir -p "$APP_DIR"
sudo chown -R $USER:$USER "$APP_DIR"

echo "=========================================================="
echo "✅ VPS Base Setup Complete!"
echo "Next steps:"
echo "1. Log out and log back in (so docker group takes effect): exit"
echo "2. Clone your repository into $APP_DIR:"
echo "   git clone https://github.com/worknaiintern7/aibus.git $APP_DIR"
echo "3. Copy your .env file into $APP_DIR/.env"
echo "4. Set up Nginx reverse proxy using the templates in deploy/nginx/"
echo "5. Issue SSL certificate with Certbot:"
echo "   sudo certbot --nginx -d yourdomain.com -d admin.yourdomain.com -d agent.yourdomain.com -d api.yourdomain.com"
echo "=========================================================="
