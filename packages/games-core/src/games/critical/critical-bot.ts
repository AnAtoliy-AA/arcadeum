import type { AiDifficulty } from '../../lib/ai-difficulty';
import type {
  CriticalCard,
} from './critical.constants';
import type { CriticalPlayerState, CriticalState } from './critical.state';

export const DIFFICULTY_CONFIG: Record<
  AiDifficulty,
  { playChance: number; nopeChance: number }
> = {
  easy: { playChance: 0.25, nopeChance: 0.3 },
  medium: { playChance: 0.6, nopeChance: 0.8 },
  hard: { playChance: 0.75, nopeChance: 0.9 },
  expert: { playChance: 0.85, nopeChance: 0.95 },
};

const PLAYABLE_CARD_IDS: readonly string[] = [
  'strike',
  'targeted_strike',
  'private_strike',
  'recursive_strike', // Attacks
  'evade',
  'mega_evade', // Skips
  'invert', // Reverse
  'reorder', // Shuffle
  'insight',
  'see_future_5x',
  'reveal_future_3x', // See Future
  'alter_future_3x',
  'alter_future_5x',
  'share_future_3x', // Alter Future
  'draw_bottom',
  'swap_top_bottom',
  'bury', // Other Future
  'trade', // Favor
  'mark',
  'steal_draw', // Theft
];

/** Hostile actions a bot wants to Nope. */
const HOSTILE_ACTIONS: readonly string[] = [
  'strike',
  'targeted_strike',
  'private_strike',
  'recursive_strike',
  'mark',
  'steal_draw',
];

/**
 * Framework-agnostic Critical bot decision helpers.
 */
export class CriticalBot {
  filterPlayableCards(hand: CriticalCard[]): CriticalCard[] {
    return hand.filter((c) => PLAYABLE_CARD_IDS.includes(c as string));
  }

  isHostileAction(actionType: string): boolean {
    return HOSTILE_ACTIONS.includes(actionType);
  }

  getRandomOpponent(state: CriticalState, botId: string): string {
    const opponents = state.players.filter(
      (p: CriticalPlayerState) => p.playerId !== botId && p.alive,
    );
    if (opponents.length === 0) return '';
    const randomOpponent =
      opponents[Math.floor(Math.random() * opponents.length)];
    return randomOpponent ? randomOpponent.playerId : '';
  }

  /**
   * Harder bots target the alive opponent holding the most cards (the
   * biggest threat / richest Nope holder); weaker bots pick randomly.
   */
  pickTarget(
    state: CriticalState,
    botId: string,
    cfg: { playChance: number; nopeChance: number },
  ): string {
    const opponents = state.players.filter(
      (p: CriticalPlayerState) => p.playerId !== botId && p.alive,
    );
    if (opponents.length === 0) return '';
    if (cfg.nopeChance < 0.9) {
      return this.getRandomOpponent(state, botId);
    }
    let best = opponents[0];
    for (const opp of opponents) {
      if ((opp.hand?.length ?? 0) > (best.hand?.length ?? 0)) best = opp;
    }
    return best ? best.playerId : '';
  }

  /** Random defuse insertion position between top (0) and bottom (deckSize). */
  pickDefusePosition(deckSize: number): number {
    return Math.floor(Math.random() * (deckSize + 1));
  }

  /**
   * Reorder the peeked top cards. Expert always buries bombs; hard buries
   * half the time; weaker bots shuffle randomly.
   */
  decideAlterFutureOrder(
    topCards: CriticalCard[],
    difficulty: AiDifficulty,
  ): CriticalCard[] {
    let newOrder = [...topCards];
    if (difficulty === 'expert') {
      // Bury any bombs to the back so the next player won't draw them.
      const bombs = newOrder.filter((c) => c === 'critical_event');
      const rest = newOrder.filter((c) => c !== 'critical_event');
      newOrder = [...rest, ...bombs];
    } else if (difficulty === 'hard' && Math.random() < 0.5) {
      // Hard bots bury bombs half the time, otherwise shuffle randomly.
      const bombs = newOrder.filter((c) => c === 'critical_event');
      const rest = newOrder.filter((c) => c !== 'critical_event');
      newOrder = [...rest, ...bombs];
    } else {
      // Weak bots shuffle randomly.
      newOrder = [...topCards].sort(() => Math.random() - 0.5);
    }
    return newOrder;
  }
}
