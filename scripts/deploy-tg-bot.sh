#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="/opt/arcadeum"
BRANCH="${1:-main}"

echo "==> Pulling latest code from ${BRANCH}..."
cd "${DEPLOY_DIR}"
git fetch origin "${BRANCH}"
git reset --hard "origin/${BRANCH}"

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Building..."
pnpm --filter be build
pnpm --filter tg-bot build

echo "==> Building task-bot..."
cd "${DEPLOY_DIR}/bots/task-bot"
git fetch origin "${BRANCH}"
git reset --hard "origin/${BRANCH}"
pnpm build
cd "${DEPLOY_DIR}"

echo "==> Restarting services..."
pm2 restart arcadeum-be arcadeum-tg-bot task-bot task-worker

echo "==> Deploy complete! Status:"
pm2 list
