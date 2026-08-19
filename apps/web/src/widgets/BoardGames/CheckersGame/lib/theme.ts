import type { CheckersVariant } from '../types';

export interface CheckersTheme {
  background: string;
  boardBackground: string;
  lightSquare: string;
  darkSquare: string;
  lightPiece: string;
  lightPieceBorder: string;
  darkPiece: string;
  darkPieceBorder: string;
  selectedPiece: string;
  validMoveIndicator: string;
  captureIndicator: string;
  kingCrown: string;
  textColor: string;
  borderRadius: string;
}

const THEMES: Record<CheckersVariant, CheckersTheme> = {
  classic: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    boardBackground: '#ffffff',
    lightSquare: '#f5f5f4',
    darkSquare: '#57534e',
    lightPiece: '#fafaf9',
    lightPieceBorder: '#a8a29e',
    darkPiece: '#292524',
    darkPieceBorder: '#1c1917',
    selectedPiece: 'rgba(250, 204, 21, 0.6)',
    validMoveIndicator: 'rgba(34, 197, 94, 0.4)',
    captureIndicator: 'rgba(239, 68, 68, 0.4)',
    kingCrown: '#fbbf24',
    textColor: '#0f172a',
    borderRadius: '8px',
  },
  neon: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    boardBackground: 'rgba(15, 23, 42, 0.85)',
    lightSquare: '#1e293b',
    darkSquare: '#4c1d95',
    lightPiece: '#e0e7ff',
    lightPieceBorder: '#a5b4fc',
    darkPiece: '#312e81',
    darkPieceBorder: '#4338ca',
    selectedPiece: 'rgba(253, 224, 71, 0.4)',
    validMoveIndicator: 'rgba(34, 197, 94, 0.35)',
    captureIndicator: 'rgba(239, 68, 68, 0.35)',
    kingCrown: '#fde047',
    textColor: '#e0e7ff',
    borderRadius: '10px',
  },
  wood: {
    background: 'linear-gradient(135deg, #451a03 0%, #78350f 100%)',
    boardBackground: '#92400e',
    lightSquare: '#d4a574',
    darkSquare: '#92400e',
    lightPiece: '#fef3c7',
    lightPieceBorder: '#d97706',
    darkPiece: '#451a03',
    darkPieceBorder: '#78350f',
    selectedPiece: 'rgba(250, 204, 21, 0.5)',
    validMoveIndicator: 'rgba(34, 197, 94, 0.4)',
    captureIndicator: 'rgba(239, 68, 68, 0.4)',
    kingCrown: '#f59e0b',
    textColor: '#fef3c7',
    borderRadius: '6px',
  },
  marble: {
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    boardBackground: '#ffffff',
    lightSquare: '#f1f5f9',
    darkSquare: '#64748b',
    lightPiece: '#ffffff',
    lightPieceBorder: '#94a3b8',
    darkPiece: '#334155',
    darkPieceBorder: '#1e293b',
    selectedPiece: 'rgba(250, 204, 21, 0.45)',
    validMoveIndicator: 'rgba(34, 197, 94, 0.35)',
    captureIndicator: 'rgba(239, 68, 68, 0.35)',
    kingCrown: '#eab308',
    textColor: '#0f172a',
    borderRadius: '8px',
  },
  neon_glow: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    boardBackground: 'rgba(30, 27, 75, 0.7)',
    lightSquare: '#1e1b4b',
    darkSquare: '#312e81',
    lightPiece: '#c4b5fd',
    lightPieceBorder: '#a78bfa',
    darkPiece: '#3b0764',
    darkPieceBorder: '#6b21a8',
    selectedPiece: 'rgba(253, 224, 71, 0.35)',
    validMoveIndicator: 'rgba(34, 197, 94, 0.3)',
    captureIndicator: 'rgba(239, 68, 68, 0.3)',
    kingCrown: '#fde047',
    textColor: '#e0e7ff',
    borderRadius: '10px',
  },
};

export function getCheckersTheme(variant?: string): CheckersTheme {
  if (variant && variant in THEMES) {
    return THEMES[variant as CheckersVariant];
  }
  return THEMES.classic;
}
