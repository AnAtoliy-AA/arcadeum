import { randomUUID } from 'crypto';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type BettingRound = 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

export type PlayerAction =
  | 'fold'
  | 'check'
  | 'call'
  | 'raise'
  | 'all-in'
  | 'waiting';

export interface TexasHoldemPlayerState {
  playerId: string;
  chips: number;
  hand: Card[];
  currentBet: number;
  totalBet: number;
  folded: boolean;
  allIn: boolean;
  lastAction?: PlayerAction;
}

export type TexasHoldemLogVisibility = 'all' | 'players';

export interface TexasHoldemLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: TexasHoldemLogVisibility;
  senderId?: string | null;
  senderName?: string | null;
}

export interface TexasHoldemState {
  deck: Card[];
  communityCards: Card[];
  pot: number;
  sidePots: Array<{ amount: number; eligiblePlayers: string[] }>;
  playerOrder: string[];
  dealerIndex: number;
  currentTurnIndex: number;
  bettingRound: BettingRound;
  currentBet: number;
  players: TexasHoldemPlayerState[];
  logs: TexasHoldemLogEntry[];
  lastToRaise: number | null;
  roundComplete: boolean;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

function shuffleInPlace<T>(items: T[]): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
}

export function createInitialTexasHoldemState(
  playerIds: string[],
  startingChips: number = 1000,
): TexasHoldemState {
  if (playerIds.length < 2) {
    throw new Error("Texas Hold'em requires at least two players.");
  }
  if (playerIds.length > 10) {
    throw new Error("Texas Hold'em supports a maximum of 10 players.");
  }

  const deck = createDeck();
  shuffleInPlace(deck);

  const players: TexasHoldemPlayerState[] = playerIds.map((playerId) => ({
    playerId,
    chips: startingChips,
    hand: [],
    currentBet: 0,
    totalBet: 0,
    folded: false,
    allIn: false,
  }));

  // Deal two cards to each player
  players.forEach((player) => {
    player.hand = [deck.pop()!, deck.pop()!];
  });

  const dealerIndex = 0;

  return {
    deck,
    communityCards: [],
    pot: 0,
    sidePots: [],
    playerOrder: [...playerIds],
    dealerIndex,
    currentTurnIndex: (dealerIndex + 3) % playerIds.length, // First to act after big blind
    bettingRound: 'pre-flop',
    currentBet: 0,
    players,
    logs: [
      {
        id: randomUUID(),
        type: 'system',
        message: `Game started with ${playerIds.length} players`,
        createdAt: new Date().toISOString(),
        scope: 'all',
      },
    ],
    lastToRaise: null,
    roundComplete: false,
  };
}

// Hand evaluation utilities
const RANK_VALUES: Record<Rank, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

export type HandRank =
  | 'high-card'
  | 'pair'
  | 'two-pair'
  | 'three-of-a-kind'
  | 'straight'
  | 'flush'
  | 'full-house'
  | 'four-of-a-kind'
  | 'straight-flush'
  | 'royal-flush';

export interface HandEvaluation {
  rank: HandRank;
  value: number;
  cards: Card[];
  description: string;
}

function getRankCounts(cards: Card[]): Map<Rank, number> {
  const counts = new Map<Rank, number>();
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1);
  }
  return counts;
}

function getSuitCounts(cards: Card[]): Map<Suit, number> {
  const counts = new Map<Suit, number>();
  for (const card of cards) {
    counts.set(card.suit, (counts.get(card.suit) || 0) + 1);
  }
  return counts;
}

function isFlush(cards: Card[]): boolean {
  const suitCounts = getSuitCounts(cards);
  return Array.from(suitCounts.values()).some((count) => count >= 5);
}

