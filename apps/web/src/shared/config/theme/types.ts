export type ThemeName =
  | 'light'
  | 'dark'
  | 'neonLight'
  | 'neonDark'
  | 'violetDark'
  | 'violetLight'
  | 'tealDark'
  | 'tealLight';

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
  glass: {
    background: string;
    border: string;
  };
  copyNotice: string;
};
