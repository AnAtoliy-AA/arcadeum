#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

echo "==> Installing MongoDB 7..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor --yes
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org

echo "==> Starting MongoDB..."
sudo systemctl start mongod
sudo systemctl enable mongod

echo "==> Installing pnpm..."
sudo npm install -g pnpm

echo "==> Installing PM2..."
sudo npm install -g pm2

echo "==> Installing nginx..."
sudo apt install -y nginx
sudo systemctl enable nginx

DEPLOY_DIR="/opt/arcadeum"

echo "==> Setting up project..."
sudo mkdir -p /opt
sudo chown "$USER" /opt
cd /opt

if [ ! -d "arcadeum" ]; then
  git clone https://github.com/AnAtoliy-AA/arcadeum.git arcadeum
fi

cd arcadeum
git fetch origin main
git reset --hard origin/main

pnpm install

echo "==> Building apps..."
pnpm --filter be build
pnpm --filter tg-bot build

echo "==> Creating env files..."
cp apps/be/.env.example apps/be/.env
cp apps/tg-bot/.env.example apps/tg-bot/.env

MONGO_PASS=$(openssl rand -hex 16)
echo "MONGO_PASSWORD=$MONGO_PASS" > .env

echo ""
echo "============================================"
echo "  Now configure secrets and start services"
echo "============================================"
echo ""

# Create MongoDB admin user
echo "==> Creating MongoDB admin user..."
mongosh --eval "db.createUser({user:'admin',pwd:'${MONGO_PASS}',roles:['root']})" --authenticationDatabase admin 2>/dev/null || true

# Create prod and test databases
echo "==> Creating prod and test databases..."
mongosh --eval "db.getSiblingDB('prod')" --authenticationDatabase admin 2>/dev/null || true
mongosh --eval "db.getSiblingDB('test')" --authenticationDatabase admin 2>/dev/null || true

# Secure .env file permissions
chmod 600 "${DEPLOY_DIR}/apps/be/.env"
echo "==> Set .env permissions to 600 (owner read/write only)"

# Configure nginx reverse proxy
echo "==> Configuring nginx..."
sudo tee /etc/nginx/sites-available/arcadeum > /dev/null << 'NGINX'
# Prod API: api.arcadeum.games -> localhost:4000
# Dev API:  api-dev.arcadeum.games -> localhost:4002

# WebSocket upgrade map
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl http2;
    server_name api.arcadeum.games;

    ssl_certificate     /etc/letsencrypt/live/api.arcadeum.games/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.arcadeum.games/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}

server {
    listen 443 ssl http2;
    server_name api-dev.arcadeum.games;

    ssl_certificate     /etc/letsencrypt/live/api-dev.arcadeum.games/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api-dev.arcadeum.games/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:4002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}

# HTTP -> HTTPS redirects
server {
    listen 80;
    server_name api.arcadeum.games;
    return 301 https://$host$request_uri;
}

server {
    listen 80;
    server_name api-dev.arcadeum.games;
    return 301 https://$host$request_uri;
}
NGINX

sudo ln -sf /etc/nginx/sites-available/arcadeum /etc/nginx/sites-enabled/arcadeum
sudo rm -f /etc/nginx/sites-enabled/default

echo ""
echo "============================================"
echo "  Manual steps required"
echo "============================================"
echo ""
echo "1. DNS — add these A records pointing to this VM's public IP:"
echo "   api.arcadeum.games      A   <VM_PUBLIC_IP>"
echo "   api-dev.arcadeum.games  A   <VM_PUBLIC_IP>"
echo ""
echo "2. SSL — after DNS propagates, run:"
echo "   sudo apt install -y certbot python3-certbot-nginx"
echo "   sudo certbot certonly --nginx -d api.arcadeum.games -d api-dev.arcadeum.games"
echo "   sudo systemctl reload nginx"
echo ""
echo "3. Edit backend env (production):"
echo "   nano ${DEPLOY_DIR}/apps/be/.env"
echo ""
echo "   MONGODB_OCI_URI=mongodb://admin:${MONGO_PASS}@localhost:27017/prod?authSource=admin"
echo "   ALLOWED_ORIGINS=https://arcadeum.games,https://arcadeum.vercel.app,https://arcadeum-dev.vercel.app,https://api.arcadeum.games,https://api-dev.arcadeum.games"
echo ""
echo "   Also fill in: AUTH_JWT_SECRET, SOLANA_PRIVATE_KEY, OAUTH_*, etc."
echo ""
echo "4. Create dev env by copying and editing:"
echo "   cp ${DEPLOY_DIR}/apps/be/.env ${DEPLOY_DIR}/apps/be/.env.dev"
echo "   nano ${DEPLOY_DIR}/apps/be/.env.dev"
echo ""
echo "   MONGODB_OCI_URI=mongodb://admin:${MONGO_PASS}@localhost:27017/test?authSource=admin"
echo "   BE_PORT=4002"
echo "   ALLOWED_ORIGINS=https://arcadeum-dev.vercel.app,https://api-dev.arcadeum.games"
echo ""
echo "5. Edit tg-bot env:"
echo "   nano ${DEPLOY_DIR}/apps/tg-bot/.env"
echo ""
echo "   Fill in: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, PUMPFUN_MINT_ADDRESS"
echo ""
echo "6. Start production services:"
echo "   cd ${DEPLOY_DIR}"
echo "   pm2 start \"node apps/be/dist/src/main.js\" --name arcadeum-be"
echo "   pm2 start \"node bots/tg-bot/dist/src/main.js\" --name arcadeum-tg-bot"
echo ""
echo "7. Start dev services (after configuring .env.dev):"
echo "   cd ${DEPLOY_DIR}"
echo "   pm2 start \"node apps/be/dist/src/main.js\" --name arcadeum-be-dev"
echo "   pm2 start \"node bots/tg-bot/dist/src/main.js\" --name arcadeum-tg-bot-dev"
echo ""
echo "8. Save and enable PM2 on boot:"
echo "   pm2 save"
echo "   pm2 startup   # follow the output"
