export const GAME_VARIANT = {
  CYBERPUNK: 'cyberpunk',
  UNDERWATER: 'underwater',
  CRIME: 'crime',
  HORROR: 'horror',
  ADVENTURE: 'adventure',
  HIGH_ALTITUDE_HIKE: 'high-altitude-hike',
  GALAXY: 'galaxy',
  FANTASY: 'fantasy',
  WESTERN: 'western',
  EGYPT: 'egypt',
  STEAMPUNK: 'steampunk',
  ZEN: 'zen',
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
  {
    id: GAME_VARIANT.GALAXY,
    name: 'games.critical_v1.variants.galaxy.name',
    description: 'games.critical_v1.variants.galaxy.description',
    emoji: '🌌',
    gradient: 'linear-gradient(135deg, #6b21a8 0%, #1e1b4b 100%)',
  },
  {
    id: GAME_VARIANT.FANTASY,
    name: 'games.critical_v1.variants.fantasy.name',
    description: 'games.critical_v1.variants.fantasy.description',
    emoji: '🐉',
    gradient: 'linear-gradient(135deg, #065f46 0%, #d4af37 100%)',
  },
  {
    id: GAME_VARIANT.WESTERN,
    name: 'games.critical_v1.variants.western.name',
    description: 'games.critical_v1.variants.western.description',
    emoji: '🤠',
    gradient: 'linear-gradient(135deg, #9a3412 0%, #fde68a 100%)',
  },
  {
    id: GAME_VARIANT.EGYPT,
    name: 'games.critical_v1.variants.egypt.name',
    description: 'games.critical_v1.variants.egypt.description',
    emoji: '🏺',
    gradient: 'linear-gradient(135deg, #b45309 0%, #1e3a8a 100%)',
  },
  {
    id: GAME_VARIANT.STEAMPUNK,
    name: 'games.critical_v1.variants.steampunk.name',
    description: 'games.critical_v1.variants.steampunk.description',
    emoji: '⚙️',
    gradient: 'linear-gradient(135deg, #78350f 0%, #fef3c7 100%)',
  },
  {
    id: GAME_VARIANT.ZEN,
    name: 'games.critical_v1.variants.zen.name',
    description: 'games.critical_v1.variants.zen.description',
    emoji: '🏮',
    gradient: 'linear-gradient(135deg, #db2777 0%, #1e1b4b 100%)',
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
