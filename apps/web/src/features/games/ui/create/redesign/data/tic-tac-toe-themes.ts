export interface TicTacToeThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const TIC_TAC_TOE_THEMES: TicTacToeThemeMeta[] = [
  {
    id: 'classic',
    name: 'Classic',
    desc: 'Crisp black grid on paper white.',
    color: '#1f2937',
  },
  {
    id: 'neon',
    name: 'Neon',
    desc: 'Glowing violet and cyan marks.',
    color: '#a855f7',
  },
  {
    id: 'paper',
    name: 'Paper',
    desc: 'Handwritten on warm parchment.',
    color: '#92400e',
  },
  { id: 'pixel', name: 'Pixel', desc: 'Retro 8-bit greens.', color: '#22c55e' },
  {
    id: 'chalkboard',
    name: 'Chalkboard',
    desc: 'Loose chalk strokes on slate.',
    color: '#e5e7eb',
  },
  {
    id: 'retro',
    name: 'Retro TV',
    desc: 'Sunset amber and warm red.',
    color: '#f59e0b',
  },
];

export function findTicTacToeTheme(id: string | undefined): TicTacToeThemeMeta {
  return TIC_TAC_TOE_THEMES.find((t) => t.id === id) ?? TIC_TAC_TOE_THEMES[0];
}
