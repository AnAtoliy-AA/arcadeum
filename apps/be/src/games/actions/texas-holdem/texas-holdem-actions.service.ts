import { Injectable } from '@nestjs/common';
import { GameSessionsService } from '../../sessions/game-sessions.service';
import { GamesRealtimeService } from '../../games.realtime.service';

/**
 * Texas Hold'em Actions Service
 * Handles game-specific actions for Texas Hold'em
 */
@Injectable()
export class TexasHoldemActionsService {
  constructor(
    private readonly sessionsService: GameSessionsService,
    private readonly realtimeService: GamesRealtimeService,
  ) {}

  /**
   * Fold hand
   */
  async fold(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'fold',
      userId,
    });

    await this.realtimeService.emitActionExecuted(session, 'fold', userId);

    return session;
  }

  /**
   * Check (no bet)
   */
  async check(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'check',
      userId,
    });

    await this.realtimeService.emitActionExecuted(session, 'check', userId);

    return session;
  }

  /**
   * Call current bet
   */
  async call(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'call',
      userId,
    });

    await this.realtimeService.emitActionExecuted(session, 'call', userId);

    return session;
  }

  /**
   * Raise bet
   */
  async raise(sessionId: string, userId: string, payload: { amount: number }) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'raise',
      userId,
      payload,
    });

    await this.realtimeService.emitActionExecuted(session, 'raise', userId);

    return session;
  }

  /**
   * Go all-in
   */
  async allIn(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'all_in',
      userId,
    });

    await this.realtimeService.emitActionExecuted(session, 'all_in', userId);

    return session;
  }

  /**
   * Bet (first bet in a round)
   */
  async bet(sessionId: string, userId: string, payload: { amount: number }) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'bet',
      userId,
      payload,
    });

    await this.realtimeService.emitActionExecuted(session, 'bet', userId);

    return session;
  }
}
