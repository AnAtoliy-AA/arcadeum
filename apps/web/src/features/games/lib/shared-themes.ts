import { SHARED_THEMES } from './shared-themes-data';

export interface ThemeColors {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  glow: string;
  border: string;
  muted: string;
  highlight: string;
  teamPalette: readonly string[];
  playerPalette: readonly string[];
}

export interface GameTheme {
  id: string;
  nameKey: string;
  descriptionKey: string;
  emoji: string;
  gradient: string;
  bgImage?: string;
  colors: ThemeColors;
}

export { SHARED_THEMES };

const THEME_INDEX = new Map<string, GameTheme>(
  SHARED_THEMES.map((t) => [t.id, t]),
);

export function getThemeById(themeId: string): GameTheme | undefined {
  return THEME_INDEX.get(themeId);
}

export function getTranslatedSharedThemes(
  themeMessages?: Record<
    string,
    { name?: string; description?: string } | undefined
  >,
): Array<{ id: string; name: string; description?: string }> {
  return SHARED_THEMES.filter((t) => t.id !== 'random').map((t) => {
    const msg = themeMessages?.[t.id];
    const defaultName =
      t.id.charAt(0).toUpperCase() + t.id.slice(1).replace(/-/g, ' ');
    return {
      id: t.id,
      name: msg?.name ?? defaultName,
      description: msg?.description,
    };
  });
}
