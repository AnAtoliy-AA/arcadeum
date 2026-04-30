import type { GlimwormSession, Worm, WormId } from '../glimworm.types';

export interface VariantStrategy {
  initSession(s: GlimwormSession): void;
  onWormDeath(s: GlimwormSession, victim: Worm, killer: Worm | null): void;
  checkEndCondition(s: GlimwormSession): WormId | null;
  tickHook?(s: GlimwormSession, now: number): void;
}

export type VariantFactory = () => VariantStrategy;
