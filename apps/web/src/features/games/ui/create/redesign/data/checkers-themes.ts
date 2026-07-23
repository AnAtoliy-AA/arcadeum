export interface CheckersThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const CHECKERS_THEMES: CheckersThemeMeta[] = [
  {
    id: 'classic',
    name: 'Classic',
    desc: 'Traditional checkers board with warm wood tones.',
    color: '#92400e',
  },
  {
    id: 'neon',
    name: 'Neon',
    desc: 'Glowing cyan and purple neon aesthetic.',
    color: '#7c3aed',
  },
  {
    id: 'wood',
    name: 'Wood',
    desc: 'Rich wooden board with natural grain.',
    color: '#b45309',
  },
  {
    id: 'marble',
    name: 'Marble',
    desc: 'Elegant marble finish with cool stone tones.',
    color: '#64748b',
  },
  {
    id: 'neon_glow',
    name: 'Neon Glow',
    desc: 'Deep purple neon with electric glow.',
    color: '#4338ca',
  },
];

export function findCheckersTheme(id: string | undefined): CheckersThemeMeta {
  return CHECKERS_THEMES.find((t) => t.id === id) ?? CHECKERS_THEMES[0];
}
