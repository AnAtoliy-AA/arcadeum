#!/usr/bin/env bash
# Enforce max 500 lines per file (AGENTS.md rule)

MAX_LINES=500
VIOLATIONS=0

while IFS= read -r -d '' file; do
  if [[ -f "$file" ]]; then
    lines=$(wc -l < "$file")
    if (( lines > MAX_LINES )); then
      echo "❌ $file: $lines lines (max $MAX_LINES)"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  fi
done < <(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  ! -path "./node_modules/*" ! -path "./.turbo/*" ! -path "./dist/*" ! -path "./build/*" \
  ! -path "./.next/*" ! -path "./.worktrees/*" ! -path "./packages/ui/node_modules/*" \
  ! -path "./apps/*/node_modules/*" ! -path "./apps/*/.next/*" ! -path "./bots/task-bot/dist/*" -print0)

if (( VIOLATIONS > 0 )); then
  echo "❌ $VIOLATIONS file(s) exceed $MAX_LINES lines"
  exit 1
fi

exit 0