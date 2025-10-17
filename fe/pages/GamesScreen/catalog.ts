export type GameStatus = 'In prototype' | 'In design' | 'Roadmap';

export interface GameSectionItem {
  title: string;
  description: string;
}

export interface GameStep {
  title: string;
  detail: string;
}

export interface GameCatalogueEntry {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  overview: string;
  status: GameStatus;
  players: string;
  duration: string;
  tags: string[];
  bestFor: string[];
  mechanics: string[];
  highlights: GameSectionItem[];
  howToPlay: GameStep[];
  comingSoon: GameSectionItem[];
}

export const gamesCatalog: GameCatalogueEntry[] = [
  {
    id: 'exploding-kittens',
    name: 'Exploding Cats',
    tagline: 'Dodge the detonations, weaponize your deck, and stay nine lives ahead.',
    summary: 'Push your luck, avoid the exploding cats, and sabotage opponents with wild cards.',
    overview:
      'Exploding Cats brings the beloved party-card chaos online with simultaneous turns, smart animations, and optional house rules. Our rules engine tracks every interaction so you can focus on bluffing, defusing, and taunting your friends in real time.',
    status: 'In prototype',
    players: '2-5 players',
    duration: '15 min',
    tags: ['Card game', 'Party', 'Humor'],
    bestFor: ['Quick sessions', 'Remote game nights', 'New players'],
    mechanics: ['Push your luck', 'Deck manipulation', 'Take that'],
    highlights: [
      {
        title: 'Adaptive rule engine',
        description: 'Server-side state enforces defuse, skip, and attack chains instantly—even with simultaneous reactions.',
      },
      {
        title: 'Drama-friendly animations',
        description: 'Explosions, cat antics, and slow-mo defuses amplify every turn without slowing gameplay.',
      },
      {
        title: 'Quick rematch loops',
        description: 'Queue rematches with one tap and keep your lobby intact for back-to-back chaos.',
      },
    ],
    howToPlay: [
      {
        title: 'Draw at the end of your turn',
        detail: 'If you draw an exploding cat without a defuse card, you detonate and leave the round.',
      },
      {
        title: 'Chain action cards',
        detail: 'Use skip, attack, favor, and shuffle cards in any combination—our engine resolves the stack automatically.',
      },
      {
        title: 'Strategize your defuses',
        detail: 'Defuse cards let you reinsert the bomb anywhere in the deck, forcing future mayhem.',
      },
    ],
    comingSoon: [
      {
        title: 'Ranked ladders',
        description: 'Seasonal ladders with cosmetic unlocks and stat tracking for competitive crews.',
      },
      {
        title: 'Custom deck builder',
        description: 'Upload your own cat art and card ideas for community-voted variants.',
      },
    ],
  },
  {
    id: 'coup',
    name: 'Coup',
    tagline: 'Bluffs, betrayals, and lightning-fast influence battles.',
    summary: 'Bluff, deduce, and outmaneuver rivals in a fast-paced game of influence.',
    overview:
      'Our Coup build focuses on crisp UI for role reveals, automated challenge resolution, and rich telemetry to sharpen your reads. Whether you play with friends or jump into matchmaking, every decision resolves in seconds.',
    status: 'In design',
    players: '2-6 players',
    duration: '10 min',
    tags: ['Bluffing', 'Strategy'],
    bestFor: ['High-stakes bluffing', 'Short sessions', 'Voice chat squads'],
    mechanics: ['Hidden roles', 'Bluffing', 'Resource management'],
    highlights: [
      {
        title: 'Challenge timeline',
        description: 'Automatic timers keep challenges brisk and highlight role history to help inform your calls.',
      },
      {
        title: 'Influence tracker',
        description: 'Visual influence counters show who is vulnerable without revealing hidden roles.',
      },
      {
        title: 'Table talk overlays',
        description: 'Optional voice-synced captions make remote banter easier to follow.',
      },
    ],
    howToPlay: [
      {
        title: 'Claim actions',
        detail: 'On your turn, take an action—income, foreign aid, tax, assassinate, or coup. Some require role claims.',
      },
      {
        title: 'Bluff or believe',
        detail: 'Opponents may challenge your claim. Lose the challenge and you burn influence; win and they do.',
      },
      {
        title: 'Eliminate influence',
        detail: 'Be the last player with influence to seize control of the city.',
      },
    ],
    comingSoon: [
      {
        title: 'Ranked matchmaking',
        description: 'Skill-based pairing with Elo-style ratings and seasonal resets.',
      },
      {
        title: 'Alliance mode',
        description: 'Cooperative variant where pairs coordinate bluff strategies for team victories.',
      },
    ],
  },
  {
    id: 'pandemic-lite',
    name: 'Pandemic: Rapid Response',
    tagline: 'Coordinated chaos against global outbreaks.',
    summary: 'Coordinate with friends in real time to stop global outbreaks before time runs out.',
    overview:
      'Race the clock to deliver supplies worldwide. Our version emphasizes collaborative tools, shared dashboards, and a tactical timeline so everyone knows the plan—no matter the device.',
    status: 'Roadmap',
    players: '2-4 players',
    duration: '20 min',
    tags: ['Co-op', 'Strategy'],
    bestFor: ['Team synergy', 'Voice coordination', 'Experienced groups'],
    mechanics: ['Dice allocation', 'Real-time coordination', 'Resource management'],
    highlights: [
      {
        title: 'Shared mission board',
        description: 'Visualize current outbreaks, supply routes, and role abilities at a glance.',
      },
      {
        title: 'Timed challenge mode',
        description: 'Optional countdown events increase intensity for elite crews.',
      },
      {
        title: 'Role guidance',
        description: 'Contextual prompts help new players master their specialist abilities fast.',
      },
    ],
    howToPlay: [
      {
        title: 'Roll and assign dice',
        detail: 'Each round, roll dice to determine available actions, then assign them to planes, deliveries, or research.',
      },
      {
        title: 'Coordinate deliveries',
        detail: 'Work together to load planes and deliver supplies to cities before outbreaks trigger.',
      },
      {
        title: 'Manage the timer',
        detail: 'Every decision eats the timeline—communicate constantly to stay ahead of crises.',
      },
    ],
    comingSoon: [
      {
        title: 'Campaign progression',
        description: 'Persistent world map with evolving challenges and unlockable specialists.',
      },
      {
        title: 'Coach mode',
        description: 'AI assistant suggests optimal dice assignments for new crews.',
      },
    ],
  },
];

export function getGameById(id: string): GameCatalogueEntry | undefined {
  return gamesCatalog.find(game => game.id === id);
}
