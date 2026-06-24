export interface CascadeThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const CASCADE_THEMES: CascadeThemeMeta[] = [
  {
    id: 'cosmic',
    name: 'Cosmic',
    desc: 'Stars, supernovas, and wormholes among the four colors.',
    color: '#7c3aed',
  },
  {
    id: 'arcane',
    name: 'Arcane',
    desc: 'Schools of magic in deep purple and rose gold.',
    color: '#be185d',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    desc: 'Neon hacker factions over deep slate.',
    color: '#22d3ee',
  },
  {
    id: 'elemental',
    name: 'Elemental',
    desc: 'Fire, Stone, Leaf, and Tide — clean nature palette.',
    color: '#16a34a',
  },
  {
    id: 'classic',
    name: 'Classic',
    desc: 'Traditional card game colors — clean and timeless.',
    color: '#2563eb',
  },
  {
    id: 'neon',
    name: 'Neon',
    desc: 'Glowing neon palette on deep purple void.',
    color: '#a855f7',
  },
  {
    id: 'tropical',
    name: 'Tropical',
    desc: 'Hibiscus, Palm, Ocean — beach vibes and warm colors.',
    color: '#14b8a6',
  },
  {
    id: 'steampunk',
    name: 'Steampunk',
    desc: 'Brass, Boiler, Verdigris — Victorian mechanical aesthetic.',
    color: '#d97706',
  },
];

export function findCascadeTheme(id: string | undefined): CascadeThemeMeta {
  return CASCADE_THEMES.find((t) => t.id === id) ?? CASCADE_THEMES[0];
}
