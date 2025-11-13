import { randomUUID } from 'crypto';

export type ExplodingCatsCatCard =
  | 'tacocat'
  | 'hairy_potato_cat'
  | 'rainbow_ralphing_cat'
  | 'cattermelon'
  | 'bearded_cat';

export type ExplodingCatsCard =
  | 'exploding_cat'
  | 'defuse'
  | 'attack'
  | 'skip'
  | ExplodingCatsCatCard;

export interface ExplodingCatsPlayerState {
  playerId: string;
  hand: ExplodingCatsCard[];
  alive: boolean;
}

export type ExplodingCatsLogVisibility = 'all' | 'players';

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
  players: ExplodingCatsPlayerState[];
  logs: ExplodingCatsLogEntry[];
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

export function createInitialExplodingCatsState(
  playerIds: string[],
): ExplodingCatsState {
  if (playerIds.length < 2) {
    throw new Error('Exploding Cats requires at least two players.');
  }

  // Base deck with enough neutral/action cards for initial deal
  const deck: ExplodingCatsCard[] = [
    ...repeatCard('attack', 4),
    ...repeatCard('skip', 4),
    ...repeatCard('tacocat', 4),
    ...repeatCard('hairy_potato_cat', 4),
    ...repeatCard('rainbow_ralphing_cat', 4),
    ...repeatCard('cattermelon', 4),
    ...repeatCard('bearded_cat', 4),
    ...repeatCard('defuse', 6),
  ];

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
