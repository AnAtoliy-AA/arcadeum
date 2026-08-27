import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { randomInt } from 'crypto';
import { SpadesService } from './spades.service';
import type { SpadesService as ISpadesService } from './spades.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import { GAME_PHASE } from '@arcadeum/games-core/games/spades/spades.constants';
import type { SpadesState } from '@arcadeum/games-core/games/spades/spades.types';
import { SpadesBot } from '@arcadeum/games-core/games/spades/spades-bot';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';

const MOVE_DELAY_MS = { min: 400, max: 1100 };

@Injectable()
export class SpadesBotService extends SpadesBot {
  private readonly logger = new Logger(SpadesBotService.name);
  private readonly processing = new Set<string>();

  constructor(
    @Inject(forwardRef(() => SpadesService))
    private readonly spadesService: ISpadesService,
    private readonly sessionsService: GameSessionsService,
  ) {
    super();
  }

  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status !== 'active') return;
    const state = session.state as unknown as SpadesState | undefined;
    if (!state || state.phase === GAME_PHASE.GAME_OVER) return;

    const hasHuman = state.players.some((p) => !this.isBot(p.playerId));
    if (!hasHuman && !isAiVsAiSession(session)) {
      await this.spadesService.completeSession(session.id, session.roomId);
      return;
    }

    const botId = this.currentActorId(state);
    if (!botId || !this.isBot(botId)) return;

    const lockKey = `${session.roomId}:${botId}`;
    if (this.processing.has(lockKey)) return;
    this.processing.add(lockKey);

    try {
      const aiDelay = getAiMoveDelayMs(session);
      // AI-vs-AI pacing is a fixed configured gap; otherwise vary the bot's
      // "thinking" time within its natural range.
      await this.randomDelay(
        aiDelay !== null ? { min: aiDelay, max: aiDelay } : MOVE_DELAY_MS,
      );

      // Re-read state after the delay: the pre-delay snapshot can be stale
      // (a seat moved while we were "thinking"). The service re-validates
      // everything anyway — this just avoids firing doomed moves.
      const fresh = await this.sessionsService.findSessionByRoom(
        session.roomId,
      );
      const freshState = fresh?.state as unknown as SpadesState | undefined;
      if (
        !freshState ||
        fresh?.status !== 'active' ||
        this.currentActorId(freshState) !== botId
      ) {
        return;
      }

      if (freshState.phase === GAME_PHASE.BIDDING) {
        if ((freshState.bids[botId] ?? null) !== null) return;
        const amount = this.pickBid(freshState, botId);
        await this.spadesService.bid(botId, session.roomId, { amount });
        return;
      }
      if (freshState.phase !== GAME_PHASE.PLAYING) {
        return;
      }
      const card = this.pickCardToPlay(freshState, botId);
      if (!card) return;
      await this.spadesService.playCard(botId, session.roomId, { card });
    } catch (error) {
      this.logger.error(`Spades bot ${botId} failed to act: ${error}`);
    } finally {
      this.processing.delete(lockKey);
    }
  }

  private async randomDelay(range: {
    min: number;
    max: number;
  }): Promise<void> {
    const ms = range.min + randomInt(range.max - range.min + 1);
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
