#!/bin/bash
set -e

KEY_FILE="aim-key.pem.pem"

if [ -z "$1" ]; then
  echo "Usage: ./deploy_to_ec2.sh <YOUR_EC2_PUBLIC_IP>"
  echo "Example: ./deploy_to_ec2.sh 54.210.12.34"
  exit 1
fi

EC2_IP="$1"

if [ ! -f "$KEY_FILE" ]; then
  echo "Error: Key file '$KEY_FILE' not found in current directory."
  exit 1
fi

chmod 400 "$KEY_FILE"

echo "========================================================"
echo "🚀 Deploying Agent IAM Backend to AWS EC2 ($EC2_IP)"
echo "========================================================"

# Test SSH connection
echo "📡 Checking SSH connection..."
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "$KEY_FILE" ubuntu@"$EC2_IP" "echo 'SSH Connection Established Successfully!'"

# Setup remote server
echo "📦 Installing Node.js, PM2, Build Tools, and Nginx on EC2..."
ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" ubuntu@"$EC2_IP" << 'EOF'
  set -e
  sudo apt update -y
  sudo apt install -y curl git build-essential python3 nginx

  # Install Node.js 20 if not installed
  if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
  fi

  # Install PM2
  sudo npm install -g pm2
EOF

echo "📤 Copying backend application files to EC2..."
ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" ubuntu@"$EC2_IP" "mkdir -p ~/app"
rsync -avz -e "ssh -o StrictHostKeyChecking=no -i $KEY_FILE" \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.pytest_cache' \
  ./aim-backend/ ubuntu@"$EC2_IP":~/app/aim-backend/

echo "🛠️ Building backend and starting PM2..."
ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" ubuntu@"$EC2_IP" << 'EOF'
  set -e
  cd ~/app/aim-backend
  npm install
  npm run build

  # Start/Restart app in PM2
  pm2 delete aim-backend 2>/dev/null || true
  pm2 start dist/app.js --name "aim-backend"
  pm2 save
EOF

echo "⚙️ Configuring Nginx reverse proxy..."
ssh -o StrictHostKeyChecking=no -i "$KEY_FILE" ubuntu@"$EC2_IP" << 'EOF'
  set -e
  cat << 'NGINX_CONF' | sudo tee /etc/nginx/sites-available/default > /dev/null
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
NGINX_CONF

  sudo nginx -t
  sudo systemctl restart nginx
EOF

echo "========================================================"
echo "✅ EC2 Deployment Completed Successfully!"
echo "========================================================"
echo "🔗 Health Check URL: http://$EC2_IP/api/health"
echo "🔗 Agents API URL:   http://$EC2_IP/api/agents"
echo "========================================================"
