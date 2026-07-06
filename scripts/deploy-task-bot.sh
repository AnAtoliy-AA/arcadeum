#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="/opt/arcadeum-task-bot"

echo "==> Pulling latest code..."
cd "${DEPLOY_DIR}"
git fetch origin main
git reset --hard origin/main

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Building..."
pnpm --filter task-bot build

echo "==> Restarting services..."
pm2 restart task-bot || pm2 start "node bots/task-bot/dist/src/main.js" --name task-bot

echo "==> Deploy complete! Status:"
pm2 list
