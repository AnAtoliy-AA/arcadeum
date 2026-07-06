#!/bin/bash

set -e

# Get the current version from web app package.json (allow override for testing)
if [ -z "$CURRENT_VERSION" ]; then
  CURRENT_VERSION=$(node -p "require('./apps/web/package.json').version")
fi

# Extract the commit hash of the previous version bump (allow override for testing)
if [ -z "$PREVIOUS_COMMIT" ]; then
  PREVIOUS_COMMIT=$(git log --oneline --grep="chore: bump version to v" --pretty=format:"%h" | head -1)
fi

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

# Extract commits since the last version (using the subject only, no hash)
COMMITS=$(git log --format="%s" "$PREVIOUS_COMMIT"..HEAD --no-merges)

# Create a temporary changelog entry
TEMP_CHANGELOG=$(mktemp)

# Parse commits and categorize them
echo "## [$CURRENT_VERSION] - $(date +%Y-%m-%d)" > "$TEMP_CHANGELOG"
echo "" >> "$TEMP_CHANGELOG"

# Look for features
FEATURES=$(echo "$COMMITS" | grep -E "^(feat|ARC-[0-9]+ feat)" || true)
if [ -n "$FEATURES" ]; then
  echo "### Added" >> "$TEMP_CHANGELOG"
  echo "$FEATURES" | while read -r line; do
    ISSUE=$(echo "$line" | grep -oE "ARC-[0-9]+" || echo "N/A")
    DESC=$(echo "$line" | sed -E 's/^([^:]+: )//')
    echo "- $DESC ($ISSUE)" >> "$TEMP_CHANGELOG"
  done
  echo "" >> "$TEMP_CHANGELOG"
fi

# Look for fixes
FIXES=$(echo "$COMMITS" | grep -E "^(fix|ARC-[0-9]+ fix)" || true)
if [ -n "$FIXES" ]; then
  echo "### Fixed" >> "$TEMP_CHANGELOG"
  echo "$FIXES" | while read -r line; do
    ISSUE=$(echo "$line" | grep -oE "ARC-[0-9]+" || echo "N/A")
    DESC=$(echo "$line" | sed -E 's/^([^:]+: )//')
    echo "- $DESC ($ISSUE)" >> "$TEMP_CHANGELOG"
  done
  echo "" >> "$TEMP_CHANGELOG"
fi

# Look for improvements
IMPROVEMENTS=$(echo "$COMMITS" | grep -E "^(perf|improve|ARC-[0-9]+ improve|ARC-[0-9]+ improved)" || true)
if [ -n "$IMPROVEMENTS" ]; then
  echo "### Improved" >> "$TEMP_CHANGELOG"
  echo "$IMPROVEMENTS" | while read -r line; do
    ISSUE=$(echo "$line" | grep -oE "ARC-[0-9]+" || echo "N/A")
    DESC=$(echo "$line" | sed -E 's/^([^:]+: )//')
    echo "- $DESC ($ISSUE)" >> "$TEMP_CHANGELOG"
  done
  echo "" >> "$TEMP_CHANGELOG"
fi

# Look for refactors
REFACTOR=$(echo "$COMMITS" | grep -E "^(refactor|ARC-[0-9]+ refactor)" || true)
if [ -n "$REFACTOR" ]; then
  echo "### Refactored" >> "$TEMP_CHANGELOG"
  echo "$REFACTOR" | while read -r line; do
    ISSUE=$(echo "$line" | grep -oE "ARC-[0-9]+" || echo "N/A")
    DESC=$(echo "$line" | sed -E 's/^([^:]+: )//')
    echo "- $DESC ($ISSUE)" >> "$TEMP_CHANGELOG"
  done
  echo "" >> "$TEMP_CHANGELOG"
fi

# Look for documentation
DOCS=$(echo "$COMMITS" | grep -E "^(docs|ARC-[0-9]+ docs)" || true)
if [ -n "$DOCS" ]; then
  echo "### Documentation" >> "$TEMP_CHANGELOG"
  echo "$DOCS" | while read -r line; do
    ISSUE=$(echo "$line" | grep -oE "ARC-[0-9]+" || echo "N/A")
    DESC=$(echo "$line" | sed -E 's/^([^:]+: )//')
    echo "- $DESC ($ISSUE)" >> "$TEMP_CHANGELOG"
  done
  echo "" >> "$TEMP_CHANGELOG"
fi

# Read the existing changelog
if [ -f "CHANGELOG.md" ]; then
  cat "CHANGELOG.md" > "$TEMP_CHANGELOG.old"
