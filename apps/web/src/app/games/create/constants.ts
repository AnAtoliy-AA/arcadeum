export type ExpansionId = 'attack' | 'future' | 'theft' | 'chaos' | 'deity';

export interface PackCard {
  id: string;
  name: string;
  defaultCount: number;
  maxCount: number;
}

export interface ExpansionPackDetails {
  id: ExpansionId;
  name: string;
  available: boolean;
  cards: PackCard[];
}

// Detailed pack info for partial selection
export const EXPANSION_PACK_DETAILS: ExpansionPackDetails[] = [
  {
    id: 'attack',
    name: 'Attack Pack',
    available: true,
    cards: [
      {
        id: 'targeted_strike',
        name: 'Targeted Strike',
        defaultCount: 3,
        maxCount: 6,
      },
      {
        id: 'private_strike',
        name: 'Private Strike',
        defaultCount: 2,
        maxCount: 4,
      },
      {
        id: 'recursive_strike',
        name: 'Recursive Strike',
        defaultCount: 2,
        maxCount: 4,
      },
      { id: 'mega_evade', name: 'Mega Evade', defaultCount: 2, maxCount: 4 },
      { id: 'invert', name: 'Invert', defaultCount: 4, maxCount: 6 },
    ],
  },
  {
    id: 'future',
    name: 'Future Pack',
    available: true,
    cards: [
      {
        id: 'see_future_5x',
        name: 'See Future 5x',
        defaultCount: 4,
        maxCount: 6,
      },
      {
        id: 'alter_future_3x',
        name: 'Alter Future 3x',
        defaultCount: 4,
        maxCount: 6,
      },
      {
        id: 'alter_future_5x',
        name: 'Alter Future 5x',
        defaultCount: 2,
        maxCount: 4,
      },
      {
        id: 'reveal_future_3x',
        name: 'Reveal Future 3x',
        defaultCount: 2,
        maxCount: 4,
      },
      {
        id: 'share_future_3x',
        name: 'Share Future 3x',
        defaultCount: 2,
        maxCount: 4,
      },
      { id: 'draw_bottom', name: 'Draw Bottom', defaultCount: 4, maxCount: 6 },
      {
        id: 'swap_top_bottom',
        name: 'Swap Top Bottom',
        defaultCount: 3,
        maxCount: 5,
      },
      { id: 'bury', name: 'Bury', defaultCount: 4, maxCount: 6 },
    ],
  },
  {
    id: 'theft',
    name: 'Theft Pack',
    available: true,
    cards: [
      { id: 'wildcard', name: 'Wildcard', defaultCount: 4, maxCount: 6 },
      { id: 'mark', name: 'Mark', defaultCount: 3, maxCount: 5 },
      {
        id: 'steal_draw',
        name: "I'll Take That",
        defaultCount: 3,
        maxCount: 5,
      },
      { id: 'stash', name: 'Tower of Power', defaultCount: 2, maxCount: 4 },
    ],
  },
  {
    id: 'chaos',
    name: 'Chaos Pack',
    available: true,
    cards: [
      {
        id: 'critical_implosion',
        name: 'Critical Implosion',
        defaultCount: 1,
        maxCount: 2,
      },
      {
        id: 'containment_field',
        name: 'Containment Field',
        defaultCount: 1,
        maxCount: 2,
      },
      { id: 'fission', name: 'Fission', defaultCount: 1, maxCount: 2 },
      { id: 'tribute', name: 'Tribute', defaultCount: 2, maxCount: 4 },
      { id: 'blackout', name: 'Blackout', defaultCount: 2, maxCount: 4 },
    ],
  },
  {
    id: 'deity',
    name: 'Deity Pack',
    available: true,
    cards: [
      {
        id: 'omniscience',
        name: 'Omniscience',
        defaultCount: 2,
        maxCount: 4,
      },
      { id: 'miracle', name: 'Miracle', defaultCount: 2, maxCount: 5 },
      { id: 'smite', name: 'Smite', defaultCount: 3, maxCount: 5 },
      { id: 'rapture', name: 'The Rapture', defaultCount: 2, maxCount: 4 },
    ],
  },
];

// Legacy format for backward compatibility
export const EXPANSION_PACKS: {
  id: ExpansionId;
  name: string;
  cardCount: number;
  available: boolean;
}[] = EXPANSION_PACK_DETAILS.map((pack) => ({
  id: pack.id,
  name: pack.name,
  cardCount: pack.cards.reduce((sum, card) => sum + card.defaultCount, 0),
  available: pack.available,
}));

export const CARD_VARIANTS: {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  disabled?: boolean;
}[] = [
  {
    id: 'cyberpunk',
    name: 'games.critical_v1.variants.cyberpunk.name',
    description: 'games.critical_v1.variants.cyberpunk.description',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
  },
  {
    id: 'underwater',
    name: 'games.critical_v1.variants.underwater.name',
    description: 'games.critical_v1.variants.underwater.description',
    emoji: '🦑',
    gradient: 'linear-gradient(135deg, #007CF0 0%, #00DFD8 100%)',
  },
  {
    id: 'crime',
    name: 'games.critical_v1.variants.crime.name',
    description: 'games.critical_v1.variants.crime.description',
    emoji: '🕵️‍♀️',
    gradient: 'linear-gradient(135deg, #F5A623 0%, #F8E71C 100%)',
    disabled: true,
  },
  {
    id: 'horror',
    name: 'games.critical_v1.variants.horror.name',
    description: 'games.critical_v1.variants.horror.description',
    emoji: '👻',
    gradient: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
    disabled: true,
  },
  {
    id: 'adventure',
    name: 'games.critical_v1.variants.adventure.name',
    description: 'games.critical_v1.variants.adventure.description',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #4F566B 0%, #FF4D4D 100%)',
    disabled: true,
  },
  {
    id: 'high-altitude-hike',
    name: 'games.critical_v1.variants.high-altitude-hike.name',
    description: 'games.critical_v1.variants.high-altitude-hike.description',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #7dd3fc 0%, #1e3a8a 100%)',
  },
];

export const gamesCatalog = [
  {
    id: 'critical_v1',
    name: 'Critical',
    summary: 'A strategic card game where you avoid critical hazards',
    isPlayable: true,
    maxPlayers: 6,
  },
  {
    id: 'texas_holdem_v1',
    name: "Texas Hold'em Poker",
    summary: 'Classic poker game with community cards',
    isPlayable: false, // Temporarily unavailable
    isHidden: true, // Temporarily hidden from UI
  },
  {
    id: 'sea_battle_v1',
    name: 'Sea Battle',
    summary: 'Classic naval combat game for up to 6 players',
    isPlayable: true,
    maxPlayers: 6,
  },
];
