#!/usr/bin/env bash
# https://nyosegawa.com/posts/harness-engineering-best-practices-2026/
set -euo pipefail

input="$(cat)"
file="$(jq -r '.tool_input.file_path // .tool_input.path // empty' <<< "$input")"

case "$file" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

npx biome format --write "$file" >/dev/null 2>&1 || true
npx oxlint --fix "$file" >/dev/null 2>&1 || true
diag="$(npx oxlint "$file" 2>&1 | head -20)"

if [ -n "$diag" ]; then
  jq -Rn --arg msg "$diag" '{
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: $msg
    }
  }'
fi