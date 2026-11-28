'use strict';

const { VIDEO, SAFE_ZONE } = require('./config');

/**
 * Safe-zone math for 9:16 frames. All rects are {x, y, width, height} in
 * output pixels; all zones are {left, right, top, bottom} in output pixels.
 */
function getSafeZone(video = VIDEO, safe = SAFE_ZONE) {
  return {
    left: Math.round(video.width * safe.sidePct),
    right: Math.round(video.width * (1 - safe.sidePct)),
    top: Math.round(video.height * safe.topPct),
    bottom: Math.round(video.height * (1 - safe.bottomPct)),
  };
}

function rectWithinZone(rect, zone) {
  return (
    rect.x >= zone.left &&
    rect.y >= zone.top &&
    rect.x + rect.width <= zone.right &&
    rect.y + rect.height <= zone.bottom
  );
}

/** How many pixels the rect sticks out of the zone on each side (0 = inside). */
function overflowPx(rect, zone) {
  return {
    left: Math.max(0, zone.left - rect.x),
    top: Math.max(0, zone.top - rect.y),
    right: Math.max(0, rect.x + rect.width - zone.right),
    bottom: Math.max(0, rect.y + rect.height - zone.bottom),
  };
}

/** Clamp a rect so it sits inside the zone (shifts only; never resizes). */
function clampRectToZone(rect, zone) {
  const maxX = Math.max(zone.left, zone.right - rect.width);
  const maxY = Math.max(zone.top, zone.bottom - rect.height);
  return {
    ...rect,
    x: Math.min(Math.max(rect.x, zone.left), maxX),
    y: Math.min(Math.max(rect.y, zone.top), maxY),
  };
}

/** Rough text width in px for fitting before the real browser measurement. */
function estimateTextWidth(text, fontSize, avgCharEm = 0.58) {
  return Math.ceil(String(text).length * fontSize * avgCharEm);
}

/** Largest font size (descending by step) whose estimated width fits maxWidth. */
function fitFontSize(text, maxWidth, { max = 92, min = 48, step = 2 } = {}) {
  for (let size = max; size >= min; size -= step) {
    if (estimateTextWidth(text, size) <= maxWidth) return size;
  }
  return min;
}

module.exports = {
  getSafeZone,
  rectWithinZone,
  overflowPx,
  clampRectToZone,
  estimateTextWidth,
  fitFontSize,
};
