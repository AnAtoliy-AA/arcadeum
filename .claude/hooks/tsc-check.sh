#!/usr/bin/env bash
# PostToolUse hook: runs tsc --noEmit after editing .ts/.tsx files.
# Outputs additionalContext with errors and exits 2 to wake the model.

set -euo pipefail

f=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty' 2>/dev/null)

# Only check TypeScript files
echo "$f" | grep -qE '\.(ts|tsx)$' || exit 0

# Determine which app owns the file
if echo "$f" | grep -q '/apps/web/'; then
  dir="apps/web"
elif echo "$f" | grep -q '/apps/be/'; then
  dir="apps/be"
elif echo "$f" | grep -q '/apps/mobile/'; then
  dir="apps/mobile"
elif echo "$f" | grep -q '/packages/ui/'; then
  dir="packages/ui"
else
  exit 0
fi

errors=$(cd "$PWD/$dir" && pnpm tsc --noEmit 2>&1) || true

if [ -n "$errors" ]; then
  msg=$(echo "$errors" | head -50)
  jq -n --arg ctx "TypeScript errors found after editing $f in $dir:\n$msg" \
    '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$ctx}}'
  exit 2
fi
