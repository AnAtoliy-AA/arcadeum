#!/bin/bash

set -e

# Get the current version from web app package.json
CURRENT_VERSION=$(node -p "require('./apps/web/package.json').version")

# Extract the commit hash of the previous version bump
PREVIOUS_COMMIT=$(git log --oneline --grep="chore: bump version to v" --pretty=format:"%h" | head -1)

# Extract the version string from that commit message for display
PREVIOUS_VERSION=$(git log --oneline --grep="chore: bump version to v" --pretty=format:"%s" | grep -o "v[0-9]\+\.[0-9]\+\.[0-9]\+" | head -1)

# If no previous version found in commits, use the first commit as base
if [ -z "$PREVIOUS_COMMIT" ]; then
  echo "No previous release version found in commit messages. Using first commit as base."
  PREVIOUS_COMMIT=$(git rev-list --max-parents=0 HEAD)
  PREVIOUS_VERSION="v0.0.0"
else
  echo "Found previous version from commit message: $PREVIOUS_VERSION (commit: $PREVIOUS_COMMIT)"
fi

# Extract commits since the last version (using commit hash, not version string)
COMMITS=$(git log --oneline "$PREVIOUS_COMMIT"..HEAD --no-merges)

# Create a temporary changelog entry
TEMP_CHANGELOG=$(mktemp)

# Parse commits and categorize them
echo "## [$CURRENT_VERSION] - $(date +%Y-%m-%d)" > "$TEMP_CHANGELOG"
echo "" >> "$TEMP_CHANGELOG"

# Look for features
FEATURES=$(echo "$COMMITS" | grep -E "^(feat|ARC-[0-9]+ feat)" | sed 's/^[^:]*: //')
if [ -n "$FEATURES" ]; then
  echo "### Added" >> "$TEMP_CHANGELOG"
  echo "$FEATURES" | while read -r line; do
    ISSUE=$(echo "$line" | sed -E 's/^(ARC-[0-9]+) (.*)/\1/')
    DESC=$(echo "$line" | sed -E 's/^(ARC-[0-9]+) (.*)/\2/')
    echo "- $DESC ($ISSUE)" >> "$TEMP_CHANGELOG"
  done
  echo "" >> "$TEMP_CHANGELOG"
fi

# Look for fixes
FIXES=$(echo "$COMMITS" | grep -E "^(fix|ARC-[0-9]+ fix)" | sed 's/^[^:]*: //')
if [ -n "$FIXES" ]; then
  echo "### Fixed" >> "$TEMP_CHANGELOG"
  echo "$FIXES" | while read -r line; do
    ISSUE=$(echo "$line" | sed -E 's/^(ARC-[0-9]+) (.*)/\1/')
    DESC=$(echo "$line" | sed -E 's/^(ARC-[0-9]+) (.*)/\2/')
    echo "- $DESC ($ISSUE)" >> "$TEMP_CHANGELOG"
  done
  echo "" >> "$TEMP_CHANGELOG"
fi

# Look for improvements
IMPROVEMENTS=$(echo "$COMMITS" | grep -E "^(perf|improve|ARC-[0-9]+ improve|ARC-[0-9]+ improved)" | sed 's/^[^:]*: //')
if [ -n "$IMPROVEMENTS" ]; then
  echo "### Improved" >> "$TEMP_CHANGELOG"
  echo "$IMPROVEMENTS" | while read -r line; do
    ISSUE=$(echo "$line" | sed -E 's/^(ARC-[0-9]+) (.*)/\1/')
    DESC=$(echo "$line" | sed -E 's/^(ARC-[0-9]+) (.*)/\2/')
    echo "- $DESC ($ISSUE)" >> "$TEMP_CHANGELOG"
  done
  echo "" >> "$TEMP_CHANGELOG"
fi

# Look for refactors
REFACTOR=$(echo "$COMMITS" | grep -E "^(refactor|ARC-[0-9]+ refactor)" | sed 's/^[^:]*: //')
if [ -n "$REFACTOR" ]; then
  echo "### Refactored" >> "$TEMP_CHANGELOG"
  echo "$REFACTOR" | while read -r line; do
    ISSUE=$(echo "$line" | sed -E 's/^(ARC-[0-9]+) (.*)/\1/')
    DESC=$(echo "$line" | sed -E 's/^(ARC-[0-9]+) (.*)/\2/')
    echo "- $DESC ($ISSUE)" >> "$TEMP_CHANGELOG"
  done
  echo "" >> "$TEMP_CHANGELOG"
fi

# Look for documentation
DOCS=$(echo "$COMMITS" | grep -E "^(docs|ARC-[0-9]+ docs)" | sed 's/^[^:]*: //')
if [ -n "$DOCS" ]; then
  echo "### Documentation" >> "$TEMP_CHANGELOG"
  echo "$DOCS" | while read -r line; do
    ISSUE=$(echo "$line" | sed -E 's/^(ARC-[0-9]+) (.*)/\1/')
    DESC=$(echo "$line" | sed -E 's/^(ARC-[0-9]+) (.*)/\2/')
    echo "- $DESC ($ISSUE)" >> "$TEMP_CHANGELOG"
  done
  echo "" >> "$TEMP_CHANGELOG"
fi

# Read the existing changelog
if [ -f "CHANGELOG.md" ]; then
  cat "CHANGELOG.md" > "$TEMP_CHANGELOG.old"
else
  echo "# Changelog" > "$TEMP_CHANGELOG.old"
fi

# Combine the new entry with the existing changelog
# Find the position of the first version header or the end of the preamble
FIRST_VERSION_LINE=$(grep -n "^## \[" "$TEMP_CHANGELOG.old" | head -1 | cut -d: -f1)

if [ -n "$FIRST_VERSION_LINE" ]; then
  # Extract the header before the first version
  head -n $(($FIRST_VERSION_LINE - 1)) "$TEMP_CHANGELOG.old" > "$TEMP_CHANGELOG.header"
  # Extract the rest of the changelog after the first version
  tail -n +$FIRST_VERSION_LINE "$TEMP_CHANGELOG.old" > "$TEMP_CHANGELOG.rest"
  # Combine: header + new entry + rest
  cat "$TEMP_CHANGELOG.header" "$TEMP_CHANGELOG" "$TEMP_CHANGELOG.rest" > "CHANGELOG.md"
else
  # No version headers found. Locate the end of preamble (usually starts after '# Changelog' and its description)
  HEADER_END=$(grep -n "^# " "$TEMP_CHANGELOG.old" | head -1 | cut -d: -f1)
  if [ -z "$HEADER_END" ]; then HEADER_END=0; fi
  
  # Try to find where the preamble ends (after first blank line after header or similar)
  # For simplicity, if no version, we'll just append after the first few lines or prepend if totally empty
  if [ "$HEADER_END" -gt 0 ]; then
    head -n "$((HEADER_END + 4))" "$TEMP_CHANGELOG.old" > "$TEMP_CHANGELOG.header"
    tail -n +"$((HEADER_END + 5))" "$TEMP_CHANGELOG.old" > "$TEMP_CHANGELOG.rest"
    cat "$TEMP_CHANGELOG.header" "" "$TEMP_CHANGELOG" "$TEMP_CHANGELOG.rest" > "CHANGELOG.md"
  else
    cat "$TEMP_CHANGELOG" "$TEMP_CHANGELOG.old" > "CHANGELOG.md"
  fi
fi

# Clean up
rm -f "$TEMP_CHANGELOG" "$TEMP_CHANGELOG.old" "$TEMP_CHANGELOG.header" "$TEMP_CHANGELOG.rest"

echo "Changelog generated for version $CURRENT_VERSION"

