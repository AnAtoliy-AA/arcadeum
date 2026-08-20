import type { TicTacToeVariant } from '../types';

export interface TicTacToeTheme {
  background: string;
  boardBackground: string;
  gridLine: string;
  cellBg: string;
  cellHoverBg: string;
  xColor: string;
  oColor: string;
  triangleColor: string;
  squareColor: string;
  winningCellBg: string;
  markFont: string;
  textColor: string;
  borderRadius: string;
}

const THEMES: Record<TicTacToeVariant, TicTacToeTheme> = {
  classic: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    boardBackground: '#ffffff',
    gridLine: '#1f2937',
    cellBg: '#ffffff',
    cellHoverBg: '#f1f5f9',
    xColor: '#dc2626',
    oColor: '#2563eb',
    triangleColor: '#16a34a',
    squareColor: '#7c3aed',
    winningCellBg: 'rgba(250, 204, 21, 0.45)',
    markFont: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    textColor: '#0f172a',
    borderRadius: '8px',
  },
  neon: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    boardBackground: 'rgba(15, 23, 42, 0.85)',
    gridLine: '#a855f7',
    cellBg: 'rgba(30, 27, 75, 0.6)',
    cellHoverBg: 'rgba(168, 85, 247, 0.18)',
    xColor: '#f0abfc',
    oColor: '#67e8f9',
    triangleColor: '#fde047',
    squareColor: '#fb7185',
    winningCellBg: 'rgba(253, 224, 71, 0.35)',
    markFont: "'Orbitron', system-ui, sans-serif",
    textColor: '#e0e7ff',
    borderRadius: '10px',
  },
  paper: {
    background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)',
    boardBackground: '#fffbeb',
    gridLine: '#92400e',
    cellBg: '#fffbeb',
    cellHoverBg: '#fef3c7',
    xColor: '#1e40af',
    oColor: '#dc2626',
    triangleColor: '#15803d',
    squareColor: '#7c2d12',
    winningCellBg: 'rgba(132, 204, 22, 0.35)',
    markFont: "'Caveat', 'Comic Sans MS', cursive",
    textColor: '#451a03',
    borderRadius: '4px',
  },
  pixel: {
    background: 'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
    boardBackground: '#0f172a',
    gridLine: '#22c55e',
    cellBg: '#0f172a',
    cellHoverBg: '#15803d',
    xColor: '#fde047',
    oColor: '#22d3ee',
    triangleColor: '#f97316',
    squareColor: '#e879f9',
    winningCellBg: 'rgba(253, 224, 71, 0.35)',
    markFont: "'Press Start 2P', monospace",
    textColor: '#bbf7d0',
    borderRadius: '0px',
  },
  chalkboard: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    boardBackground: '#1e293b',
    gridLine: '#e5e7eb',
    cellBg: '#1e293b',
    cellHoverBg: '#334155',
    xColor: '#fda4af',
    oColor: '#fde047',
    triangleColor: '#86efac',
    squareColor: '#c4b5fd',
    winningCellBg: 'rgba(253, 224, 71, 0.25)',
    markFont: "'Caveat', cursive",
    textColor: '#f1f5f9',
    borderRadius: '6px',
  },
  retro: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fecaca 100%)',
    boardBackground: '#fff7ed',
    gridLine: '#9a3412',
    cellBg: '#fff7ed',
    cellHoverBg: '#fed7aa',
    xColor: '#b91c1c',
    oColor: '#1e40af',
    triangleColor: '#15803d',
    squareColor: '#7c2d12',
    winningCellBg: 'rgba(251, 191, 36, 0.45)',
    markFont: "'Courier New', monospace",
    textColor: '#7c2d12',
    borderRadius: '4px',
  },
};

export function getTicTacToeTheme(variant?: string): TicTacToeTheme {
  if (variant && variant in THEMES) {
    return THEMES[variant as TicTacToeVariant];
  }
  return THEMES.classic;
}
