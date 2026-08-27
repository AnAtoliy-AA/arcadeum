import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { randomInt } from 'crypto';
import { HeartsService } from './hearts.service';
import type { HeartsService as IHeartsService } from './hearts.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import { GAME_PHASE } from '../engines/hearts/hearts.constants';
import type {
  HeartsState,
  PassCardsPayload,
} from '../engines/hearts/hearts.types';
import { HeartsBot } from '@arcadeum/games-core/games/hearts/hearts-bot';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';

const MOVE_DELAY_MS = { min: 400, max: 1100 };

@Injectable()
export class HeartsBotService extends HeartsBot {
  private readonly logger = new Logger(HeartsBotService.name);
  private readonly processing = new Set<string>();

  constructor(
    @Inject(forwardRef(() => HeartsService))
    private readonly heartsService: IHeartsService,
    private readonly sessionsService: GameSessionsService,
  ) {
    super();
  }

  isBot(userId: string): boolean {
    return userId.startsWith('bot-');
  }

  async checkAndPlay(session: GameSessionSummary): Promise<void> {
    if (session.status !== 'active') return;
    const state = session.state as unknown as HeartsState | undefined;
    if (!state || state.phase === GAME_PHASE.GAME_OVER) return;

    const hasHuman = state.players.some((p) => !this.isBot(p.playerId));
    if (!hasHuman && !isAiVsAiSession(session)) {
      await this.heartsService.completeSession(session.id, session.roomId);
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
      const freshState = fresh?.state as unknown as HeartsState | undefined;
      if (
        !freshState ||
        fresh?.status !== 'active' ||
        this.currentActorId(freshState) !== botId
      ) {
        return;
      }

      if (
        freshState.phase === GAME_PHASE.PASSING &&
        freshState.options.passingEnabled
      ) {
        if (freshState.pendingPasses[botId]?.length) return;
        const cards = this.pickPassCards(freshState, botId);
        await this.heartsService.passCards(botId, session.roomId, {
          cards,
        } satisfies PassCardsPayload);
        return;
      }
      if (freshState.phase !== GAME_PHASE.PLAYING) {
        return;
      }
      const card = this.pickCardToPlay(freshState, botId);
      if (!card) return;
      await this.heartsService.playCard(botId, session.roomId, { card });
    } catch (error) {
      this.logger.error(`Hearts bot ${botId} failed to act: ${error}`);
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
