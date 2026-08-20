import type { CatId } from '../types';

export const CAT_COLORS: Record<CatId, string> = {
  neon: '#a855f7',
  whiskers: '#f59e0b',
  stardust: '#3b82f6',
  felix: '#22c55e',
  shadow: '#6b7280',
  luna: '#ec4899',
};

// Generate serpentine track layout coordinates
export function getSerpentineTrackPoint(
  index: number,
  total: number,
  width: number,
  height: number,
  cols: number = 10,
): { x: number; y: number } {
  const rows = Math.ceil(total / cols);
  const row = Math.floor(index / cols);
  const isLeftToRight = row % 2 === 0;
  const col = isLeftToRight ? index % cols : cols - 1 - (index % cols);

  const paddingX = 32;
  const paddingY = 32;

  const innerWidth = width - 2 * paddingX;
  const innerHeight = height - 2 * paddingY;

  const stepX = innerWidth / (cols - 1);
  const stepY = innerHeight / (rows - 1 || 1);

  return {
    x: paddingX + col * stepX,
    y: paddingY + row * stepY,
  };
}

// Generate circular/elliptical track layout coordinates
export function getCircularTrackPoint(
  index: number,
  total: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): { x: number; y: number } {
  const t = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: cx + rx * Math.cos(t),
    y: cy + ry * Math.sin(t),
  };
}

// Generate figure-8 / infinity track layout coordinates
export function getFigure8TrackPoint(
  index: number,
  total: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): { x: number; y: number } {
  const t = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: cx + rx * Math.cos(t),
    y: cy + ry * Math.sin(2 * t) * 0.5,
  };
}
