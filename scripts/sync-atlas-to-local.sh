#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

# Read Atlas URI from BE .env (MONGODB_ATLAS_URI or MONGODB_OCI_URI with SRV scheme)
if [ -f "$REPO_DIR/apps/be/.env" ]; then
  ATLAS_URI=$(grep -E '^MONGODB_ATLAS_URI=' "$REPO_DIR/apps/be/.env" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
fi

if [ -z "${ATLAS_URI:-}" ]; then
  echo "[$(date)] ERROR: MONGODB_ATLAS_URI not found in apps/be/.env"
  exit 1
fi

# Read local URI from BE .env (MONGODB_OCI_URI)
if [ -f "$REPO_DIR/apps/be/.env" ]; then
  LOCAL_URI=$(grep -E '^MONGODB_OCI_URI=' "$REPO_DIR/apps/be/.env" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
fi

if [ -z "${LOCAL_URI:-}" ]; then
  echo "[$(date)] ERROR: MONGODB_OCI_URI not found in apps/be/.env"
  exit 1
fi

DUMP_DIR="${ATLAS_SYNC_DUMP_DIR:-/tmp/atlas-sync-dump}"

echo "[$(date)] Starting Atlas → local sync..."

# Dump from Atlas
rm -rf "$DUMP_DIR"
mongodump --uri="$ATLAS_URI" --out="$DUMP_DIR" --gzip 2>&1 | tail -3

# Restore to local
if [ -d "$DUMP_DIR/prod" ]; then
  mongorestore --uri="$LOCAL_URI" --db=arcadeum "$DUMP_DIR/prod" --drop --gzip 2>&1 | tail -3
  echo "[$(date)] Sync complete."
else
  echo "[$(date)] ERROR: dump directory not found"
  exit 1
fi

# Cleanup
rm -rf "$DUMP_DIR"
