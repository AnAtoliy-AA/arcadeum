export type ExpansionId = 'attack' | 'future' | 'theft' | 'chaos' | 'deity';

export const EXPANSION_PACKS: {
  id: ExpansionId;
  name: string;
  cardCount: number;
  available: boolean;
}[] = [
  { id: 'attack', name: 'Attack Pack', cardCount: 5, available: true },
  { id: 'future', name: 'Future Pack', cardCount: 8, available: true },
  { id: 'theft', name: 'Theft Pack', cardCount: 4, available: false },
  { id: 'chaos', name: 'Chaos Pack', cardCount: 5, available: false },
  { id: 'deity', name: 'Deity Pack', cardCount: 4, available: false },
];

export const CARD_VARIANTS: {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
}[] = [
  {
    id: 'cyberpunk',
    name: 'The Short Circuit',
    description: 'Cyberpunk hackers preventing system overload',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
  },
  {
    id: 'underwater',
    name: 'Deep Sea Pressure',
    description: 'Underwater horror in a leaking submarine',
    emoji: '🦑',
    gradient: 'linear-gradient(135deg, #007CF0 0%, #00DFD8 100%)',
  },
  {
    id: 'crime',
    name: 'The Heist',
    description: 'Crime noir theme with police raids and getaways',
    emoji: '🕵️‍♀️',
    gradient: 'linear-gradient(135deg, #F5A623 0%, #F8E71C 100%)',
  },
  {
    id: 'horror',
    name: 'The Cursed Banquet',
    description: 'Social horror theme at a dark sorcerer party',
    emoji: '👻',
    gradient: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
  },
  {
    id: 'adventure',
    name: 'High-Altitude Hike',
    description: 'Survival adventure escaping an avalanche',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #4F566B 0%, #FF4D4D 100%)',
  },
];

export const gamesCatalog = [
  {
    id: 'critical_v1',
    name: 'Critical',
    summary: 'A strategic card game where you avoid exploding cats',
    isPlayable: true,
  },
  {
    id: 'texas_holdem_v1',
    name: "Texas Hold'em",
    summary: 'Classic poker game with community cards',
    isPlayable: false, // Temporarily unavailable
    isHidden: true, // Temporarily hidden from UI
  },
];
