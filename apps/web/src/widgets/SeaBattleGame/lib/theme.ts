import { SeaBattleVariant } from './constants';

export interface SeaBattleTheme {
  gameBackground: string;
  boardBackground: string;
  gridColor: string;
  cellBorder: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderRadius: string;
  borderWidth?: string;
  shipColor: string;
  hitColor: string;
  missColor: string;
  fontFamily?: string;
  cellEmpty: string;
  cellHover: string;
  boxShadow?: string;
}

export const VARIANT_THEMES: Record<SeaBattleVariant, SeaBattleTheme> = {
  classic: {
    gameBackground: 'linear-gradient(135deg, #0a0f1a 0%, #1a2233 100%)',
    boardBackground: 'rgba(0, 0, 0, 0.5)',
    gridColor: 'rgba(255, 255, 255, 0.1)',
    cellBorder: 'rgba(255, 255, 255, 0.1)',
    primaryColor: '#3498db',
    accentColor: '#1abc9c',
    textColor: '#ffffff',
    textSecondaryColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '8px',
    shipColor: '#666',
    hitColor: '#ff4444',
    missColor: '#ffffff',
    cellEmpty: 'rgba(255, 255, 255, 0.05)',
    cellHover: 'rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  modern: {
    gameBackground: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    boardBackground: 'rgba(15, 23, 42, 0.9)',
    gridColor: 'rgba(56, 189, 248, 0.2)',
    cellBorder: 'rgba(56, 189, 248, 0.3)',
    primaryColor: '#38bdf8',
    accentColor: '#818cf8',
    textColor: '#f8fafc',
    textSecondaryColor: '#94a3b8',
    borderRadius: '4px',
    shipColor: '#0ea5e9',
    hitColor: '#ef4444',
    missColor: 'rgba(56, 189, 248, 0.3)',
    cellEmpty: 'rgba(15, 23, 42, 0.5)',
    cellHover: 'rgba(56, 189, 248, 0.2)',
    fontFamily: '"Orbitron", sans-serif',
    boxShadow:
      '0 0 15px rgba(56, 189, 248, 0.2), inset 0 0 10px rgba(56, 189, 248, 0.05)',
  },
  pixel: {
    gameBackground: 'linear-gradient(135deg, #2d0055 0%, #5500aa 100%)',
    boardBackground: '#000000',
    gridColor: '#00ff00',
    cellBorder: '#00ff00',
    primaryColor: '#00ff00',
    accentColor: '#ff00ff',
    textColor: '#00ff00',
    textSecondaryColor: '#00cc00',
    borderRadius: '0px',
    borderWidth: '2px',
    shipColor: '#ffffff',
    hitColor: '#ff0000',
    missColor: '#ffff00',
    cellEmpty: '#111111',
    cellHover: '#333333',
    fontFamily: '"Press Start 2P", monospace',
    boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.5)',
  },
  cartoon: {
    gameBackground: 'linear-gradient(135deg, #87CEEB 0%, #E0F7FA 100%)',
    boardBackground: 'rgba(255, 255, 255, 0.9)',
    gridColor: 'rgba(0, 0, 0, 0.1)',
    cellBorder: 'rgba(0, 0, 0, 0.05)',
    primaryColor: '#FF6B6B',
    accentColor: '#4ECDC4',
    textColor: '#2C3E50',
    textSecondaryColor: '#555555',
    borderRadius: '20px',
    shipColor: '#FFD93D',
    hitColor: '#FF6B6B',
    missColor: '#4ECDC4',
    cellEmpty: 'rgba(236, 240, 241, 0.5)',
    cellHover: 'rgba(255, 209, 220, 0.5)',
    fontFamily: '"Comic Neue", cursive',
    boxShadow: '0 8px 0 rgba(0,0,0,0.1)',
  },
};

export const getTheme = (variant: string = 'classic'): SeaBattleTheme => {
  return VARIANT_THEMES[variant as SeaBattleVariant] || VARIANT_THEMES.classic;
};
