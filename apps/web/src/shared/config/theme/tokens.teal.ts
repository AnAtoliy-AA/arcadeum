import type { ThemeTokens } from './types';

export const tealDarkTokens: ThemeTokens = {
  name: 'tealDark',
  background: {
    base: '#040f0f',
    radialStart: 'rgba(13,148,136,0.22)',
    radialEnd: 'rgba(6,182,212,0.18)',
  },
  text: {
    primary: '#f0fdfa',
    secondary: '#ccfbf1',
    muted: 'rgba(94,234,212,0.7)',
    accent: '#2dd4bf',
    accentSoft: '#5eead4',
    onAccent: '#022c22',
    notice: '#2dd4bf',
  },
  surfaces: {
    hero: {
      background: 'rgba(4,18,18,0.7)',
      border: 'rgba(45,212,191,0.18)',
      shadow: '0 32px 80px rgba(0,20,20,0.5)',
    },
    panel: {
      background: 'rgba(5,20,20,0.75)',
      border: 'rgba(45,212,191,0.15)',
      shadow: '0 22px 60px rgba(0,20,20,0.4)',
    },
    card: {
      background: 'rgba(8,28,28,0.88)',
      border: 'rgba(13,148,136,0.3)',
      shadow: '0 16px 40px rgba(0,20,20,0.35)',
    },
  },
  interactive: {
    option: {
      background: 'rgba(8,28,28,0.5)',
      border: 'rgba(13,148,136,0.3)',
      hoverBorder: 'rgba(45,212,191,0.55)',
      activeBackground: 'rgba(10,34,34,0.75)',
      activeBorder: 'rgba(45,212,191,0.6)',
      activeShadow: '0 18px 56px rgba(13,148,136,0.25)',
    },
    pill: {
      inactiveBackground: 'rgba(8,28,28,0.3)',
      activeBackground: 'rgba(13,148,136,0.22)',
      border: 'rgba(13,148,136,0.3)',
      activeBorder: 'rgba(45,212,191,0.6)',
      hoverBorder: 'rgba(45,212,191,0.5)',
      activeShadow: '0 12px 32px rgba(13,148,136,0.2)',
    },
    download: {
      background: 'rgba(8,28,28,0.6)',
      hoverBackground: 'rgba(10,34,34,0.72)',
      border: 'rgba(45,212,191,0.26)',
      hoverBorder: 'rgba(94,234,212,0.45)',
    },
  },
  buttons: {
    primary: {
      gradientStart: '#0d9488',
      gradientEnd: '#2dd4bf',
      text: '#000000',
      shadow: '0 12px 30px rgba(13,148,136,0.4)',
      hoverShadow: '0 16px 36px rgba(13,148,136,0.5)',
    },
    secondary: {
      background: 'rgba(13,148,136,0.1)',
      hoverBackground: 'rgba(13,148,136,0.18)',
      border: 'rgba(45,212,191,0.28)',
      hoverBorder: 'rgba(94,234,212,0.45)',
      text: '#5eead4',
    },
  },
  outlines: { focus: 'rgba(45,212,191,0.8)' },
  account: {
    cardBackground: 'rgba(5,20,20,0.65)',
    border: 'rgba(13,148,136,0.3)',
  },
  glass: {
    background: 'rgba(4, 15, 15, 0.72)',
    border: 'rgba(45, 212, 191, 0.12)',
  },
  copyNotice: '#2dd4bf',
};

export const tealLightTokens: ThemeTokens = {
  name: 'tealLight',
  background: {
    base: '#f0fdfa',
    radialStart: 'rgba(13,148,136,0.18)',
    radialEnd: 'rgba(6,182,212,0.14)',
  },
  text: {
    primary: '#042f2e',
    secondary: '#134e4a',
    muted: 'rgba(15,118,110,0.65)',
    accent: '#0d9488',
    accentSoft: '#0891b2',
    onAccent: '#f0fdfa',
    notice: '#0d9488',
  },
  surfaces: {
    hero: {
      background: 'rgba(255,255,255,0.92)',
      border: 'rgba(45,212,191,0.32)',
      shadow: '0 28px 70px rgba(13,148,136,0.1)',
    },
    panel: {
      background: 'rgba(255,255,255,0.88)',
      border: 'rgba(45,212,191,0.26)',
      shadow: '0 22px 60px rgba(13,148,136,0.1)',
    },
    card: {
      background: 'rgba(240,253,250,0.95)',
      border: 'rgba(94,234,212,0.45)',
      shadow: '0 16px 40px rgba(13,148,136,0.08)',
    },
  },
  interactive: {
    option: {
      background: 'rgba(255,255,255,0.85)',
      border: 'rgba(94,234,212,0.55)',
      hoverBorder: 'rgba(13,148,136,0.5)',
      activeBackground: 'rgba(240,253,250,0.95)',
      activeBorder: 'rgba(13,148,136,0.6)',
      activeShadow: '0 18px 40px rgba(13,148,136,0.18)',
    },
    pill: {
      inactiveBackground: 'rgba(240,253,250,0.8)',
      activeBackground: 'rgba(13,148,136,0.12)',
      border: 'rgba(94,234,212,0.5)',
      activeBorder: 'rgba(13,148,136,0.55)',
      hoverBorder: 'rgba(13,148,136,0.4)',
      activeShadow: '0 12px 28px rgba(13,148,136,0.15)',
    },
    download: {
      background: 'rgba(240,253,250,0.9)',
      hoverBackground: 'rgba(204,251,241,0.95)',
      border: 'rgba(94,234,212,0.45)',
      hoverBorder: 'rgba(13,148,136,0.4)',
    },
  },
  buttons: {
    primary: {
      gradientStart: '#0d9488',
      gradientEnd: '#2dd4bf',
      text: '#fff',
      shadow: '0 12px 30px rgba(13,148,136,0.3)',
      hoverShadow: '0 16px 36px rgba(13,148,136,0.4)',
    },
    secondary: {
      background: 'rgba(13,148,136,0.08)',
      hoverBackground: 'rgba(13,148,136,0.14)',
      border: 'rgba(13,148,136,0.2)',
      hoverBorder: 'rgba(13,148,136,0.38)',
      text: '#042f2e',
    },
  },
  outlines: { focus: 'rgba(13,148,136,0.7)' },
  account: {
    cardBackground: 'rgba(255,255,255,0.92)',
    border: 'rgba(94,234,212,0.4)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.72)',
    border: 'rgba(45, 212, 191, 0.15)',
  },
  copyNotice: '#0d9488',
};
