#!/usr/bin/env bash
# Block 'any' type usage (AGENTS.md rule)

VIOLATIONS=0

while IFS= read -r -d '' file; do
  if [[ -f "$file" ]]; then
    # Skip test files, declaration files, config files, generated files
    if [[ "$file" =~ \.(test|spec|stories|d)\.(ts|tsx)$ ]] || \
       [[ "$file" =~ /(node_modules|\.turbo|dist|build|scripts|\.next|\.worktrees)/ ]] || \
       [[ "$file" =~ /\.storybook/ ]] || \
       [[ "$file" =~ setup-tests\.ts$ ]]; then
      continue
    fi

    # Look for explicit 'any' type annotations (not in comments/strings)
    # Pattern: : any, : any[], : any>, as any, <any>, any[, any>
    matches=$(grep -nE '(:|<)\s*any(\s*[\[\]>\,\)])' "$file" 2>/dev/null | \
      grep -vE '(//|/\*|\*/)' | \
      grep -vE 'Record<string, any>' | \
      grep -vE 'Promise<any>' | \
      head -20)

    if [[ -n "$matches" ]]; then
      echo "❌ $file - explicit 'any' type usage:"
      echo "$matches"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  fi
done < <(find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  ! -path "./node_modules/*" ! -path "./.turbo/*" ! -path "./dist/*" ! -path "./build/*" \
  ! -path "./.next/*" ! -path "./.worktrees/*" -print0)

if (( VIOLATIONS > 0 )); then
  echo "❌ $VIOLATIONS file(s) use 'any' type (use 'unknown' or specific types instead)"
  exit 1
fi

exit 0