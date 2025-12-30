import { Injectable } from '@nestjs/common';
import { GameSessionsService } from '../../sessions/game-sessions.service';
import { GamesRealtimeService } from '../../games.realtime.service';

/**
 * Exploding Cats Actions Service
 * Handles game-specific actions for Exploding Cats
 */
@Injectable()
export class ExplodingCatsActionsService {
  constructor(
    private readonly sessionsService: GameSessionsService,
    private readonly realtimeService: GamesRealtimeService,
  ) {}

  /**
   * Draw a card in Exploding Cats
   */
  async drawCard(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'draw_card',
      userId,
    });

    this.realtimeService.emitActionExecuted(session, 'draw_card', userId);

    return session;
  }

  /**
   * Play an action card
   */
  async playActionCard(
    sessionId: string,
    userId: string,
    payload: { card: string },
  ) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'play_card',
      userId,
      payload,
    });

    this.realtimeService.emitActionExecuted(session, 'play_card', userId);

    return session;
  }

  /**
   * Play a cat combo (2 or more matching cat cards)
   */
  async playCatCombo(
    sessionId: string,
    userId: string,
    payload: {
      cards: string[];
      targetPlayerId: string;
      requestedCard?: string;
    },
  ) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'play_cat_combo',
      userId,
      payload,
    });

    this.realtimeService.emitActionExecuted(session, 'play_cat_combo', userId);

    return session;
  }

  /**
   * Play a favor card - sets pending favor, target must respond
   */
  async playFavor(
    sessionId: string,
    userId: string,
    payload: {
      targetPlayerId: string;
    },
  ) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'favor',
      userId,
      payload,
    });

    this.realtimeService.emitActionExecuted(session, 'favor', userId);

    return session;
  }

  /**
   * Give favor card - target player responds to favor by choosing a card
   */
  async giveFavorCard(
    sessionId: string,
    userId: string,
    payload: {
      cardToGive: string;
    },
  ) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'give_favor_card',
      userId,
      payload,
    });

    this.realtimeService.emitActionExecuted(session, 'give_favor_card', userId);

    return session;
  }

  /**
   * Play "See the Future" card
   */
  async seeFuture(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'see_the_future',
      userId,
    });

    this.realtimeService.emitActionExecuted(session, 'see_the_future', userId);

    return session;
  }

  /**
   * Defuse an exploding cat
   */
  async defuse(
    sessionId: string,
    userId: string,
    payload: { position: number },
  ) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'defuse',
      userId,
      payload,
    });

    this.realtimeService.emitActionExecuted(session, 'defuse', userId);

    return session;
  }

  /**
   * Play a nope card - cancels the last action played
   */
  async playNope(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'play_nope',
      userId,
    });

    this.realtimeService.emitActionExecuted(session, 'play_nope', userId);

    return session;
  }

  /**
   * Play an attack card
   */
  async playAttack(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'play_card',
      userId,
      payload: { card: 'attack' },
    });

    this.realtimeService.emitActionExecuted(session, 'attack', userId);

    return session;
  }

  /**
   * Play a skip card
   */
  async playSkip(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'play_card',
      userId,
      payload: { card: 'skip' },
    });

    this.realtimeService.emitActionExecuted(session, 'skip', userId);

    return session;
  }

  /**
   * Play a shuffle card
   */
  async playShuffle(sessionId: string, userId: string) {
    const session = await this.sessionsService.executeAction({
      sessionId,
      action: 'play_card',
      userId,
      payload: { card: 'shuffle' },
    });

    this.realtimeService.emitActionExecuted(session, 'shuffle', userId);

    return session;
  }
}
