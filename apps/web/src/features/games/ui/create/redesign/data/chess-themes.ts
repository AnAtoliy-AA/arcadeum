export interface ChessThemeMeta {
  id: string;
  name: string;
  desc: string;
  color: string;
}

export const CHESS_THEMES: ChessThemeMeta[] = [
  {
    id: 'standard',
    name: 'Standard',
    desc: 'Classic chess with the traditional starting position.',
    color: '#e2e8f0',
  },
  {
    id: 'chess960',
    name: 'Chess960',
    desc: 'Randomized starting position with 960 possible setups.',
    color: '#93c5fd',
  },
];

export function findChessTheme(id: string | undefined): ChessThemeMeta {
  return CHESS_THEMES.find((t) => t.id === id) ?? CHESS_THEMES[0];
}
