import type { ThemeTokens } from './types';

export const violetDarkTokens: ThemeTokens = {
  name: 'violetDark',
  background: {
    base: '#080510',
    radialStart: 'rgba(139,92,246,0.25)',
    radialEnd: 'rgba(99,102,241,0.2)',
  },
  text: {
    primary: '#f5f3ff',
    secondary: '#ede9fe',
    muted: 'rgba(196,181,253,0.7)',
    accent: '#c4b5fd',
    accentSoft: '#a78bfa',
    onAccent: '#1e1b4b',
    notice: '#c4b5fd',
  },
  surfaces: {
    hero: {
      background: 'rgba(10,6,28,0.7)',
      border: 'rgba(167,139,250,0.18)',
      shadow: '0 32px 80px rgba(5,0,30,0.5)',
    },
    panel: {
      background: 'rgba(12,7,32,0.75)',
      border: 'rgba(167,139,250,0.15)',
      shadow: '0 22px 60px rgba(5,0,30,0.4)',
    },
    card: {
      background: 'rgba(18,10,46,0.88)',
      border: 'rgba(139,92,246,0.28)',
      shadow: '0 16px 40px rgba(5,0,30,0.35)',
    },
  },
  interactive: {
    option: {
      background: 'rgba(18,10,46,0.5)',
      border: 'rgba(139,92,246,0.3)',
      hoverBorder: 'rgba(167,139,250,0.55)',
      activeBackground: 'rgba(24,14,58,0.75)',
      activeBorder: 'rgba(167,139,250,0.6)',
      activeShadow: '0 18px 56px rgba(109,40,217,0.25)',
    },
    pill: {
      inactiveBackground: 'rgba(18,10,46,0.3)',
      activeBackground: 'rgba(139,92,246,0.22)',
      border: 'rgba(139,92,246,0.3)',
      activeBorder: 'rgba(167,139,250,0.6)',
      hoverBorder: 'rgba(167,139,250,0.5)',
      activeShadow: '0 12px 32px rgba(109,40,217,0.2)',
    },
    download: {
      background: 'rgba(18,10,46,0.6)',
      hoverBackground: 'rgba(24,14,58,0.72)',
      border: 'rgba(167,139,250,0.28)',
      hoverBorder: 'rgba(196,181,253,0.5)',
    },
  },
  buttons: {
    primary: {
      gradientStart: '#6d28d9',
      gradientEnd: '#a78bfa',
      text: '#fff',
      shadow: '0 12px 30px rgba(109,40,217,0.45)',
      hoverShadow: '0 16px 36px rgba(109,40,217,0.55)',
    },
    secondary: {
      background: 'rgba(139,92,246,0.1)',
      hoverBackground: 'rgba(139,92,246,0.18)',
      border: 'rgba(167,139,250,0.3)',
      hoverBorder: 'rgba(196,181,253,0.5)',
      text: '#c4b5fd',
    },
  },
  outlines: { focus: 'rgba(196,181,253,0.8)' },
  account: {
    cardBackground: 'rgba(12,7,32,0.65)',
    border: 'rgba(139,92,246,0.28)',
  },
  glass: {
    background: 'rgba(13, 10, 24, 0.72)',
    border: 'rgba(167, 139, 250, 0.12)',
  },
  copyNotice: '#c4b5fd',
};

export const violetLightTokens: ThemeTokens = {
  name: 'violetLight',
  background: {
    base: '#faf5ff',
    radialStart: 'rgba(139,92,246,0.15)',
    radialEnd: 'rgba(99,102,241,0.12)',
  },
  text: {
    primary: '#1e1b4b',
    secondary: '#2e1d6b',
    muted: 'rgba(109,40,217,0.65)',
    accent: '#7c3aed',
    accentSoft: '#4f46e5',
    onAccent: '#faf5ff',
    notice: '#6d28d9',
  },
  surfaces: {
    hero: {
      background: 'rgba(255,255,255,0.92)',
      border: 'rgba(167,139,250,0.3)',
      shadow: '0 28px 70px rgba(109,40,217,0.1)',
    },
    panel: {
      background: 'rgba(255,255,255,0.88)',
      border: 'rgba(167,139,250,0.25)',
      shadow: '0 22px 60px rgba(109,40,217,0.1)',
    },
    card: {
      background: 'rgba(250,245,255,0.95)',
      border: 'rgba(196,181,253,0.5)',
      shadow: '0 16px 40px rgba(109,40,217,0.08)',
    },
  },
  interactive: {
    option: {
      background: 'rgba(255,255,255,0.85)',
      border: 'rgba(196,181,253,0.6)',
      hoverBorder: 'rgba(139,92,246,0.5)',
      activeBackground: 'rgba(245,240,255,0.95)',
      activeBorder: 'rgba(109,40,217,0.6)',
      activeShadow: '0 18px 40px rgba(109,40,217,0.18)',
    },
    pill: {
      inactiveBackground: 'rgba(245,240,255,0.8)',
      activeBackground: 'rgba(139,92,246,0.12)',
      border: 'rgba(196,181,253,0.55)',
      activeBorder: 'rgba(109,40,217,0.55)',
      hoverBorder: 'rgba(109,40,217,0.4)',
      activeShadow: '0 12px 28px rgba(109,40,217,0.15)',
    },
    download: {
      background: 'rgba(245,240,255,0.9)',
      hoverBackground: 'rgba(237,233,254,0.95)',
      border: 'rgba(196,181,253,0.5)',
      hoverBorder: 'rgba(139,92,246,0.4)',
    },
  },
  buttons: {
    primary: {
      gradientStart: '#6d28d9',
      gradientEnd: '#8b5cf6',
      text: '#fff',
      shadow: '0 12px 30px rgba(109,40,217,0.3)',
      hoverShadow: '0 16px 36px rgba(109,40,217,0.4)',
    },
    secondary: {
      background: 'rgba(109,40,217,0.08)',
      hoverBackground: 'rgba(109,40,217,0.14)',
      border: 'rgba(109,40,217,0.2)',
      hoverBorder: 'rgba(109,40,217,0.38)',
      text: '#6d28d9',
    },
  },
  outlines: { focus: 'rgba(109,40,217,0.7)' },
  account: {
    cardBackground: 'rgba(255,255,255,0.92)',
    border: 'rgba(196,181,253,0.45)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.72)',
    border: 'rgba(167, 139, 250, 0.15)',
  },
  copyNotice: '#6d28d9',
};
