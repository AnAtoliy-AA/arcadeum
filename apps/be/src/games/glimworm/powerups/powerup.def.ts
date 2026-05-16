import type { GlimwormSession, PowerupKind, Worm } from '../glimworm.types';

export interface PowerupDef {
  kind: PowerupKind;
  durationMs: number; // 0 = instant effect
  apply(worm: Worm, session: GlimwormSession, now: number): void;
  expire?(worm: Worm, session: GlimwormSession): void;
}

export const POWERUP_REGISTRY = new Map<PowerupKind, PowerupDef>();

export function registerPowerup(def: PowerupDef): void {
  POWERUP_REGISTRY.set(def.kind, def);
}

export function getPowerup(kind: PowerupKind): PowerupDef {
  const def = POWERUP_REGISTRY.get(kind);
  if (!def) throw new Error(`Unknown power-up: ${kind}`);
  return def;
}
