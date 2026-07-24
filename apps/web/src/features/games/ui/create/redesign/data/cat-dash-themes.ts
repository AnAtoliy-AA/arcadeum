export interface CatDashThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
  emoji: string;
}

export const CAT_DASH_THEMES: ReadonlyArray<CatDashThemeMeta> = [
  {
    id: 'neon',
    name: 'Neon Cyber',
    desc: 'Glowing cyberpunk cityscape',
    color: '#7c3aed',
    emoji: '🐱',
  },
  {
    id: 'village',
    name: 'Classic Village',
    desc: 'Cozy countryside racing',
    color: '#059669',
    emoji: '🏘️',
  },
  {
    id: 'space',
    name: 'Space Cats',
    desc: 'Zero-gravity cosmic race',
    color: '#4338ca',
    emoji: '🚀',
  },
  {
    id: 'nature',
    name: 'Nature Wild',
    desc: 'Forest and meadow trails',
    color: '#166534',
    emoji: '🌿',
  },
];

export function findCatDashTheme(id: string | undefined): CatDashThemeMeta {
  return CAT_DASH_THEMES.find((t) => t.id === id) ?? CAT_DASH_THEMES[0];
}
