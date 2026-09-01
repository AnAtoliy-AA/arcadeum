import type { ThemeTokens } from './types';

export const neonDarkTokens: ThemeTokens = {
  name: 'neonDark',
  background: {
    base: '#06011b',
    radialStart: 'rgba(87, 195, 255, 0.35)',
    radialEnd: 'rgba(255, 106, 247, 0.35)',
  },
  text: {
    primary: '#f5f7ff',
    secondary: '#f7f8ff',
    muted: 'rgba(223, 230, 255, 0.75)',
    accent: '#81f1ff',
    accentSoft: 'rgba(223, 230, 255, 0.7)',
    onAccent: '#050316',
    notice: '#81f1ff',
  },
  surfaces: {
    hero: {
      background: 'rgba(6, 1, 27, 0.58)',
      border: 'rgba(245, 247, 255, 0.08)',
      shadow: '0 32px 80px rgba(5, 0, 40, 0.35)',
    },
    panel: {
      background: 'rgba(9, 4, 38, 0.68)',
      border: 'rgba(245, 247, 255, 0.08)',
      shadow: '0 22px 60px rgba(5, 0, 40, 0.32)',
    },
    card: {
      background: 'rgba(14, 10, 48, 0.9)',
      border: 'rgba(111, 127, 255, 0.25)',
      shadow: '0 16px 40px rgba(5, 0, 40, 0.28)',
    },
  },
  interactive: {
    option: {
      background: 'rgba(10, 7, 36, 0.4)',
      border: 'rgba(143, 155, 255, 0.35)',
      hoverBorder: 'rgba(163, 176, 255, 0.65)',
      activeBackground: 'rgba(15, 11, 46, 0.75)',
      activeBorder: 'rgba(143, 155, 255, 0.6)',
      activeShadow: '0 18px 56px rgba(87, 195, 255, 0.25)',
    },
    pill: {
      inactiveBackground: 'rgba(10, 7, 36, 0.25)',
      activeBackground: 'rgba(143, 155, 255, 0.25)',
      border: 'rgba(143, 155, 255, 0.35)',
      activeBorder: 'rgba(143, 155, 255, 0.6)',
      hoverBorder: 'rgba(163, 176, 255, 0.55)',
      activeShadow: '0 12px 32px rgba(87, 195, 255, 0.2)',
    },
    download: {
      background: 'rgba(15, 11, 46, 0.6)',
      hoverBackground: 'rgba(15, 11, 46, 0.72)',
      border: 'rgba(245, 247, 255, 0.28)',
      hoverBorder: 'rgba(210, 220, 255, 0.6)',
    },
  },
  buttons: {
    primary: {
      gradientStart: '#57c3ff',
      gradientEnd: '#8f9bff',
      text: '#000000',
      shadow: '0 12px 30px rgba(87, 195, 255, 0.35)',
      hoverShadow: '0 16px 36px rgba(87, 195, 255, 0.45)',
    },
    secondary: {
      background: 'rgba(15, 11, 46, 0.6)',
      hoverBackground: 'rgba(24, 19, 70, 0.72)',
      border: 'rgba(135, 152, 255, 0.45)',
      hoverBorder: 'rgba(163, 176, 255, 0.65)',
      text: '#9fb3ff',
    },
  },
  outlines: {
    focus: 'rgba(255, 255, 255, 0.9)',
  },
  account: {
    cardBackground: 'rgba(10, 7, 36, 0.35)',
    border: 'rgba(143, 155, 255, 0.35)',
  },
  glass: {
    background: 'rgba(6, 1, 27, 0.72)',
    border: 'rgba(245, 247, 255, 0.08)',
    borderStrong: 'rgba(245, 247, 255, 0.24)',
  },
  copyNotice: '#81f1ff',
};

export const neonLightTokens: ThemeTokens = {
  name: 'neonLight',
  background: {
    base: '#f8fafc',
    radialStart: 'rgba(87, 195, 255, 0.28)',
    radialEnd: 'rgba(255, 106, 247, 0.32)',
  },
  text: {
    primary: '#0f172a',
    secondary: '#1e293b',
    muted: 'rgba(51, 65, 85, 0.85)',
    accent: '#0891b2',
    accentSoft: '#06b6d4',
    onAccent: '#ffffff',
    notice: '#0891b2',
  },
  surfaces: {
    hero: {
      background: 'rgba(255, 255, 255, 0.92)',
      border: 'rgba(6, 182, 212, 0.3)',
      shadow: '0 28px 70px rgba(6, 182, 212, 0.12)',
    },
    panel: {
      background: 'rgba(255, 255, 255, 0.88)',
      border: 'rgba(6, 182, 212, 0.25)',
      shadow: '0 22px 60px rgba(6, 182, 212, 0.1)',
    },
    card: {
      background: 'rgba(240, 253, 250, 0.95)',
      border: 'rgba(6, 182, 212, 0.3)',
      shadow: '0 16px 40px rgba(6, 182, 212, 0.08)',
    },
  },
  interactive: {
    option: {
      background: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(6, 182, 212, 0.35)',
      hoverBorder: 'rgba(8, 145, 178, 0.55)',
      activeBackground: 'rgba(236, 254, 255, 0.95)',
      activeBorder: 'rgba(8, 145, 178, 0.65)',
      activeShadow: '0 18px 56px rgba(6, 182, 212, 0.2)',
    },
    pill: {
      inactiveBackground: 'rgba(241, 245, 249, 0.85)',
      activeBackground: 'rgba(207, 250, 254, 0.9)',
      border: 'rgba(6, 182, 212, 0.4)',
      activeBorder: 'rgba(8, 145, 178, 0.65)',
      hoverBorder: 'rgba(8, 145, 178, 0.5)',
      activeShadow: '0 12px 32px rgba(6, 182, 212, 0.18)',
    },
    download: {
      background: 'rgba(241, 245, 249, 0.9)',
      hoverBackground: 'rgba(207, 250, 254, 0.95)',
      border: 'rgba(6, 182, 212, 0.35)',
      hoverBorder: 'rgba(8, 145, 178, 0.55)',
    },
  },
  buttons: {
    primary: {
      gradientStart: '#0891b2',
      gradientEnd: '#06b6d4',
      text: '#ffffff',
      shadow: '0 12px 30px rgba(8, 145, 178, 0.3)',
      hoverShadow: '0 16px 36px rgba(8, 145, 178, 0.4)',
    },
    secondary: {
      background: 'rgba(8, 145, 178, 0.08)',
      hoverBackground: 'rgba(8, 145, 178, 0.15)',
      border: 'rgba(8, 145, 178, 0.3)',
      hoverBorder: 'rgba(8, 145, 178, 0.5)',
      text: '#0e7490',
    },
  },
  outlines: {
    focus: 'rgba(8, 145, 178, 0.8)',
  },
  account: {
    cardBackground: 'rgba(255, 255, 255, 0.92)',
    border: 'rgba(6, 182, 212, 0.35)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(6, 182, 212, 0.28)',
    borderStrong: 'rgba(8, 145, 178, 0.55)',
  },
  copyNotice: '#0891b2',
};
