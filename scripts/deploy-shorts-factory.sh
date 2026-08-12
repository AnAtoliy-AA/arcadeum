#!/usr/bin/env bash
set -euo pipefail

DEPLOY_DIR="/opt/arcadeum"

echo "==> Pulling latest code..."
cd "${DEPLOY_DIR}"
git fetch origin develop
git reset --hard origin/develop

echo "==> Installing dependencies..."
pnpm install --frozen-lockfile

echo "==> Installing Playwright browsers..."
npx playwright install chromium
sudo npx playwright install chromium
npx playwright install-deps chromium 2>/dev/null || true

echo "==> Creating directories and setting permissions..."
mkdir -p raw_captures
mkdir -p output
sudo mkdir -p pending
sudo chown -R ubuntu:ubuntu pending 2>/dev/null || true
sudo chmod -R 777 pending 2>/dev/null || true

echo "==> Deploy complete!"
echo ""
echo "To run manually:"
echo "  xvfb-run node scripts/shorts-factory/factory.js"
echo ""
echo "Cron job should already be configured."
