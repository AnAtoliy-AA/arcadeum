#!/usr/bin/env bash
# Prod deploys come from MAIN. Serves api.arcadeum.games (:4000) + fast.arcadeum.games (:3000)
set -euo pipefail
cd /opt/arcadeum
git fetch origin main
git reset --hard origin/main
pnpm install --frozen-lockfile

echo "==> Syncing Playwright browsers (shorts-factory runs on this host)..."
npx playwright install chromium

pnpm --filter be build
pm2 restart arcadeum-be

# Web: build + immutable release + atomic switch + health check (never build
# into the directory the live server runs from). See docs/deploy/web-releases.md.
DEPLOY_DIR=/opt/arcadeum PM2_NAME=arcadeum-web WEB_PORT=3000 \
  bash /opt/arcadeum/scripts/deploy-web-release.sh
echo "==> Prod deployed from origin/main: $(git log -1 --oneline)"
