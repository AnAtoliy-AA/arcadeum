#!/usr/bin/env bash
# Starts PulseAudio + a virtual X screen, then the stream director.
# Used by the systemd unit; also handy for manual runs on a Linux box.
set -euo pipefail

W="${STREAM_WIDTH:-1280}"
H="${STREAM_HEIGHT:-720}"
if [[ "${STREAM_RESOLUTION:-}" =~ ^([0-9]+)x([0-9]+)$ ]]; then
  W="${BASH_REMATCH[1]}"; H="${BASH_REMATCH[2]}"
fi
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Virtual sink "arcadeum_live" is created by the director via pactl.
if command -v pulseaudio >/dev/null 2>&1; then
  pulseaudio --check 2>/dev/null || pulseaudio --start --exit-idle-time=-1 || true
fi

exec xvfb-run -a -s "-screen 0 ${W}x${H}x24 -nolisten tcp" \
  node "$DIR/index.js" "$@"
