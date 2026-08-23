import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { randomInt } from 'crypto';
import { SpadesService } from './spades.service';
import { GameSessionsService } from '../sessions/game-sessions.service';
import type { GameSessionSummary } from '../sessions/game-sessions.service';
import {
  GAME_PHASE,
  MAX_BID,
  NIL_BID,
} from '../engines/spades/spades.constants';
import type { SpadesState } from '../engines/spades/spades.types';
import { rankValue, suitOf } from '../engines/spades/spades.utils';
import { partnerOf } from '../engines/spades/spades.utils';
import { getAiMoveDelayMs, isAiVsAiSession } from '../common/ai-vs-ai';
const MOVE_DELAY_MS = { min: 400, max: 1100 };

type Difficulty = 'easy' | 'medium' | 'hard';

@Injectable()
export class SpadesBotService {
  private readonly logger = new Logger(SpadesBotService.name);
  private readonly processing = new Set<string>();

  constructor(
    @Inject(forwardRef(() => SpadesService))
    private readonly spadesService: SpadesService,
    private readonly sessionsService: GameSessionsService,
  ) {}

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

  /** The bot whose turn it is to bid or play, or null. */
  currentActorId(state: SpadesState): string | null {
    return state.playerOrder[state.currentTurnIndex] ?? null;
  }

  // ----------------------------------------------------------------- bidding

  pickBid(state: SpadesState, botId: string): number {
    const hand = state.hands[botId] ?? [];
    const sureWinners = countSureWinners(hand);

    if (this.difficultyOf(state) === 'easy') {
      // Random-ish but still spade-aware so easy bots stay plausible.
      return Math.max(1, Math.min(MAX_BID, sureWinners + randomInt(3)));
    }

    // Nil is attractive with a flat hand: few or no sure winners and no
    // dangerous aces/kings outside spades.
    if (state.options.nilEnabled && sureWinners <= 1 && nilIsSafe(hand)) {
      return NIL_BID;
    }
    return Math.max(1, Math.min(MAX_BID, sureWinners));
  }

  // ----------------------------------------------------------------- playing

  pickCardToPlay(state: SpadesState, botId: string): string | null {
    const hand = state.hands[botId] ?? [];
    const legal = this.legalCards(state, botId, hand);
    if (legal.length === 0) return hand[0] ?? null;
    if (this.difficultyOf(state) === 'easy')
      return legal[randomInt(legal.length)];

    const plays = state.currentTrick.plays;
    const byRankAsc = (cards: string[]) =>
      [...cards].sort((a, b) => rankValue(a) - rankValue(b));

    if (plays.length === 0) {
      return this.pickLead(legal, hand);
    }

    const leadSuit = state.currentTrick.leadSuit;
    const inSuit =
      leadSuit !== null ? legal.filter((c) => suitOf(c) === leadSuit) : [];
    const partnerId = partnerOf(state.playerOrder, botId);
    const winningPlay = currentWinningPlay(plays);
    const partnerWinning = winningPlay?.playerId === partnerId;

    // Follow suit when possible.
    if (inSuit.length > 0) {
      const sorted = byRankAsc(inSuit);
      if (partnerWinning) return sorted[0]; // duck — partner has it
      const winners = winningPlay
        ? sorted.filter((c) => beats(c, winningPlay.card))
        : sorted;
      return winners[0] ?? sorted[0]; // cheapest winner, else duck low
    }

    // Void in the led suit.
    const spades = legal.filter((c) => suitOf(c) === 'S');
    if (!partnerWinning && spades.length > 0 && winningPlay) {
      const winners = spades
        .filter((c) => beats(c, winningPlay.card))
        .sort((a, b) => rankValue(a) - rankValue(b));
      if (winners.length > 0 && trickHasHighCard(winningPlay.card)) {
        return winners[0]; // trump in cheaply over a strong card
      }
    }
    // Discard the lowest non-spade; keep spade control.
    const nonSpades = legal.filter((c) => suitOf(c) !== 'S');
    return byRankAsc(nonSpades.length > 0 ? nonSpades : legal)[0];
  }

