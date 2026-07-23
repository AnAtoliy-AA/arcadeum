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

echo "==> Building task-bot..."
cd "${DEPLOY_DIR}/bots/task-bot"
pnpm build
cd "${DEPLOY_DIR}"

echo "==> Restarting services..."
pm2 restart arcadeum-be arcadeum-tg-bot task-bot task-worker

echo "==> Deploy complete! Status:"
pm2 list
