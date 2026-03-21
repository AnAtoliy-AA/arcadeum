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
      text: '#050316',
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
  copyNotice: '#81f1ff',
};

export const neonLightTokens: ThemeTokens = {
  name: 'neonLight',
  background: {
    base: '#06011b',
    radialStart: 'rgba(87, 195, 255, 0.28)',
    radialEnd: 'rgba(255, 106, 247, 0.32)',
  },
  text: {
    primary: '#f5f7ff',
    secondary: '#f7f8ff',
    muted: 'rgba(219, 230, 255, 0.75)',
    accent: '#54e4ff',
    accentSoft: '#9aa6ff',
    onAccent: '#05020f',
    notice: '#54e4ff',
  },
  surfaces: {
    hero: {
      background: 'rgba(18, 4, 46, 0.9)',
      border: 'rgba(102, 69, 182, 0.6)',
      shadow: '0 32px 80px rgba(8, 5, 24, 0.65)',
    },
    panel: {
      background: 'rgba(22, 10, 55, 0.82)',
      border: 'rgba(102, 69, 182, 0.6)',
      shadow: '0 22px 60px rgba(8, 5, 24, 0.55)',
    },
    card: {
      background: 'rgba(28, 11, 66, 0.88)',
      border: 'rgba(102, 69, 182, 0.6)',
      shadow: '0 16px 40px rgba(8, 5, 24, 0.5)',
    },
  },
  interactive: {
    option: {
      background: 'rgba(16, 5, 42, 0.6)',
      border: 'rgba(102, 69, 182, 0.55)',
      hoverBorder: 'rgba(120, 82, 216, 0.75)',
      activeBackground: 'rgba(28, 11, 66, 0.88)',
      activeBorder: 'rgba(120, 82, 216, 0.8)',
      activeShadow: '0 18px 56px rgba(87, 195, 255, 0.25)',
    },
    pill: {
      inactiveBackground: 'rgba(16, 5, 42, 0.5)',
      activeBackground: 'rgba(87, 195, 255, 0.22)',
      border: 'rgba(102, 69, 182, 0.55)',
      activeBorder: 'rgba(120, 82, 216, 0.78)',
      hoverBorder: 'rgba(120, 82, 216, 0.7)',
      activeShadow: '0 12px 32px rgba(87, 195, 255, 0.22)',
    },
    download: {
      background: 'rgba(22, 10, 55, 0.72)',
      hoverBackground: 'rgba(28, 11, 66, 0.82)',
      border: 'rgba(102, 69, 182, 0.6)',
      hoverBorder: 'rgba(120, 82, 216, 0.75)',
    },
  },
  buttons: {
    primary: {
      gradientStart: '#57c3ff',
      gradientEnd: '#ff6af7',
      text: '#05020f',
      shadow: '0 12px 30px rgba(87, 195, 255, 0.35)',
      hoverShadow: '0 16px 36px rgba(87, 195, 255, 0.45)',
    },
    secondary: {
      background: 'rgba(28, 11, 66, 0.88)',
      hoverBackground: 'rgba(30, 13, 70, 0.92)',
      border: '#6847d6',
      hoverBorder: '#7a4df1',
      text: '#f5f7ff',
    },
  },
  outlines: {
    focus: 'rgba(255, 255, 255, 0.88)',
  },
  account: {
    cardBackground: 'rgba(22, 10, 55, 0.72)',
    border: 'rgba(102, 69, 182, 0.6)',
  },
  copyNotice: '#54e4ff',
};
