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
pnpm --filter web build
pm2 restart arcadeum-be arcadeum-web
echo "==> Prod deployed from origin/main: $(git log -1 --oneline)"