else
  echo "# Changelog" > "$TEMP_CHANGELOG.old"
  echo "" >> "$TEMP_CHANGELOG.old"
  echo "All notable changes to this project will be documented in this file." >> "$TEMP_CHANGELOG.old"
  echo "" >> "$TEMP_CHANGELOG.old"
  echo "The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)," >> "$TEMP_CHANGELOG.old"
  echo "and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)." >> "$TEMP_CHANGELOG.old"
  echo "" >> "$TEMP_CHANGELOG.old"
  echo "## [Unreleased]" >> "$TEMP_CHANGELOG.old"
  echo "" >> "$TEMP_CHANGELOG.old"
fi

# Check if this version already exists in changelog
if grep -q "## \[$CURRENT_VERSION\]" "$TEMP_CHANGELOG.old"; then
  echo "Version $CURRENT_VERSION already exists in CHANGELOG.md, skipping update."
  exit 0
fi

# Extract Unreleased content if IS_RELEASE is true
UNRELEASED_CONTENT=""
# Find line where [Unreleased] starts
UNRELEASED_START=$(grep -n "^## \[Unreleased\]" "$TEMP_CHANGELOG.old" | cut -d: -f1)

if [ -n "$UNRELEASED_START" ]; then
  # Find where the next version starts after Unreleased
  NEXT_VERSION_AFTER_UNRELEASED=$(tail -n +$((UNRELEASED_START + 1)) "$TEMP_CHANGELOG.old" | grep -n "^## \[" | head -1 | cut -d: -f1)
  
  if [ "$IS_RELEASE" = "true" ]; then
    if [ -n "$NEXT_VERSION_AFTER_UNRELEASED" ]; then
      UNRELEASED_CONTENT=$(sed -n "$((UNRELEASED_START + 1)),$((UNRELEASED_START + NEXT_VERSION_AFTER_UNRELEASED - 1))p" "$TEMP_CHANGELOG.old")
    else
      UNRELEASED_CONTENT=$(tail -n +$((UNRELEASED_START + 1)) "$TEMP_CHANGELOG.old")
    fi
    echo "Moving [Unreleased] items to version $CURRENT_VERSION"
    echo "" >> "$TEMP_CHANGELOG"
    echo "$UNRELEASED_CONTENT" >> "$TEMP_CHANGELOG"
  fi
  
  # Create a file with the Unreleased section removed
  if [ -n "$NEXT_VERSION_AFTER_UNRELEASED" ]; then
    head -n $((UNRELEASED_START - 1)) "$TEMP_CHANGELOG.old" > "$TEMP_CHANGELOG.no_unreleased"
    tail -n +$((UNRELEASED_START + NEXT_VERSION_AFTER_UNRELEASED)) "$TEMP_CHANGELOG.old" >> "$TEMP_CHANGELOG.no_unreleased"
  else
    head -n $((UNRELEASED_START - 1)) "$TEMP_CHANGELOG.old" > "$TEMP_CHANGELOG.no_unreleased"
  fi
else
  cat "$TEMP_CHANGELOG.old" > "$TEMP_CHANGELOG.no_unreleased"
fi

# Reconstruct CHANGELOG.md
# 1. Preamble (before any ## [)
# 2. ## [Unreleased]
# 3. New version
# 4. Rest of versions

FIRST_VERSION_IN_CLEAN=$(grep -n "^## \[" "$TEMP_CHANGELOG.no_unreleased" | head -1 | cut -d: -f1)

if [ -n "$FIRST_VERSION_IN_CLEAN" ]; then
  head -n $((FIRST_VERSION_IN_CLEAN - 1)) "$TEMP_CHANGELOG.no_unreleased" > "CHANGELOG.md"
  {
    echo "## [Unreleased]"
    echo ""
    cat "$TEMP_CHANGELOG"
    echo ""
    tail -n +$FIRST_VERSION_IN_CLEAN "$TEMP_CHANGELOG.no_unreleased"
  } >> "CHANGELOG.md"
else
  cat "$TEMP_CHANGELOG.no_unreleased" > "CHANGELOG.md"
  {
    echo ""
    echo "## [Unreleased]"
    echo ""
    cat "$TEMP_CHANGELOG"
  } >> "CHANGELOG.md"
fi

# Clean up
rm -f "$TEMP_CHANGELOG" "$TEMP_CHANGELOG.old" "$TEMP_CHANGELOG.no_unreleased"

echo "Changelog generated for version $CURRENT_VERSION"

