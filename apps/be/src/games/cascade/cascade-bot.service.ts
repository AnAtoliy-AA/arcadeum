import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { CascadeService } from './cascade.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import {
  ACTIVE_COLORS,
  GAME_PHASE,
  PENDING,
  type ActiveColor,
} from '../engines/cascade/cascade.constants';
import type {
  CascadePlayer,
  CascadeState,
} from '../engines/cascade/cascade.types';
import { isPlayable } from '../engines/cascade/cascade.utils';

const MOVE_DELAY_MS = { min: 400, max: 1100 };

/**
 * Reflex windows for the Last-Card race. The at-risk player (if a bot)
 * reacts much faster than other bots, so it usually saves itself first;
 * other bots have a slower fuse so a human still has a real chance to
 * call them out manually.
 */
const SELF_REFLEX_MS = { min: 200, max: 700 };
const OTHER_REFLEX_MS = { min: 1500, max: 3500 };

@Injectable()
export class CascadeBotService {
  private readonly logger = new Logger(CascadeBotService.name);
  private readonly processing = new Set<string>();

  constructor(
    @Inject(forwardRef(() => CascadeService))
    private readonly cascadeService: CascadeService,
  ) {}

  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status !== 'active') return;
    const state = session.state as unknown as CascadeState | undefined;
    if (!state || state.phase !== GAME_PHASE.PLAYING) return;

    // Fire-and-forget: any bot can call Cascade independent of whose turn
    // it is. Schedule the reflex now; it'll race against humans and other
    // bots. Self-saves fire on a tighter timer than other-calls.
    if (state.lastCardWindow && state.options.lastCardCallEnabled) {
      this.scheduleCascadeReflex(session, state);
    }

    const currentId = state.playerOrder[state.currentTurnIndex];
    if (!currentId || !this.isBot(currentId)) return;

    const lockKey = `${session.roomId}:${currentId}`;
    if (this.processing.has(lockKey)) return;
    this.processing.add(lockKey);

    try {
      await this.randomDelay(MOVE_DELAY_MS);
      const move = this.pickMove(state, currentId);
      if (!move) return;
      if (move.type === 'play') {
        await this.cascadeService.playCard(currentId, session.roomId, {
          cardId: move.cardId,
          chosenColor: move.chosenColor,
        });
      } else {
        await this.cascadeService.draw(currentId, session.roomId);
      }
    } catch (error) {
      this.logger.error(`Bot ${currentId} failed to play: ${error}`);
    } finally {
      this.processing.delete(lockKey);
    }
  }

  /**
   * Schedule each bot's call_cascade reflex. The at-risk bot (if any) races
   * to save itself; every other bot races to catch the at-risk player.
   * Whichever reflex fires first wins — the engine validates and the loser
   * gets a no-op error (validateCallCascade rejects post-close).
   */
  private scheduleCascadeReflex(
    session: GameSessionSummary,
    state: CascadeState,
  ): void {
    const window = state.lastCardWindow;
    if (!window) return;
    const atRiskId = window.playerId;
    const lockKeyBase = `cascade-call:${session.roomId}:${window.openedAt}`;

    for (const player of state.players) {
      if (!player.alive) continue;
      if (!this.isBot(player.playerId)) continue;
      const lockKey = `${lockKeyBase}:${player.playerId}`;
      if (this.processing.has(lockKey)) continue;
      this.processing.add(lockKey);

      const range =
        player.playerId === atRiskId ? SELF_REFLEX_MS : OTHER_REFLEX_MS;
      const delay = range.min + Math.random() * (range.max - range.min);

      setTimeout(() => {
        this.cascadeService
          .callCascade(player.playerId, session.roomId)
          .catch((err: unknown) => {
            // Losing the race is the expected case for the slower bots —
            // the engine rejects post-close calls. Anything else is
            // worth logging.
            const message = err instanceof Error ? err.message : String(err);
            if (!message.includes('No Cascade window')) {
              this.logger.debug(
                `Bot ${player.playerId} cascade call lost the race: ${message}`,
              );
            }
          })
          .finally(() => {
            this.processing.delete(lockKey);
          });
      }, delay).unref?.();
    }
  }

  pickMove(
    state: CascadeState,
    botId: string,
  ):
    | { type: 'play'; cardId: string; chosenColor?: ActiveColor }
    | { type: 'draw' }
    | null {
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

    // Priority order:
    // 1. If under a stack, must play a stack card (already filtered).
    // 2. Prefer color-matching number/action card over wilds.
    // 3. Among colors, prefer the color the bot holds the most of.
    // 4. Save Wild +4 if a regular Wild also works.
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

  private dominantColor(player: CascadePlayer): ActiveColor | null {
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

  private async randomDelay(range: { min: number; max: number }) {
    const ms = range.min + Math.random() * (range.max - range.min);
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** @internal */
  _exportedForTests(): { isPlayable: typeof isPlayable } {
    return { isPlayable };
  }
}
