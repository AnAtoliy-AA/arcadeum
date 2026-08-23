import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { randomInt } from 'crypto';
import { HeartsService } from './hearts.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import { GAME_PHASE } from '../engines/hearts/hearts.constants';
import type {
  HeartsState,
  PassCardsPayload,
} from '../engines/hearts/hearts.types';
import {
  isPenaltyCard,
  rankValue,
  sortHand,
  suitOf,
} from '../engines/hearts/hearts.utils';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';

const MOVE_DELAY_MS = { min: 400, max: 1100 };

type Difficulty = 'easy' | 'medium' | 'hard';

@Injectable()
export class HeartsBotService {
  private readonly logger = new Logger(HeartsBotService.name);
  private readonly processing = new Set<string>();

  constructor(
    @Inject(forwardRef(() => HeartsService))
    private readonly heartsService: HeartsService,
    private readonly sessionsService: GameSessionsService,
  ) {}

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

  /** The bot whose turn/pass it currently is, or null. */
  currentActorId(state: HeartsState): string | null {
    if (state.phase === GAME_PHASE.PASSING && state.options.passingEnabled) {
      const pending = state.playerOrder.find(
        (id) => !state.pendingPasses[id]?.length,
      );
      return pending ?? null;
    }
    if (state.phase === GAME_PHASE.PLAYING) {
      return state.playerOrder[state.currentTurnIndex] ?? null;
    }
    return null;
  }

  // --------------------------------------------------------------- passing

  pickPassCards(state: HeartsState, botId: string): string[] {
    const hand = sortHand(state.hands[botId] ?? []);
    if (hand.length < 3) return [...hand];
    if (this.difficultyOf(state) === 'easy') {
      return this.sample(hand, 3);
    }

    // medium/hard: shed dangerous high cards — Q♠/A♠/K♠ when spade support is
    // thin, then high hearts, then highest remaining ranks.
    const lowSpades = hand.filter(
      (c) => suitOf(c) === 'S' && rankValue(c) < 12,
    ).length;
    return [...hand]
      .map((card) => ({ card, score: this.passScore(card, lowSpades) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.card);
  }

  private passScore(card: string, lowSpadeCount: number): number {
    let score = rankValue(card);
    const suit = suitOf(card);
    if (suit === 'S') {
      if (rankValue(card) >= 12) score += 40;
      else score -= 30;
      if (lowSpadeCount <= 1 && rankValue(card) >= 12) score += 20;
    }
    if (suit === 'H' && rankValue(card) >= 11) score += 15;
    return score;
  }

  // --------------------------------------------------------------- playing

  pickCardToPlay(state: HeartsState, botId: string): string | null {
    const hand = state.hands[botId] ?? [];
    const legal = this.legalCards(state, botId, hand);
    if (legal.length === 0) return hand[0] ?? null;
    const difficulty = this.difficultyOf(state);
    if (difficulty === 'easy') return legal[randomInt(legal.length)];

    const plays = state.currentTrick.plays;
    if (plays.length === 0) {
      return difficulty === 'hard'
        ? this.pickLeadHard(state, legal)
        : this.pickLeadSimple(legal);
    }

    const leadSuit = state.currentTrick.leadSuit;
    const inSuit =
      leadSuit !== null ? legal.filter((c) => suitOf(c) === leadSuit) : [];
    const trickHasPoints = plays.some((p) => isPenaltyCard(p.card));
    const byRankAsc = (cards: string[]) =>
      [...cards].sort((a, b) => rankValue(a) - rankValue(b));

    if (inSuit.length > 0 && leadSuit !== null) {
      // Follow suit: duck under the current winner; avoid taking points.
      // The trick-winner so far is the highest card of the lead suit.
      const sorted = byRankAsc(inSuit);
      const winningCard = plays
        .filter((p) => suitOf(p.card) === leadSuit)
        .reduce(
          (best, p) => (rankValue(p.card) > rankValue(best) ? p.card : best),
          plays[0]?.card ?? sorted[0],
        );
      const winningRank = rankValue(winningCard);
      const under = sorted.filter((c) => rankValue(c) < winningRank);
      if (trickHasPoints && under.length > 0) {
        return under[under.length - 1]; // highest card that still ducks
      }
      if (trickHasPoints) return sorted[0]; // forced to win — take with lowest
      return sorted[sorted.length - 1]; // no points on table: dump high
    }

    // Void in lead suit — discard penalty cards first.
    const queen = legal.find((c) => c === 'QS');
    if (queen) return queen;
    const highHeart = legal
      .filter((c) => c.endsWith('H'))
      .sort((a, b) => rankValue(b) - rankValue(a))[0];
    if (highHeart) return highHeart;
    return [...legal].sort((a, b) => rankValue(b) - rankValue(a))[0];
  }

  /**
   * Legal cards for a player given follow-suit / first-trick / broken-hearts
   * rules (mirrors the engine validators without mutating state).
   */
  legalCards(state: HeartsState, botId: string, hand?: string[]): string[] {
    const h = hand ?? state.hands[botId] ?? [];
    const plays = state.currentTrick.plays;
    const leading = plays.length === 0;
    const completedTricks =
      (52 -
        Object.values(state.hands).reduce((s, x) => s + x.length, 0) -
        plays.length) /
      4;
    const isFirstTrick = completedTricks === 0;

    if (leading) {
      if (isFirstTrick) return h.includes('2C') ? ['2C'] : [...h];
      if (!state.heartsBroken) {
        const nonHearts = h.filter((c) => !c.endsWith('H'));
        if (nonHearts.length > 0) return nonHearts;
      }
      return [...h];
    }

    const leadSuit = state.currentTrick.leadSuit;
    const inSuit = h.filter((c) => c.endsWith(leadSuit ?? ''));
    if (leadSuit && inSuit.length > 0) return inSuit;
    if (isFirstTrick) {
      const safe = h.filter((c) => !isPenaltyCard(c));
      if (safe.length > 0) return safe;
    }
    return [...h];
  }

  private pickLeadSimple(legal: string[]): string {
    const nonPenalty = legal.filter((c) => !isPenaltyCard(c));
    const pool = nonPenalty.length > 0 ? nonPenalty : legal;
    return [...pool].sort((a, b) => rankValue(a) - rankValue(b))[0];
  }

  /** Hard: avoid leading high spades / penalty cards while suits are live. */
  private pickLeadHard(state: HeartsState, legal: string[]): string {
    const dangerousHighSpades = new Set(['AS', 'KS', 'QS']);
    const safe = legal.filter(
      (c) => !isPenaltyCard(c) && !dangerousHighSpades.has(c),
    );
    return this.pickLeadSimple(safe.length > 0 ? safe : legal);
  }

  private difficultyOf(state: HeartsState): Difficulty {
    const d = state.options.aiDifficulty;
    if (d === 'easy') return 'easy';
    // AI-vs-AI rooms request 'expert' (no per-game expert strategy exists
    // for hearts) — play the strongest available strategy instead.
    return d === 'hard' || d === 'expert' ? 'hard' : 'medium';
  }

  private sample(arr: string[], n: number): string[] {
    const copy = [...arr];
    const out: string[] = [];
    while (out.length < n && copy.length > 0) {
      out.push(copy.splice(randomInt(copy.length), 1)[0]);
    }
    return out;
  }

  private async randomDelay(range: {
    min: number;
    max: number;
  }): Promise<void> {
    const ms = range.min + randomInt(range.max - range.min + 1);
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
