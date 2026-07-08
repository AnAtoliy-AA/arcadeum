#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="/opt/arcadeum"

echo "==> Pulling latest code..."
cd "${DEPLOY_DIR}"
git fetch origin develop
git reset --hard origin/develop

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Building task-bot..."
pnpm --filter task-bot build

echo "==> Ensuring gh, opencode, mimo are in PATH..."
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
which gh || echo "WARNING: gh not found"
which opencode || echo "WARNING: opencode not found"
which mimo || echo "WARNING: mimo not found"

echo "==> Restarting task-bot..."
pm2 restart task-bot || \
  cd "${DEPLOY_DIR}/bots/task-bot" && \
  pm2 start "node dist/src/main.js" --name task-bot --cwd "${DEPLOY_DIR}/bots/task-bot"

echo "==> Deploy complete! Status:"
pm2 list