  private pickLead(legal: string[], hand: string[]): string {
    const spades = legal.filter((c) => suitOf(c) === 'S');
    const nonSpades = legal.filter((c) => suitOf(c) !== 'S');

    // With a deep spade run, draw out opponents' trumps using the top.
    const spadeCount = hand.filter((c) => suitOf(c) === 'S').length;
    if (spadeCount >= 5 && spades.length > 0) {
      return [...spades].sort((a, b) => rankValue(b) - rankValue(a))[0];
    }

    // Otherwise lead low from the longest non-spade suit.
    if (nonSpades.length > 0) {
      const bySuit = new Map<string, string[]>();
      for (const card of nonSpades) {
        const suit = suitOf(card) ?? 'C';
        bySuit.set(suit, [...(bySuit.get(suit) ?? []), card]);
      }
      let longest: string[] = [];
      for (const cards of bySuit.values()) {
        if (cards.length > longest.length) longest = cards;
      }
      return [...longest].sort((a, b) => rankValue(a) - rankValue(b))[0];
    }
    return [...legal].sort((a, b) => rankValue(a) - rankValue(b))[0];
  }

  /**
   * Legal cards for a player given follow-suit / broken-spades rules
   * (mirrors the engine validators without mutating state).
   */
  legalCards(state: SpadesState, botId: string, hand?: string[]): string[] {
    const h = hand ?? state.hands[botId] ?? [];
    const plays = state.currentTrick.plays;
    const leading = plays.length === 0;

    if (leading) {
      if (!state.spadesBroken) {
        const nonSpades = h.filter((c) => suitOf(c) !== 'S');
        if (nonSpades.length > 0) return nonSpades;
      }
      return [...h];
    }

    const leadSuit = state.currentTrick.leadSuit;
    const inSuit = h.filter((c) => c.endsWith(leadSuit ?? ''));
    if (leadSuit && inSuit.length > 0) return inSuit;
    return [...h];
  }

  private difficultyOf(state: SpadesState): Difficulty {
    const d = state.options.aiDifficulty;
    if (d === 'easy') return 'easy';
    // AI-vs-AI rooms request 'expert' (no per-game expert strategy exists
    // for spades) — play the strongest available strategy instead.
    return d === 'hard' || d === 'expert' ? 'hard' : 'medium';
  }

  private async randomDelay(range: {
    min: number;
    max: number;
  }): Promise<void> {
    const ms = range.min + randomInt(range.max - range.min + 1);
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/** Aces and bare kings/queens of side suits plus top spades are "sure" tricks. */
function countSureWinners(hand: string[]): number {
  const spades = hand
    .filter((c) => suitOf(c) === 'S')
    .sort((a, b) => rankValue(b) - rankValue(a));
  let winners = 0;
  // Top spades that outrank every missing spade are guaranteed tricks.
  const missingHighSpades = ['AS', 'KS', 'QS'].filter((c) => !hand.includes(c));
  for (const card of spades) {
    const beaten = missingHighSpades.some(
      (m) => rankValue(m) > rankValue(card),
    );
    if (!beaten) winners += 1;
    else break;
  }
  for (const card of hand) {
    if (suitOf(card) === 'S') continue;
    if (rankValue(card) === 14)
      winners += 1; // ace
    else if (rankValue(card) === 13) winners += 0.5; // guarded king maybe
  }
  return Math.round(winners);
}

/** Nil is safe with no aces/kings and at most a couple of mid spades. */
function nilIsSafe(hand: string[]): boolean {
  return (
    !hand.some((c) => rankValue(c) >= 13 && suitOf(c) !== 'S') &&
    hand.filter((c) => suitOf(c) === 'S' && rankValue(c) >= 11).length === 0
  );
}

/** Play currently winning the trick, or null before any card is down. */
function currentWinningPlay(plays: Array<{ playerId: string; card: string }>) {
  if (plays.length === 0) return null;
  const spades = plays.filter((p) => p.card.endsWith('S'));
  const pool = spades.length > 0 ? spades : plays;
  const leadSuit = plays[0].card.slice(-1);
  const candidates =
    spades.length > 0
      ? pool
      : pool.filter((p) => p.card.slice(-1) === leadSuit);
  return candidates.reduce((best, p) =>
    rankValue(p.card) > rankValue(best.card) ? p : best,
  );
}

/** Whether `card` beats `other` under spades-trump rules. */
function beats(card: string, other: string): boolean {
  const cardIsSpade = card.endsWith('S');
  const otherIsSpade = other.endsWith('S');
  if (cardIsSpade !== otherIsSpade) return cardIsSpade;
  return rankValue(card) > rankValue(other);
}

/** A trick containing an ace or king of the led suit is worth contesting. */
function trickHasHighCard(card: string): boolean {
  return rankValue(card) >= 13;
}
