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

echo ""
echo "1. Edit backend env:"
echo "   nano ${DEPLOY_DIR}/apps/be/.env"
echo ""
echo "   Set this line:"
echo "   MONGODB_URI=mongodb://admin:${MONGO_PASS}@localhost:27017/arcadeum?authSource=admin"
echo ""
echo "   Also fill in: AUTH_JWT_SECRET, SOLANA_PRIVATE_KEY, OAUTH_*, etc."
echo ""
echo "2. Edit tg-bot env:"
echo "   nano ${DEPLOY_DIR}/apps/tg-bot/.env"
echo ""
echo "   Fill in: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, PUMPFUN_MINT_ADDRESS"
echo ""
echo "3. Start services with pm2:"
echo "   cd ${DEPLOY_DIR}"
echo "   pm2 start \"node apps/be/dist/src/main.js\" --name arcadeum-be"
echo "   pm2 start \"node apps/tg-bot/dist/src/main.js\" --name arcadeum-tg-bot"
echo "   pm2 save"
echo "   pm2 startup   # follow the output"
echo ""
echo "4. Open ports in OCI console (4000, 4001)"
echo ""
echo "5. Test:"
echo "   curl localhost:4000/health"
echo "   curl localhost:4001/health"
