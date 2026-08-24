import {
  ACTIVE_COLORS,
  PENDING,
  type ActiveColor,
} from './cascade.constants';
import type { CascadePlayer, CascadeState } from './cascade.types';
import { isPlayable } from './cascade.utils';
import type { AiDifficulty } from '../../lib/ai-difficulty';

/**
 * Higher difficulties make fewer random mistakes. Easy bots pick a random
 * playable card half the time; expert bots always follow the priority order.
 */
export const DIFFICULTY_CONFIG: Record<AiDifficulty, { mistakeRate: number }> = {
  easy: { mistakeRate: 0.5 },
  medium: { mistakeRate: 0.1 },
  hard: { mistakeRate: 0.03 },
  expert: { mistakeRate: 0 },
};

export type CascadeBotMove =
  | { type: 'play'; cardId: string; chosenColor?: ActiveColor }
  | { type: 'draw' };

/**
 * Framework-agnostic Cascade bot decision logic.
 *
 * Difficulty tiers trade optimality for randomness via `DIFFICULTY_CONFIG`;
 * the strong path follows a fixed priority order:
 * 1. If under a stack, must play a stack card (filtered by `isPlayable`).
 * 2. Prefer color-matching number/action card over wilds.
 * 3. Among colors, prefer the color the bot holds the most of.
 * 4. Save Wild +4 if a regular Wild also works.
 */
export class CascadeBot {
  pickMove(state: CascadeState, botId: string): CascadeBotMove | null {
    const player = state.players.find((p) => p.playerId === botId);
    if (!player) return null;

    if (state.pendingAction !== PENDING.NONE) {
      // Shouldn't happen — bot resolves color immediately during play_card.
      return null;
    }

    const playable = player.hand.filter((c) =>
      isPlayable(
        c,
        state.topCard,
        state.activeColor,
        state.pendingDraw,
        state.pendingStackKind,
      ),
    );

    if (playable.length === 0) {
      return { type: 'draw' };
    }

    const difficulty = state.options.aiDifficulty ?? 'medium';
    const config = DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG.medium;

    // Random-mistake path: weaker bots sometimes play a random card (and
    // easy bots may draw even with a legal play, wasting their turn).
    if (Math.random() < config.mistakeRate) {
      if (difficulty === 'easy' && Math.random() < 0.4) {
        return { type: 'draw' };
      }
      const randomCard = playable[Math.floor(Math.random() * playable.length)];
      const isWild =
        randomCard.kind === 'WILD' || randomCard.kind === 'WILD_DRAW_FOUR';
      return {
        type: 'play',
        cardId: randomCard.id,
        chosenColor: isWild ? this.randomActiveColor() : undefined,
      };
    }

    const colorMatches = playable.filter(
      (c) => c.color === state.activeColor && c.kind !== 'WILD_DRAW_FOUR',
    );
    if (colorMatches.length > 0) {
      const dominantColor = this.dominantColor(player);
      const preferred =
        colorMatches.find((c) => c.color === dominantColor) ?? colorMatches[0];
      return { type: 'play', cardId: preferred.id };
    }

    // Try a value match (any color, same number as top).
    const valueMatch = playable.find(
      (c) =>
        c.kind === 'NUMBER' &&
        state.topCard.kind === 'NUMBER' &&
        c.value === state.topCard.value,
    );
    if (valueMatch) {
      return { type: 'play', cardId: valueMatch.id };
    }

    // Try a regular Wild before Wild +4.
    const wild = playable.find((c) => c.kind === 'WILD');
    if (wild) {
      return {
        type: 'play',
        cardId: wild.id,
        chosenColor: this.dominantColor(player) ?? 'R',
      };
    }
    const wd4 = playable.find((c) => c.kind === 'WILD_DRAW_FOUR');
    if (wd4) {
      return {
        type: 'play',
        cardId: wd4.id,
        chosenColor: this.dominantColor(player) ?? 'R',
      };
    }

    // Fallback: play first.
    const first = playable[0];
    return {
      type: 'play',
      cardId: first.id,
      chosenColor:
        first.kind === 'WILD' || first.kind === 'WILD_DRAW_FOUR'
          ? (this.dominantColor(player) ?? 'R')
          : undefined,
    };
  }

  protected dominantColor(player: CascadePlayer): ActiveColor | null {
    const counts: Record<ActiveColor, number> = { R: 0, Y: 0, G: 0, B: 0 };
    for (const c of player.hand) {
      if (c.color !== 'W') counts[c.color]++;
    }
    let best: ActiveColor | null = null;
    let bestN = -1;
    for (const color of ACTIVE_COLORS) {
      if (counts[color] > bestN) {
        bestN = counts[color];
        best = color;
      }
    }
    return best;
  }

  protected randomActiveColor(): ActiveColor {
    return ACTIVE_COLORS[Math.floor(Math.random() * ACTIVE_COLORS.length)];
  }
}
