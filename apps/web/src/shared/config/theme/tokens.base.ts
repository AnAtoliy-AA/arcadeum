import type { ThemeTokens } from './types';

export const lightTokens: ThemeTokens = {
  name: 'light',
  background: {
    base: '#f8fafc',
    radialStart: 'rgba(96, 165, 250, 0.22)',
    radialEnd: 'rgba(129, 140, 248, 0.18)',
  },
  text: {
    primary: '#0f172a',
    secondary: '#1f2937',
    muted: 'rgba(71, 85, 105, 0.85)',
    accent: '#2563eb',
    accentSoft: '#4f46e5',
    onAccent: '#f8fafc',
    notice: '#1d4ed8',
  },
  surfaces: {
    hero: {
      background: 'rgba(255, 255, 255, 0.95)',
      border: 'rgba(148, 163, 184, 0.35)',
      shadow: '0 28px 70px rgba(148, 163, 184, 0.22)',
    },
    panel: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: 'rgba(148, 163, 184, 0.3)',
      shadow: '0 22px 60px rgba(148, 163, 184, 0.25)',
    },
    card: {
      background: 'rgba(248, 250, 252, 0.95)',
      border: 'rgba(203, 213, 225, 0.75)',
      shadow: '0 18px 40px rgba(148, 163, 184, 0.2)',
    },
  },
  interactive: {
    option: {
      background: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(203, 213, 225, 0.8)',
      hoverBorder: 'rgba(99, 102, 241, 0.55)',
      activeBackground: 'rgba(224, 242, 254, 0.95)',
      activeBorder: 'rgba(59, 130, 246, 0.65)',
      activeShadow: '0 18px 40px rgba(96, 165, 250, 0.25)',
    },
    pill: {
      inactiveBackground: 'rgba(241, 245, 249, 0.9)',
      activeBackground: 'rgba(224, 242, 254, 0.95)',
      border: 'rgba(203, 213, 225, 0.8)',
      activeBorder: 'rgba(59, 130, 246, 0.65)',
      hoverBorder: 'rgba(79, 70, 229, 0.45)',
      activeShadow: '0 12px 28px rgba(96, 165, 250, 0.2)',
    },
    download: {
      background: 'rgba(241, 245, 249, 0.95)',
      hoverBackground: 'rgba(224, 242, 254, 0.95)',
      border: 'rgba(203, 213, 225, 0.7)',
      hoverBorder: 'rgba(96, 165, 250, 0.45)',
    },
  },
  buttons: {
    primary: {
      gradientStart: '#2563eb',
      gradientEnd: '#38bdf8',
      text: '#f8fafc',
      shadow: '0 12px 30px rgba(37, 99, 235, 0.25)',
      hoverShadow: '0 16px 36px rgba(37, 99, 235, 0.35)',
    },
    secondary: {
      background: 'rgba(37, 99, 235, 0.08)',
      hoverBackground: 'rgba(59, 130, 246, 0.12)',
      border: 'rgba(37, 99, 235, 0.18)',
      hoverBorder: 'rgba(37, 99, 235, 0.35)',
      text: '#1d4ed8',
    },
  },
  outlines: {
    focus: 'rgba(37, 99, 235, 0.75)',
  },
  account: {
    cardBackground: 'rgba(255, 255, 255, 0.95)',
    border: 'rgba(148, 163, 184, 0.45)',
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.72)',
    border: 'rgba(0, 0, 0, 0.05)',
  },
  copyNotice: '#2563eb',
};

export const darkTokens: ThemeTokens = {
  name: 'dark',
  background: {
    base: '#151718',
    radialStart: 'rgba(59, 130, 246, 0.18)',
    radialEnd: 'rgba(126, 58, 242, 0.16)',
  },
  text: {
    primary: '#ecefee',
    secondary: '#f3f4f5',
    muted: '#9ba1a6',
    accent: '#38bdf8',
    accentSoft: '#c084fc',
    onAccent: '#0f172a',
    notice: '#38bdf8',
  },
  surfaces: {
    hero: {
      background: 'rgba(24, 24, 28, 0.72)',
      border: 'rgba(50, 53, 61, 0.65)',
      shadow: '0 28px 72px rgba(2, 6, 23, 0.45)',
    },
    panel: {
      background: 'rgba(22, 24, 28, 0.78)',
      border: 'rgba(51, 65, 85, 0.55)',
      shadow: '0 22px 60px rgba(15, 23, 42, 0.4)',
    },
    card: {
      background: 'rgba(31, 34, 40, 0.88)',
      border: 'rgba(68, 72, 80, 0.45)',
      shadow: '0 16px 40px rgba(15, 23, 42, 0.35)',
    },
  },
  interactive: {
    option: {
      background: 'rgba(31, 34, 40, 0.6)',
      border: 'rgba(68, 72, 80, 0.55)',
      hoverBorder: 'rgba(96, 165, 250, 0.55)',
      activeBackground: 'rgba(28, 31, 38, 0.8)',
      activeBorder: 'rgba(96, 165, 250, 0.65)',
      activeShadow: '0 18px 40px rgba(59, 130, 246, 0.25)',
    },
    pill: {
      inactiveBackground: 'rgba(31, 34, 40, 0.45)',
      activeBackground: 'rgba(59, 130, 246, 0.2)',
      border: 'rgba(68, 72, 80, 0.55)',
      activeBorder: 'rgba(96, 165, 250, 0.65)',
      hoverBorder: 'rgba(96, 165, 250, 0.55)',
      activeShadow: '0 12px 32px rgba(59, 130, 246, 0.22)',
    },
    download: {
      background: 'rgba(31, 34, 40, 0.65)',
      hoverBackground: 'rgba(28, 31, 38, 0.75)',
      border: 'rgba(96, 165, 250, 0.25)',
      hoverBorder: 'rgba(96, 165, 250, 0.45)',
    },
  },
  buttons: {
    primary: {
      gradientStart: '#38bdf8',
      gradientEnd: '#2563eb',
      text: '#0f172a',
      shadow: '0 12px 30px rgba(56, 189, 248, 0.25)',
      hoverShadow: '0 16px 36px rgba(56, 189, 248, 0.35)',
    },
    secondary: {
      background: 'rgba(56, 189, 248, 0.12)',
      hoverBackground: 'rgba(56, 189, 248, 0.18)',
      border: 'rgba(56, 189, 248, 0.35)',
      hoverBorder: 'rgba(56, 189, 248, 0.55)',
      text: '#38bdf8',
    },
  },
  outlines: {
    focus: 'rgba(56, 189, 248, 0.75)',
  },
  account: {
    cardBackground: 'rgba(24, 24, 28, 0.65)',
    border: 'rgba(51, 65, 85, 0.6)',
  },
  glass: {
    background: 'rgba(15, 17, 18, 0.72)',
    border: 'rgba(255, 255, 255, 0.08)',
  },
  copyNotice: '#38bdf8',
};
