export const GAME_VARIANT = {
  CYBERPUNK: 'cyberpunk',
  UNDERWATER: 'underwater',
  CRIME: 'crime',
  HORROR: 'horror',
  ADVENTURE: 'adventure',
  HIGH_ALTITUDE_HIKE: 'high-altitude-hike',
} as const;

export const CARD_VARIANTS = [
  {
    id: GAME_VARIANT.CYBERPUNK,
    name: 'games.critical_v1.variants.cyberpunk.name',
    description: 'games.critical_v1.variants.cyberpunk.description',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
  },
  {
    id: GAME_VARIANT.UNDERWATER,
    name: 'games.critical_v1.variants.underwater.name',
    description: 'games.critical_v1.variants.underwater.description',
    emoji: '🦑',
    gradient: 'linear-gradient(135deg, #007CF0 0%, #00DFD8 100%)',
  },
  {
    id: GAME_VARIANT.CRIME,
    name: 'games.critical_v1.variants.crime.name',
    description: 'games.critical_v1.variants.crime.description',
    emoji: '🕵️‍♀️',
    gradient: 'linear-gradient(135deg, #F5A623 0%, #F8E71C 100%)',
  },
  {
    id: GAME_VARIANT.HORROR,
    name: 'games.critical_v1.variants.horror.name',
    description: 'games.critical_v1.variants.horror.description',
    emoji: '👻',
    gradient: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
  },
  {
    id: GAME_VARIANT.ADVENTURE,
    name: 'games.critical_v1.variants.adventure.name',
    description: 'games.critical_v1.variants.adventure.description',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #4F566B 0%, #FF4D4D 100%)',
  },
  {
    id: GAME_VARIANT.HIGH_ALTITUDE_HIKE,
    name: 'games.critical_v1.variants.high-altitude-hike.name',
    description: 'games.critical_v1.variants.high-altitude-hike.description',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #7dd3fc 0%, #1e3a8a 100%)',
  },
] as const;

export const RANDOM_VARIANT = {
  id: 'random',
  name: 'games.critical_v1.variants.random.name',
  description: 'games.critical_v1.variants.random.description',
  emoji: '🎲',
  gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
};

export const CRITICAL_VARIANTS = [...CARD_VARIANTS, RANDOM_VARIANT] as const;
