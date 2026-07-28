#!/usr/bin/env bash
# Block hardcoded user-facing strings, enforce i18n keys

VIOLATIONS=0

while IFS= read -r -d '' file; do
  if [[ -f "$file" ]]; then
    if [[ "$file" =~ \.(test|spec|stories)\.(ts|tsx|js|jsx)$ ]] || \
       [[ "$file" =~ /(locales|i18n|node_modules|\.worktrees|\.next|\.turbo|dist|build)/ ]] || \
       [[ "$file" =~ \.(json|md|css|scss|d\.ts)$ ]] || \
       [[ "$file" =~ /\.storybook/ ]] || \
       [[ "$file" =~ setup-tests\.ts$ ]]; then
      continue
    fi

    if [[ ! "$file" =~ \.(tsx|jsx)$ ]]; then
      continue
    fi

    matches=$(grep -nE '>[^<>{}]+<' "$file" 2>/dev/null | \
      grep -vE '(className|styleName|data-testid|href=|src=|type=|onClick|onChange|value=|defaultValue=|name=|id=|role=|tabIndex|autoFocus|dangerouslySetInnerHTML|aria-hidden|//|/\*|\*/)' | \
      grep -vE '>\s*[\{\$\d]' | \
      grep -vE '[🎮⚡👑👥⏱️🚢📏🏁🤖⏱️💀🃏🎴🪙💎🏆⚖️🔥❤️👋🛑🖱⌨🚪⭐✓↻❓❗😀⚙🔒🔑🎯🔄🔔🐱🐛🦁🦊🐼]' | \
      grep -vE '(Icon|IconEmoji|Emoji|RobotEmoji|TimerEmoji|QuickButtonText|EmptyAvatarText|GameIcon|StreakSuffix|PWAFeatureIcon|MinimizeIcon|MaximizeIcon|DividerLabel|MetaText|SliderLabel|PlayerBadge)' | \
      grep -vE 'Loading|loading|loading:' | \
      grep -vE '(Record|Promise|unknown|string|number|boolean|void|any|type|interface|Omit|GetProps|Pick|Partial|Required)\s*[<:=]' | \
      grep -vE 'if\s*\(|for\s*\(|while\s*\(' | \
      grep -vE '\?\s*:\s*' | \
      grep -vE 'export\s+const|export\s+interface|export\s+type|const\s+\w+\s*=' | \
      grep -vE 'someUnderMin|isLow|isCritical' | \
      grep -vE 'tabBar=|ItemSeparatorComponent=' | \
      head -20)

    if [[ -n "$matches" ]]; then
      echo "❌ $file - possible hardcoded strings:"
      echo "$matches"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  fi
done < <(find . -type f \( -name "*.tsx" -o -name "*.jsx" \) \
  ! -path "./node_modules/*" ! -path "./.worktrees/*" ! -path "./.next/*" \
  ! -path "./.turbo/*" ! -path "./dist/*" ! -path "./build/*" -print0)

if (( VIOLATIONS > 0 )); then
  echo "❌ $VIOLATIONS file(s) may have hardcoded user-facing strings. Use i18n keys (getTranslations/useTranslation)."
  exit 1
fi

exit 0