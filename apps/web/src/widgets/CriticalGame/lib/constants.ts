export const GAME_VARIANT = {
  CYBERPUNK: 'cyberpunk',
  UNDERWATER: 'underwater',
  CRIME: 'crime',
  HORROR: 'horror',
  ADVENTURE: 'adventure',
} as const;

export const CARD_VARIANTS = [
  {
    id: GAME_VARIANT.CYBERPUNK,
    name: 'The Short Circuit',
    description: 'Cyberpunk hackers preventing system overload',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
  },
  {
    id: GAME_VARIANT.UNDERWATER,
    name: 'Deep Sea Pressure',
    description: 'Underwater horror in a leaking submarine',
    emoji: '🦑',
    gradient: 'linear-gradient(135deg, #007CF0 0%, #00DFD8 100%)',
  },
  {
    id: GAME_VARIANT.CRIME,
    name: 'The Heist',
    description: 'Crime noir theme with police raids and getaways',
    emoji: '🕵️‍♀️',
    gradient: 'linear-gradient(135deg, #F5A623 0%, #F8E71C 100%)',
  },
  {
    id: GAME_VARIANT.HORROR,
    name: 'The Cursed Banquet',
    description: 'Social horror theme at a dark sorcerer party',
    emoji: '👻',
    gradient: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
  },
  {
    id: GAME_VARIANT.ADVENTURE,
    name: 'High-Altitude Hike',
    description: 'Survival adventure escaping an avalanche',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #4F566B 0%, #FF4D4D 100%)',
  },
] as const;

export const RANDOM_VARIANT = {
  id: 'random',
  name: 'Random Theme',
  description: 'Surprise me with a random theme!',
  emoji: '🎲',
  gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
};
