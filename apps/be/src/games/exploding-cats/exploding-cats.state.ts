import { randomUUID } from 'crypto';

export type ExplodingCatsCatCard =
  | 'tacocat'
  | 'hairy_potato_cat'
  | 'rainbow_ralphing_cat'
  | 'cattermelon'
  | 'bearded_cat';

// Expansion pack identifiers
export type ExplodingCatsExpansion =
  | 'attack'
  | 'future'
  | 'theft'
  | 'chaos'
  | 'deity';

// Attack Pack cards
export type AttackPackCard =
  | 'targeted_attack'
  | 'personal_attack'
  | 'attack_of_the_dead'
  | 'super_skip'
  | 'reverse';

export type ExplodingCatsCard =
  | 'exploding_cat'
  | 'defuse'
  | 'attack'
  | 'skip'
  | 'favor'
  | 'shuffle'
  | 'see_the_future'
  | 'nope'
  | ExplodingCatsCatCard
  | AttackPackCard;

export interface ExplodingCatsPlayerState {
  playerId: string;
  hand: ExplodingCatsCard[];
  alive: boolean;
  [key: string]: unknown;
}

export type ExplodingCatsLogVisibility = 'all' | 'players' | 'private';

export interface ExplodingCatsLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: ExplodingCatsLogVisibility;
  senderId?: string | null;
  senderName?: string | null;
}

export interface ExplodingCatsState {
  deck: ExplodingCatsCard[];
  discardPile: ExplodingCatsCard[];
  playerOrder: string[];
  currentTurnIndex: number;
  pendingDraws: number;
  playDirection: 1 | -1; // 1 = clockwise, -1 = counter-clockwise (for Reverse)
  expansions: ExplodingCatsExpansion[]; // Active expansion packs
  pendingDefuse: string | null; // Player ID who must play defuse, null if none
  pendingFavor: {
    // Player who requested the favor (will receive the card)
    requesterId: string;
    // Player who must give a card
    targetId: string;
  } | null;
  pendingAction: {
    // Action that can be noped
    type: string;
    playerId: string;
    payload?: unknown;
    nopeCount: number; // Odd = canceled, even = active
  } | null;
  players: ExplodingCatsPlayerState[];
  logs: ExplodingCatsLogEntry[];
  [key: string]: unknown;
}

function repeatCard(
  card: ExplodingCatsCard,
  count: number,
): ExplodingCatsCard[] {
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
function getAttackPackCards(): ExplodingCatsCard[] {
  return [
    ...repeatCard('targeted_attack', 3),
    ...repeatCard('personal_attack', 2),
    ...repeatCard('attack_of_the_dead', 2),
    ...repeatCard('super_skip', 2),
    ...repeatCard('reverse', 4),
  ];
}

export function createInitialExplodingCatsState(
  playerIds: string[],
  expansions: ExplodingCatsExpansion[] = [],
): ExplodingCatsState {
  if (playerIds.length < 2) {
    throw new Error('Exploding Cats requires at least two players.');
  }

  // Base deck with enough neutral/action cards for initial deal
  const deck: ExplodingCatsCard[] = [
    ...repeatCard('attack', 4),
    ...repeatCard('skip', 4),
    ...repeatCard('favor', 4),
    ...repeatCard('shuffle', 4),
    ...repeatCard('see_the_future', 5),
    ...repeatCard('nope', 5),
    ...repeatCard('tacocat', 4),
    ...repeatCard('hairy_potato_cat', 4),
    ...repeatCard('rainbow_ralphing_cat', 4),
    ...repeatCard('cattermelon', 4),
    ...repeatCard('bearded_cat', 4),
    ...repeatCard('defuse', 6),
  ];

  // Add expansion cards based on selected packs
  if (expansions.includes('attack')) {
    deck.push(...getAttackPackCards());
  }

  shuffleInPlace(deck);

  const players: ExplodingCatsPlayerState[] = playerIds.map((playerId) => ({
    playerId,
    hand: [],
    alive: true,
  }));

  // Deal four cards plus one guaranteed defuse to each player
  players.forEach((player) => {
    const drawn: ExplodingCatsCard[] = [];
    for (let i = 0; i < 4; i += 1) {
      const card = deck.pop();
      if (!card) {
        break;
      }
      drawn.push(card);
    }

    const defuseIndex = deck.findIndex((card) => card === 'defuse');
    const guaranteedDefuse =
      defuseIndex !== -1
        ? (deck.splice(defuseIndex, 1)[0] ?? 'defuse')
        : 'defuse';

    player.hand = [guaranteedDefuse, ...drawn];
  });

  // Insert exploding cats into the deck (players minus one)
  const bombsToAdd = Math.max(playerIds.length - 1, 1);
  for (let i = 0; i < bombsToAdd; i += 1) {
    deck.push('exploding_cat');
  }

  // Add an extra defuse for late saves
  deck.push('defuse');

  shuffleInPlace(deck);

  return {
    deck,
    discardPile: [],
    playerOrder: [...playerIds],
    currentTurnIndex: 0,
    playDirection: 1,
    expansions,
    pendingDefuse: null,
    pendingFavor: null,
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
