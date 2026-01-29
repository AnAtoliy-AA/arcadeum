export type ThemeName = 'light' | 'dark' | 'neonLight' | 'neonDark';

export type ThemePreference = ThemeName | 'system';

export type SurfaceToken = {
  background: string;
  border: string;
  shadow: string;
};

export type OptionToken = {
  background: string;
  border: string;
  hoverBorder: string;
  activeBackground: string;
  activeBorder: string;
  activeShadow: string;
};

export type PillToken = {
  inactiveBackground: string;
  activeBackground: string;
  border: string;
  activeBorder: string;
  hoverBorder: string;
  activeShadow: string;
};

export type DownloadToken = {
  background: string;
  hoverBackground: string;
  border: string;
  hoverBorder: string;
};

export type PrimaryButtonToken = {
  gradientStart: string;
  gradientEnd: string;
  text: string;
  shadow: string;
  hoverShadow: string;
};

export type SecondaryButtonToken = {
  background: string;
  hoverBackground: string;
  border: string;
  hoverBorder: string;
  text: string;
};

export type ThemeTokens = {
  name: ThemeName;
  background: {
    base: string;
    radialStart: string;
    radialEnd: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    accent: string;
    accentSoft: string;
    onAccent: string;
    notice: string;
  };
  surfaces: {
    hero: SurfaceToken;
    panel: SurfaceToken;
    card: SurfaceToken;
  };
  interactive: {
    option: OptionToken;
    pill: PillToken;
    download: DownloadToken;
  };
  buttons: {
    primary: PrimaryButtonToken;
    secondary: SecondaryButtonToken;
  };
  outlines: {
    focus: string;
  };
  account: {
    cardBackground: string;
    border: string;
  };
  copyNotice: string;
};

const neonDarkTokens: ThemeTokens = {
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

const neonLightTokens: ThemeTokens = {
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

const lightTokens: ThemeTokens = {
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
  copyNotice: '#2563eb',
};

const darkTokens: ThemeTokens = {
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
  copyNotice: '#38bdf8',
};

export const DEFAULT_THEME_NAME: ThemeName = 'neonDark';

export const themeTokens: Record<ThemeName, ThemeTokens> = {
  light: lightTokens,
  dark: darkTokens,
  neonLight: neonLightTokens,
  neonDark: neonDarkTokens,
};

export function getThemeTokens(theme: ThemeName): ThemeTokens {
  return themeTokens[theme] || themeTokens[DEFAULT_THEME_NAME];
}

export function isThemeName(value: unknown): value is ThemeName {
  return (
    value === 'light' ||
    value === 'dark' ||
    value === 'neonLight' ||
    value === 'neonDark'
  );
}

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || isThemeName(value);
}

export const THEME_OPTIONS: ThemePreference[] = [
  'system',
  'light',
  'dark',
  'neonLight',
  'neonDark',
];
