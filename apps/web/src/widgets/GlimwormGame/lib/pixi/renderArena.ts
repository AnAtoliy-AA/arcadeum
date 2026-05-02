import { Container, Graphics } from 'pixi.js';
import type { Arena } from '../../types';

export interface ArenaRenderState {
  grid: Graphics;
  safeZone: Graphics;
}

/**
 * One-time setup: attach static grid + a Graphics for the safe-zone ring.
 * Returns state to be passed to {@link updateArena} every frame.
 */
export function createArenaRenderer(
  layer: Container,
  arena: Arena,
): ArenaRenderState {
  const grid = new Graphics();
  const safeZone = new Graphics();
  layer.addChild(grid, safeZone);
  drawStaticGrid(grid, arena);
  return { grid, safeZone };
}

/**
 * Per-frame update — only the safe-zone changes (shrinks over time in BR).
 */
export function updateArena(state: ArenaRenderState, arena: Arena): void {
  drawSafeZone(state.safeZone, arena);
}

function drawStaticGrid(g: Graphics, arena: Arena): void {
  g.clear();
  g.rect(0, 0, arena.width, arena.height).fill({ color: 0x0d1228, alpha: 1 });
  const step = 100;
  for (let x = step; x < arena.width; x += step) {
    g.moveTo(x, 0)
      .lineTo(x, arena.height)
      .stroke({ color: 0x2a3148, width: 1, alpha: 0.4 });
  }
  for (let y = step; y < arena.height; y += step) {
    g.moveTo(0, y)
      .lineTo(arena.width, y)
      .stroke({ color: 0x2a3148, width: 1, alpha: 0.4 });
  }
  g.rect(0, 0, arena.width, arena.height).stroke({
    color: 0x4a5478,
    width: 3,
    alpha: 0.6,
  });
}

function drawSafeZone(g: Graphics, arena: Arena): void {
  g.clear();
  if (!arena.safeZone) return;
  const { center, radius } = arena.safeZone;
  g.circle(center.x, center.y, radius).fill({
    color: 0x66ccff,
    alpha: 0.05,
  });
  g.circle(center.x, center.y, radius).stroke({
    color: 0x66ccff,
    width: 4,
    alpha: 0.6,
  });
}
