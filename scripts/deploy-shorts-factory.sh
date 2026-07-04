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
npx playwright install-deps chromium

echo "==> Creating directories..."
mkdir -p raw_captures
mkdir -p output

echo "==> Deploy complete!"
echo ""
echo "To run manually:"
echo "  xvfb-run node scripts/shorts-factory/factory.js"
echo ""
echo "Cron job should already be configured."
