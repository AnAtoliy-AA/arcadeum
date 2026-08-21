import { Container, Graphics, Text, type TextStyle } from 'pixi.js';
import type { PowerupKind } from '../../types';

interface FxItem {
  display: Container;
  startTime: number;
  durationMs: number;
  update: (progress: number) => void;
}

const POWERUP_COLOR: Record<PowerupKind, number> = {
  speed: 0xffe65e,
  shield: 0x5ee0ff,
  shrink: 0xff5ed4,
  ghost: 0xb15eff,
};

/**
 * Time-driven FX layer. Spawns ephemeral Graphics/Text effects, advances them
 * each frame, and reaps them when their lifetime is up.
 */
export class FxRenderState {
  private items: FxItem[] = [];
  constructor(private readonly layer: Container) {}

  release(): void {
    for (const item of this.items) item.display.destroy();
    this.items = [];
  }

  spawnDeathBurst(x: number, y: number, color: number, now: number): void {
    const g = new Graphics();
    g.circle(0, 0, 4).fill({ color, alpha: 1 });
    g.position.set(x, y);
    this.layer.addChild(g);
    this.items.push({
      display: g,
      startTime: now,
      durationMs: 600,
      update: (p) => {
        g.scale.set(1 + p * 8);
        g.alpha = 1 - p;
      },
    });
  }

  spawnScorePopup(x: number, y: number, label: string, now: number): void {
    const style: Partial<TextStyle> = {
      fontFamily: 'system-ui, sans-serif',
      fontSize: 24,
      fill: 0xffe65e,
      fontWeight: 'bold',
    };
    const text = new Text({ text: label, style });
    text.anchor.set(0.5);
    text.position.set(x, y);
    this.layer.addChild(text);
    this.items.push({
      display: text,
      startTime: now,
      durationMs: 800,
      update: (p) => {
        text.position.y = y - p * 30;
        text.alpha = 1 - p;
      },
    });
  }

  spawnPowerupSparkle(
    x: number,
    y: number,
    kind: PowerupKind,
    now: number,
  ): void {
    const color = POWERUP_COLOR[kind];
    const g = new Graphics();
    g.circle(0, 0, 14).stroke({ color, width: 3, alpha: 1 });
    g.position.set(x, y);
    this.layer.addChild(g);
    this.items.push({
      display: g,
      startTime: now,
      durationMs: 500,
      update: (p) => {
        g.scale.set(1 + p * 1.5);
        g.alpha = 1 - p;
      },
    });
  }

  /** Advance all live effects; remove any that have completed. */
  update(now: number): void {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      const progress = (now - item.startTime) / item.durationMs;
      if (progress >= 1) {
        item.display.destroy();
        this.items.splice(i, 1);
      } else {
        item.update(progress);
      }
    }
  }
}
