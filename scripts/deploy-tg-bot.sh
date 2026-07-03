#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="/opt/arcadeum"

echo "==> Pulling latest code..."
cd "${DEPLOY_DIR}"
git fetch origin main
git reset --hard origin/main

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Building..."
pnpm --filter be build
pnpm --filter tg-bot build

echo "==> Restarting services..."
pm2 restart arcadeum-be arcadeum-tg-bot

echo "==> Deploy complete! Status:"
pm2 list
