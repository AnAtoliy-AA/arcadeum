import type {
  GlimwormSession,
  GlimwormMode,
  Worm,
  WormId,
} from '../glimworm.types';
import { BattleRoyaleStrategy } from './battle-royale.strategy';
import { TimeAttackStrategy } from './time-attack.strategy';
import { LivesHeatsStrategy } from './lives-heats.strategy';

export interface ModeStrategy {
  initSession(s: GlimwormSession): void;
  onWormDeath(s: GlimwormSession, victim: Worm, killer: Worm | null): void;
  checkEndCondition(s: GlimwormSession): WormId | null;
  tickHook?(s: GlimwormSession, now: number): void;
}

export type ModeFactory = () => ModeStrategy;

export function createModeStrategy(mode: GlimwormMode): ModeStrategy {
  switch (mode) {
    case 'battle_royale':
      return new BattleRoyaleStrategy();
    case 'time_attack':
      return new TimeAttackStrategy();
    case 'lives_heats':
      return new LivesHeatsStrategy();
    default: {
      const exhaustive: never = mode;
      throw new Error(`Unknown mode: ${String(exhaustive)}`);
    }
  }
}
