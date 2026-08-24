import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { CascadeService } from './cascade.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import { GAME_PHASE } from '@arcadeum/games-core/games/cascade/cascade.constants';
import type { CascadeState } from '@arcadeum/games-core/games/cascade/cascade.types';
import { CascadeBot } from '@arcadeum/games-core/games/cascade/cascade-bot';
import { isPlayable } from '../engines/cascade/cascade.utils';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';

const MOVE_DELAY_MS = { min: 400, max: 1100 };

/**
 * Reflex windows for the Last-Card race. The at-risk player (if a bot)
 * reacts much faster than other bots, so it usually saves itself first;
 * other bots have a slower fuse so a human still has a real chance to
 * call them out manually.
 */
const SELF_REFLEX_MS = { min: 200, max: 700 };
const OTHER_REFLEX_MS = { min: 800, max: 2500 };

/** Error substrings that indicate a lost cascade-call race — expected. */
const CASCADE_RACE_ERRORS = [
  'No Cascade window',
  'Someone already called Cascade',
];

@Injectable()
export class CascadeBotService extends CascadeBot {
  private readonly logger = new Logger(CascadeBotService.name);
  private readonly processing = new Set<string>();

  constructor(
    @Inject(forwardRef(() => CascadeService))
    private readonly cascadeService: CascadeService,
  ) {
    super();
  }

  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status !== 'active') return;
    const state = session.state as unknown as CascadeState | undefined;
    if (!state || state.phase !== GAME_PHASE.PLAYING) return;

    const hasAliveHuman = state.players.some(
      (p) => p.alive && !this.isBot(p.playerId),
    );
    if (!hasAliveHuman && !isAiVsAiSession(session)) {
      this.logger.log(
        `No alive humans in room ${session.roomId} — completing session`,
      );
      await this.cascadeService.completeSession(session.id, session.roomId);
      return;
    }

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
      const aiDelay = getAiMoveDelayMs(session);
      if (aiDelay !== null) {
        await this.randomDelay({ min: aiDelay, max: aiDelay });
      } else {
        await this.randomDelay(MOVE_DELAY_MS);
      }
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
            const isExpectedLoss = CASCADE_RACE_ERRORS.some((e) =>
              message.includes(e),
            );
            if (!isExpectedLoss) {
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

  private async randomDelay(range: { min: number; max: number }) {
    const ms = range.min + Math.random() * (range.max - range.min);
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** @internal */
  _exportedForTests(): { isPlayable: typeof isPlayable } {
    return { isPlayable };
  }
}
