import { randomUUID } from 'crypto';
import { ChatScope } from '../engines/base/game-engine.interface';

// ===== COLLECTION CARDS (for combos) =====
export type CriticalCollectionCard =
  | 'collection_alpha'
  | 'collection_beta'
  | 'collection_gamma'
  | 'collection_delta'
  | 'collection_epsilon';

export const COLLECTION_CARDS: CriticalCollectionCard[] = [
  'collection_alpha',
  'collection_beta',
  'collection_gamma',
  'collection_delta',
  'collection_epsilon',
];

// ===== BASE GAME CARDS =====
export type BaseActionCard =
  | 'strike'
  | 'evade'
  | 'trade'
  | 'reorder'
  | 'insight'
  | 'cancel';

export const BASE_ACTION_CARDS: BaseActionCard[] = [
  'strike',
  'evade',
  'trade',
  'reorder',
  'insight',
  'cancel',
];

export const BASE_SPECIAL_CARDS = ['critical_event', 'neutralizer'] as const;

// ===== EXPANSION PACK IDENTIFIERS =====
export type CriticalExpansion =
  | 'attack'
  | 'future'
  | 'theft'
  | 'chaos'
  | 'deity';

// ===== ATTACK PACK EXPANSION CARDS =====
export type AttackPackCard =
  | 'targeted_strike'
  | 'private_strike'
  | 'recursive_strike'
  | 'mega_evade'
  | 'invert';

export const ATTACK_PACK_CARDS: AttackPackCard[] = [
  'targeted_strike',
  'private_strike',
  'recursive_strike',
  'mega_evade',
  'invert',
];

// ===== FUTURE PACK EXPANSION CARDS =====
export type FuturePackCard =
  | 'see_future_5x'
  | 'alter_future_3x'
  | 'alter_future_5x'
  | 'reveal_future_3x'
  | 'share_future_3x'
  | 'draw_bottom'
  | 'swap_top_bottom'
  | 'bury';

export const FUTURE_PACK_CARDS: FuturePackCard[] = [
  'see_future_5x',
  'alter_future_3x',
  'alter_future_5x',
  'reveal_future_3x',
  'share_future_3x',
  'draw_bottom',
  'swap_top_bottom',
  'bury',
];

export const CARDS_REQUIRING_DRAWS: CriticalCard[] = [
  'strike',
  'evade',
  'reorder',
  ...ATTACK_PACK_CARDS,
  ...FUTURE_PACK_CARDS,
];

export const ANYTIME_ACTION_CARDS: CriticalCard[] = ['cancel'];

// ===== COMBINED CARD TYPE =====
export type CriticalCard =
  | 'critical_event'
  | 'neutralizer'
  | BaseActionCard
  | CriticalCollectionCard
  | AttackPackCard
  | FuturePackCard;

export interface CriticalPlayerState {
  playerId: string;
  hand: CriticalCard[];
  alive: boolean;
  [key: string]: unknown;
}

export interface CriticalLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: ChatScope;
  senderId?: string | null;
  senderName?: string | null;
}

export interface CriticalState {
  deck: CriticalCard[];
  discardPile: CriticalCard[];
  playerOrder: string[];
  currentTurnIndex: number;
  pendingDraws: number;
  playDirection: 1 | -1; // 1 = clockwise, -1 = counter-clockwise (for Reverse)
  expansions: CriticalExpansion[]; // Active expansion packs
  pendingDefuse: string | null; // Player ID who must play defuse, null if none
  pendingFavor: {
    // Player who requested the favor (will receive the card)
    requesterId: string;
    // Player who must give a card
    targetId: string;
  } | null;
  pendingAlter: {
    playerId: string;
    count: number;
    isShare?: boolean;
  } | null;
  pendingAction: {
    // Action that can be noped
    type: string;
    playerId: string;
    payload?: unknown;
    nopeCount: number; // Odd = canceled, even = active
  } | null;
  players: CriticalPlayerState[];
  logs: CriticalLogEntry[];
  allowActionCardCombos: boolean; // House rule: allow any matching cards for combos
  [key: string]: unknown;
}

// Custom card configuration for partial pack selection
export interface CustomCardConfig {
  [cardId: string]: number; // card ID -> quantity
}

function repeatCard(card: CriticalCard, count: number): CriticalCard[] {
  return Array.from({ length: count }, () => card);
}

function shuffleInPlace<T>(items: T[]): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
}

// Attack Pack cards to add when expansion is enabled
function getAttackPackCards(customCards?: CustomCardConfig): CriticalCard[] {
  const defaults: Record<string, number> = {
    targeted_strike: 3,
    private_strike: 2,
    recursive_strike: 2,
    mega_evade: 2,
    invert: 4,
  };

  return [
    ...repeatCard(
      'targeted_strike',
      customCards?.targeted_strike ?? defaults.targeted_strike,
    ),
    ...repeatCard(
      'private_strike',
      customCards?.private_strike ?? defaults.private_strike,
    ),
    ...repeatCard(
      'recursive_strike',
      customCards?.recursive_strike ?? defaults.recursive_strike,
    ),
    ...repeatCard('mega_evade', customCards?.mega_evade ?? defaults.mega_evade),
    ...repeatCard('invert', customCards?.invert ?? defaults.invert),
  ];
}

