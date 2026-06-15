#!/usr/bin/env bash
# PostToolUse hook: warns when a .tsx component file is created outside packages/ui.
# Outputs additionalContext to remind Claude to check @arcadeum/ui first.

set -euo pipefail

f=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty' 2>/dev/null)

# Only check .tsx files
echo "$f" | grep -qE '\.tsx$' || exit 0

# Skip packages/ui itself — that's the right place
echo "$f" | grep -q '/packages/ui/' && exit 0

# Skip story, test, and page files — not reusable components
echo "$f" | grep -qE '\.(stories|test|spec)\.tsx$' && exit 0
echo "$f" | grep -qE '/(page|layout|loading|error|not-found)\.tsx$' && exit 0

# Only flag files inside a /components/ directory
echo "$f" | grep -q '/components/' || exit 0

# Skip files that are clearly app-level compositions (contain "View", "Client", "Container" suffix)
basename=$(basename "$f" .tsx)
echo "$basename" | grep -qE '(View|Client|Screen|Page)$' && exit 0

jq -n --arg f "$f" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: ("Component file created outside @arcadeum/ui: " + $f + "\n\nBefore finalizing this component, verify:\n1. Does an existing @arcadeum/ui component already cover this use case? Run /check-ui-components to audit.\n2. If this component is reusable across apps, it must live in packages/ui/src/components/, not in the app.\n3. If it is truly app-specific (composes shared components for one screen), it can stay — but its building blocks must come from @arcadeum/ui.")
  }
}'
exit 2
