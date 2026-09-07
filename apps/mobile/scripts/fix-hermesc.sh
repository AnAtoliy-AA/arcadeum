#!/bin/sh
# Ensure the hermesc binary is executable in pnpm monorepo setups.
# In .pnpm store and hoisted node_modules, hermesc can lose +x after install.

ROOT="$(pwd)"
while [ ! -f "$ROOT/pnpm-workspace.yaml" ] && [ "$ROOT" != "/" ]; do
  ROOT="$(dirname "$ROOT")"
done

find "$ROOT/node_modules/.pnpm" \
  -path '*/react-native/sdks/hermesc/linux64-bin/hermesc' \
  -exec chmod 755 {} + 2>/dev/null

find "$ROOT/node_modules/react-native" \
  -path '*/sdks/hermesc/linux64-bin/hermesc' \
  -exec chmod 755 {} + 2>/dev/null
