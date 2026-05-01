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
  },
  {
    id: 'horror',
    name: 'games.critical_v1.variants.horror.name',
    description: 'games.critical_v1.variants.horror.description',
    emoji: '👻',
    gradient: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
  },
  {
    id: 'adventure',
    name: 'games.critical_v1.variants.adventure.name',
    description: 'games.critical_v1.variants.adventure.description',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #4F566B 0%, #FF4D4D 100%)',
  },
  {
    id: 'high-altitude-hike',
    name: 'games.critical_v1.variants.high-altitude-hike.name',
    description: 'games.critical_v1.variants.high-altitude-hike.description',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #7dd3fc 0%, #1e3a8a 100%)',
  },
];
