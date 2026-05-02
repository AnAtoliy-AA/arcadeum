import { Container, Graphics } from 'pixi.js';
import { GlowFilter } from 'pixi-filters';
import type { GlimwormWormSnapshot, Vec2, WormId } from '../../types';

interface WormVisual {
  body: Graphics;
  head: Graphics;
  shieldRing: Graphics;
}

export class WormRenderState {
  private readonly visuals = new Map<WormId, WormVisual>();
  constructor(private readonly layer: Container) {}

  release(): void {
    for (const v of this.visuals.values()) {
      v.body.destroy();
      v.head.destroy();
      v.shieldRing.destroy();
    }
    this.visuals.clear();
  }

  /**
   * Update all worm visuals from the latest interpolated snapshot. Builds
   * on first sight, removes when a worm disappears from the snapshot.
   */
  update(
    worms: GlimwormWormSnapshot[],
    interpolatedSegmentsById: Map<WormId, Vec2[]>,
  ): void {
    const seen = new Set<WormId>();
    for (const w of worms) {
      seen.add(w.id);
      const visual = this.ensureVisual(w);
      const segments = interpolatedSegmentsById.get(w.id) ?? w.segments;
      drawBody(visual.body, segments, w);
      drawHead(visual.head, segments[0], w);
      drawShield(visual.shieldRing, segments[0], w);
    }
    // Remove any visuals for worms no longer in the snapshot
    for (const [id, visual] of this.visuals) {
      if (!seen.has(id)) {
        visual.body.destroy();
        visual.head.destroy();
        visual.shieldRing.destroy();
        this.visuals.delete(id);
      }
    }
  }

  private ensureVisual(w: GlimwormWormSnapshot): WormVisual {
    const existing = this.visuals.get(w.id);
    if (existing) return existing;
    const body = new Graphics();
    const head = new Graphics();
    const shieldRing = new Graphics();
    const tint = parseHexColor(w.color);
    body.filters = [
      new GlowFilter({ distance: 12, outerStrength: 1.6, color: tint }),
    ];
    this.layer.addChild(body, head, shieldRing);
    const visual: WormVisual = { body, head, shieldRing };
    this.visuals.set(w.id, visual);
    return visual;
  }
}

function drawBody(
  g: Graphics,
  segments: Vec2[],
  w: GlimwormWormSnapshot,
): void {
  g.clear();
  if (segments.length < 2) return;
  const tint = parseHexColor(w.color);
  const alpha = w.activePowerup?.kind === 'ghost' ? 0.5 : 1;
  g.alpha = alpha;
  g.moveTo(segments[0].x, segments[0].y);
  for (let i = 1; i < segments.length; i++) {
    g.lineTo(segments[i].x, segments[i].y);
  }
  g.stroke({ color: tint, width: 12, alpha: 1, cap: 'round', join: 'round' });
}

function drawHead(
  g: Graphics,
  pos: Vec2 | undefined,
  w: GlimwormWormSnapshot,
): void {
  g.clear();
  if (!pos) return;
  if (!w.alive) {
    g.alpha = 0.3;
  } else {
    g.alpha = 1;
  }
  const tint = parseHexColor(w.color);
  g.circle(pos.x, pos.y, 10).fill({ color: 0xffffff, alpha: 0.9 });
  g.circle(pos.x, pos.y, 7).fill({ color: tint, alpha: 1 });
}

function drawShield(
  g: Graphics,
  pos: Vec2 | undefined,
  w: GlimwormWormSnapshot,
): void {
  g.clear();
  if (!pos || w.activePowerup?.kind !== 'shield') return;
  g.circle(pos.x, pos.y, 18).stroke({
    color: 0xa0e8ff,
    width: 3,
    alpha: 0.85,
  });
}

function parseHexColor(hex: string): number {
  return parseInt(hex.replace('#', ''), 16) || 0xffffff;
}
