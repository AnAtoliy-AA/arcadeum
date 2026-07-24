import type { CatDashVariant } from '../types';

export interface CatDashThemeTokens {
  background: string;
  track: string;
  trackBorder: string;
  normalSpace: string;
  obstacleSpace: string;
  bonusSpace: string;
  forkSpace: string;
  player: string;
  playerBorder: string;
  dice: string;
  diceBorder: string;
  text: string;
  textSecondary: string;
}

const themeMap: Record<CatDashVariant, CatDashThemeTokens> = {
  neon: {
    background: '#0f0f23',
    track: '#1a1a3e',
    trackBorder: '#7c3aed',
    normalSpace: '#2d2d5e',
    obstacleSpace: '#dc2626',
    bonusSpace: '#f59e0b',
    forkSpace: '#06b6d4',
    player: '#a855f7',
    playerBorder: '#c084fc',
    dice: '#7c3aed',
    diceBorder: '#a78bfa',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
  },
  village: {
    background: '#fef3c7',
    track: '#fde68a',
    trackBorder: '#d97706',
    normalSpace: '#fbbf24',
    obstacleSpace: '#dc2626',
    bonusSpace: '#059669',
    forkSpace: '#0284c7',
    player: '#b45309',
    playerBorder: '#d97706',
    dice: '#92400e',
    diceBorder: '#b45309',
    text: '#1c1917',
    textSecondary: '#57534e',
  },
  space: {
    background: '#0f172a',
    track: '#1e293b',
    trackBorder: '#6366f1',
    normalSpace: '#334155',
    obstacleSpace: '#dc2626',
    bonusSpace: '#f59e0b',
    forkSpace: '#8b5cf6',
    player: '#6366f1',
    playerBorder: '#818cf8',
    dice: '#4f46e5',
    diceBorder: '#6366f1',
    text: '#f8fafc',
    textSecondary: '#94a3b8',
  },
  nature: {
    background: '#ecfdf5',
    track: '#d1fae5',
    trackBorder: '#059669',
    normalSpace: '#a7f3d0',
    obstacleSpace: '#dc2626',
    bonusSpace: '#f59e0b',
    forkSpace: '#0284c7',
    player: '#059669',
    playerBorder: '#10b981',
    dice: '#047857',
    diceBorder: '#059669',
    text: '#064e3b',
    textSecondary: '#047857',
  },
};

export function getTheme(variant: CatDashVariant): CatDashThemeTokens {
  return themeMap[variant] ?? themeMap.neon;
}