// Future Pack cards to add when expansion is enabled
function getFuturePackCards(customCards?: CustomCardConfig): CriticalCard[] {
  const defaults: Record<string, number> = {
    see_future_5x: 4,
    alter_future_3x: 4,
    alter_future_5x: 2,
    reveal_future_3x: 2,
    share_future_3x: 2,
    draw_bottom: 4,
    swap_top_bottom: 3,
    bury: 4,
  };

  return [
    ...repeatCard(
      'see_future_5x',
      customCards?.see_future_5x ?? defaults.see_future_5x,
    ),
    ...repeatCard(
      'alter_future_3x',
      customCards?.alter_future_3x ?? defaults.alter_future_3x,
    ),
    ...repeatCard(
      'alter_future_5x',
      customCards?.alter_future_5x ?? defaults.alter_future_5x,
    ),
    ...repeatCard(
      'reveal_future_3x',
      customCards?.reveal_future_3x ?? defaults.reveal_future_3x,
    ),
    ...repeatCard(
      'share_future_3x',
      customCards?.share_future_3x ?? defaults.share_future_3x,
    ),
    ...repeatCard(
      'draw_bottom',
      customCards?.draw_bottom ?? defaults.draw_bottom,
    ),
    ...repeatCard(
      'swap_top_bottom',
      customCards?.swap_top_bottom ?? defaults.swap_top_bottom,
    ),
    ...repeatCard('bury', customCards?.bury ?? defaults.bury),
  ];
}

export function createInitialCriticalState(
  playerIds: string[],
  expansions: CriticalExpansion[] = [],
  allowActionCardCombos = false,
  customCards?: CustomCardConfig,
): CriticalState {
  if (playerIds.length < 2) {
    throw new Error('Critical requires at least two players.');
  }

  // Base deck with enough neutral/action cards for initial deal
  const deck: CriticalCard[] = [
    ...repeatCard('strike', 4),
    ...repeatCard('evade', 4),
    ...repeatCard('trade', 4),
    ...repeatCard('reorder', 4),
    ...repeatCard('insight', 5),
    ...repeatCard('cancel', 5),
    ...repeatCard('collection_alpha', 4),
    ...repeatCard('collection_beta', 4),
    ...repeatCard('collection_gamma', 4),
    ...repeatCard('collection_delta', 4),
    ...repeatCard('collection_epsilon', 4),
    ...repeatCard('neutralizer', 6),
  ];

  // Add expansion cards based on selected packs
  if (expansions.includes('attack')) {
    deck.push(...getAttackPackCards(customCards));
  }

  if (expansions.includes('future')) {
    deck.push(...getFuturePackCards(customCards));
  }

  shuffleInPlace(deck);

  const players: CriticalPlayerState[] = playerIds.map((playerId) => ({
    playerId,
    hand: [],
    alive: true,
  }));

  // Deal four cards plus one guaranteed defuse to each player
  players.forEach((player) => {
    const drawn: CriticalCard[] = [];
    for (let i = 0; i < 4; i += 1) {
      const card = deck.pop();
      if (!card) {
        break;
      }
      drawn.push(card);
    }

    const defuseIndex = deck.findIndex((card) => card === 'neutralizer');
    const guaranteedDefuse =
      defuseIndex !== -1
        ? (deck.splice(defuseIndex, 1)[0] ?? 'neutralizer')
        : 'neutralizer';

    player.hand = [guaranteedDefuse, ...drawn];
  });

  // Insert exploding cats into the deck (players minus one)
  const bombsToAdd = Math.max(playerIds.length - 1, 1);
  for (let i = 0; i < bombsToAdd; i += 1) {
    deck.push('critical_event');
  }

  // Add an extra defuse for late saves
  deck.push('neutralizer');

  shuffleInPlace(deck);

  return {
    deck,
    discardPile: [],
    playerOrder: [...playerIds],
    currentTurnIndex: 0,
    playDirection: 1,
    expansions,
    allowActionCardCombos,
    pendingDefuse: null,
    pendingFavor: null,
    pendingAlter: null,
    pendingAction: null,
    pendingDraws: 1,
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
  };
}

export function sanitizeCriticalStateForPlayer(
  state: CriticalState,
  playerId: string,
): Partial<CriticalState> {
  const sanitized = JSON.parse(JSON.stringify(state)) as CriticalState;

  // Check if player is an actual game participant
  const isPlayer = sanitized.players.some((p) => p.playerId === playerId);

  // Hide other players' hands
  sanitized.players = sanitized.players.map((p) => {
    if (p.playerId === playerId) {
      return p; // Show full hand to the player
    }
    return {
      ...p,
      hand: p.hand.map(() => 'hidden' as CriticalCard), // Hide cards
    };
  });

  // Filter logs based on scope and player status
  sanitized.logs = sanitized.logs.filter((log) => {
    // Public messages visible to everyone (players + spectators)
    if (log.scope === 'all' || log.scope === undefined) return true;
    // Player-only messages visible only to game participants
    if (log.scope === 'players' && isPlayer) return true;
    // Private messages only visible to sender
    if (log.scope === 'private' && log.senderId === playerId) return true;
    return false;
  });

  // Partially hide deck (show count only)
  // If pendingAlter, show the top N cards to the active player
  if (state.pendingAlter && state.pendingAlter.playerId === playerId) {
    const count = state.pendingAlter.count;
    sanitized.deck = [
      ...state.deck.slice(0, count),
      ...new Array<CriticalCard>(Math.max(0, state.deck.length - count)).fill(
        'hidden' as CriticalCard,
      ),
    ];
  } else {
    sanitized.deck = new Array<CriticalCard>(state.deck.length).fill(
      'hidden' as CriticalCard,
    );
  }

  return sanitized;
}
