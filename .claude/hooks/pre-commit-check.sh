#!/usr/bin/env bash
# Run lint + typecheck before commit

echo "🔍 Running lint..."
pnpm lint
LINT_EXIT=$?

echo "🔍 Running file length check..."
pnpm check-file-length
FILELEN_EXIT=$?

echo "🔍 Running translation check..."
pnpm check-translations
TRANS_EXIT=$?

if (( LINT_EXIT != 0 || FILELEN_EXIT != 0 || TRANS_EXIT != 0 )); then
  echo "❌ Lint, file-length, or translation check failed"
  exit 1
fi

echo "✅ All pre-commit checks passed"
exit 0