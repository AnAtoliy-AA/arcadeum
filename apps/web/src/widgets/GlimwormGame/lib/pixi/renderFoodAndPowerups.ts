import { Container, Graphics } from 'pixi.js';
import type { Food, Powerup, PowerupKind } from '../../types';

const POWERUP_COLOR: Record<PowerupKind, number> = {
  speed: 0xffe65e,
  shield: 0x5ee0ff,
  shrink: 0xff5ed4,
  ghost: 0xb15eff,
};

export class FoodRenderState {
  private readonly visuals = new Map<string, Graphics>();
  constructor(private readonly layer: Container) {}

  release(): void {
    for (const g of this.visuals.values()) g.destroy();
    this.visuals.clear();
  }

  update(food: Food[]): void {
    const seen = new Set<string>();
    for (const f of food) {
      seen.add(f.id);
      const g = this.ensureFood(f);
      g.position.set(f.pos.x, f.pos.y);
    }
    for (const [id, g] of this.visuals) {
      if (!seen.has(id)) {
        g.destroy();
        this.visuals.delete(id);
      }
    }
  }

  private ensureFood(f: Food): Graphics {
    const existing = this.visuals.get(f.id);
    if (existing) return existing;
    const g = new Graphics();
    const radius = f.value === 3 ? 8 : 4;
    const color = f.value === 3 ? 0xffe65e : 0x5effb6;
    // Layered soft halo (cheap, no per-sprite GlowFilter — looks like a glow
    // without the cross-ray artifacts GlowFilter produces on tiny shapes).
    g.circle(0, 0, radius * 3).fill({ color, alpha: 0.12 });
    g.circle(0, 0, radius * 1.8).fill({ color, alpha: 0.25 });
    g.circle(0, 0, radius).fill({ color, alpha: 1 });
    this.layer.addChild(g);
    this.visuals.set(f.id, g);
    return g;
  }
}

export class PowerupRenderState {
  private readonly visuals = new Map<string, Graphics>();
  constructor(private readonly layer: Container) {}

  release(): void {
    for (const g of this.visuals.values()) g.destroy();
    this.visuals.clear();
  }

  update(powerups: Powerup[]): void {
    const seen = new Set<string>();
    for (const p of powerups) {
      seen.add(p.id);
      const g = this.ensurePowerup(p);
      g.position.set(p.pos.x, p.pos.y);
    }
    for (const [id, g] of this.visuals) {
      if (!seen.has(id)) {
        g.destroy();
        this.visuals.delete(id);
      }
    }
  }

  private ensurePowerup(p: Powerup): Graphics {
    const existing = this.visuals.get(p.id);
    if (existing) return existing;
    const g = new Graphics();
    const color = POWERUP_COLOR[p.kind];
    // Soft halo via layered translucent circles + filled core (cheaper and
    // smoother than a per-sprite GlowFilter).
    g.circle(0, 0, 26).fill({ color, alpha: 0.1 });
    g.circle(0, 0, 18).fill({ color, alpha: 0.2 });
    g.circle(0, 0, 14).fill({ color: 0x000000, alpha: 0.35 });
    g.circle(0, 0, 11).fill({ color, alpha: 0.95 });
    this.layer.addChild(g);
    this.visuals.set(p.id, g);
    return g;
  }
}
