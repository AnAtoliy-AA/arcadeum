#!/usr/bin/env bash
# Block problematic cross-package imports (apps importing internal from other apps, packages importing from apps)

VIOLATIONS=0

while IFS= read -r -d '' file; do
  if [[ -f "$file" ]]; then
    # Skip test files, config, dist, node_modules
    if [[ "$file" =~ \.(test|spec|stories)\.(ts|tsx|js|jsx)$ ]] || \
       [[ "$file" =~ /\.(eslint|prettier|turbo) ]] || \
       [[ "$file" =~ /node_modules/ ]] || \
       [[ "$file" =~ /dist/ ]] || \
       [[ "$file" =~ /\.next/ ]] || \
       [[ "$file" =~ /\.worktrees/ ]]; then
      continue
    fi

    # Check if this is an app file importing internal code from another app
    if [[ "$file" == ./apps/* ]]; then
      current_app=$(echo "$file" | sed -E 's|^\./apps/([^/]+)/.*|\1|')
      
      # Check for imports from other apps' internal paths (not @arcadeum/ui or shared packages)
      matches=$(grep -nE "from\s+['\"](\.\./)+apps/(web|be|mobile|tg-bot)/" "$file" 2>/dev/null | head -5)
      if [[ -n "$matches" ]]; then
        echo "❌ $file - imports from other app:"
        echo "$matches"
        VIOLATIONS=$((VIOLATIONS + 1))
      fi

      # Check for absolute imports like @/apps/be/... from web
      if [[ "$current_app" == "web" ]]; then
        matches=$(grep -nE "from\s+['\"]@/(be|mobile|tg-bot)/" "$file" 2>/dev/null | head -5)
        if [[ -n "$matches" ]]; then
          echo "❌ $file - absolute import from other app:"
          echo "$matches"
          VIOLATIONS=$((VIOLATIONS + 1))
        fi
      fi
    fi

    # Check if packages/ imports from apps/
    if [[ "$file" == ./packages/* ]]; then
      matches=$(grep -nE "from\s+['\"](\.\./)+apps/(web|be|mobile|tg-bot)/" "$file" 2>/dev/null | head -5)
      if [[ -n "$matches" ]]; then
        echo "❌ $file - package imports from app:"
        echo "$matches"
        VIOLATIONS=$((VIOLATIONS + 1))
      fi
    fi

    # Check for relative imports going up 3+ levels (likely cross-package)
    matches=$(grep -nE "from\s+['\"](\.\./){3,}" "$file" 2>/dev/null | head -5)
    if [[ -n "$matches" ]]; then
      # Filter out legitimate deep imports within same package
      if [[ ! "$file" =~ /packages/ui/src/components/ ]] && [[ ! "$file" =~ /apps/web/src/features/ ]]; then
        echo "❌ $file - deep relative import (3+ levels up):"
        echo "$matches"
        VIOLATIONS=$((VIOLATIONS + 1))
      fi
    fi
  fi
done < <(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  ! -path "./node_modules/*" ! -path "./.turbo/*" ! -path "./dist/*" ! -path "./build/*" \
  ! -path "./.next/*" ! -path "./.worktrees/*" ! -path "./packages/ui/node_modules/*" \
  ! -path "./apps/*/node_modules/*" ! -path "./apps/*/.next/*" -print0)

if (( VIOLATIONS > 0 )); then
  echo "❌ $VIOLATIONS file(s) violate package import boundaries"
  exit 1
fi

exit 0