function isStraight(cards: Card[]): boolean {
  const values = cards.map((c) => RANK_VALUES[c.rank]).sort((a, b) => b - a);
  const unique = Array.from(new Set(values));

  for (let i = 0; i <= unique.length - 5; i++) {
    if (
      unique[i] - unique[i + 1] === 1 &&
      unique[i + 1] - unique[i + 2] === 1 &&
      unique[i + 2] - unique[i + 3] === 1 &&
      unique[i + 3] - unique[i + 4] === 1
    ) {
      return true;
    }
  }

  // Check for A-2-3-4-5 straight (wheel)
  if (
    unique.includes(14) &&
    unique.includes(5) &&
    unique.includes(4) &&
    unique.includes(3) &&
    unique.includes(2)
  ) {
    return true;
  }

  return false;
}

export function evaluateHand(
  playerHand: Card[],
  communityCards: Card[],
): HandEvaluation {
  const allCards = [...playerHand, ...communityCards];
  const rankCounts = getRankCounts(allCards);

  const isFlushHand = isFlush(allCards);
  const isStraightHand = isStraight(allCards);

  // Sort by count then by value
  const rankEntries = Array.from(rankCounts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return RANK_VALUES[b[0]] - RANK_VALUES[a[0]];
  });

  const counts = rankEntries.map((e) => e[1]);
  const maxValue = Math.max(...allCards.map((c) => RANK_VALUES[c.rank]));

  // Royal flush
  if (isStraightHand && isFlushHand && maxValue === 14) {
    const straightCards = allCards.filter((c) =>
      [14, 13, 12, 11, 10].includes(RANK_VALUES[c.rank]),
    );
    if (straightCards.length >= 5) {
      return {
        rank: 'royal-flush',
        value: 10_000_000,
        cards: straightCards.slice(0, 5),
        description: 'Royal Flush',
      };
    }
  }

  // Straight flush
  if (isStraightHand && isFlushHand) {
    return {
      rank: 'straight-flush',
      value: 9_000_000 + maxValue,
      cards: allCards.slice(0, 5),
      description: 'Straight Flush',
    };
  }

  // Four of a kind
  if (counts[0] === 4) {
    return {
      rank: 'four-of-a-kind',
      value: 8_000_000 + RANK_VALUES[rankEntries[0][0]],
      cards: allCards.slice(0, 5),
      description: 'Four of a Kind',
    };
  }

  // Full house
  if (counts[0] === 3 && counts[1] === 2) {
    return {
      rank: 'full-house',
      value:
        7_000_000 +
        RANK_VALUES[rankEntries[0][0]] * 100 +
        RANK_VALUES[rankEntries[1][0]],
      cards: allCards.slice(0, 5),
      description: 'Full House',
    };
  }

  // Flush
  if (isFlushHand) {
    return {
      rank: 'flush',
      value: 6_000_000 + maxValue,
      cards: allCards.slice(0, 5),
      description: 'Flush',
    };
  }

  // Straight
  if (isStraightHand) {
    return {
      rank: 'straight',
      value: 5_000_000 + maxValue,
      cards: allCards.slice(0, 5),
      description: 'Straight',
    };
  }

  // Three of a kind
  if (counts[0] === 3) {
    return {
      rank: 'three-of-a-kind',
      value: 4_000_000 + RANK_VALUES[rankEntries[0][0]],
      cards: allCards.slice(0, 5),
      description: 'Three of a Kind',
    };
  }

  // Two pair
  if (counts[0] === 2 && counts[1] === 2) {
    return {
      rank: 'two-pair',
      value:
        3_000_000 +
        RANK_VALUES[rankEntries[0][0]] * 100 +
        RANK_VALUES[rankEntries[1][0]],
      cards: allCards.slice(0, 5),
      description: 'Two Pair',
    };
  }

  // Pair
  if (counts[0] === 2) {
    return {
      rank: 'pair',
      value: 2_000_000 + RANK_VALUES[rankEntries[0][0]],
      cards: allCards.slice(0, 5),
      description: 'Pair',
    };
  }

  // High card
  return {
    rank: 'high-card',
    value: 1_000_000 + maxValue,
    cards: allCards.slice(0, 5),
    description: 'High Card',
  };
}
