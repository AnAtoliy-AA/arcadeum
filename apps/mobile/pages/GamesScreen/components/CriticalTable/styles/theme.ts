import type { Palette } from '@/hooks/useThemedStyles';

/**
 * Shared theme context for style modules.
 * Extracted from palette to avoid repetitive destructuring in each module.
 */
export interface StyleThemeContext {
  isLight: boolean;
  // Surfaces
  surface: string;
  raised: string;
  border: string;
  cardBorder: string;
  // Shadows
  shadow: string;
  overlayShadow: string;
  // Colors
  primaryBgColor: string;
  primaryTextColor: string;
  titleText: string;
  heroBadgeText: string;
  heroBadgeBackground: string;
  heroBadgeBorder: string;
  // Decorative
  decorPlay: string;
  decorCheck: string;
  decorAlert: string;
  // Glow
  heroGlowPrimary: string;
  heroGlowSecondary: string;
  roomGlow: string;
  // Status
  statusLobby: string;
  errorBackground: string;
  errorText: string;
  // Player
  playerCurrent: string;
  playerIcon: string;
  // Destructive
  destructiveBg: string;
  destructiveText: string;
}

/**
 * Create the theme context from palette.
 */
export function createThemeContext(palette: Palette): StyleThemeContext {
  const isLight = palette.isLight;
  const tableTheme = palette.gameTable;
  const { shadow, destructiveBg, destructiveText, playerCurrent, playerIcon } =
    tableTheme;
  const {
    heroBackground: cardBackground,
    raisedBackground: ringSurface,
    border: cardBorder,
    actionBackground: panelSurface,
    actionBorder: panelBorder,
    heroGlowPrimary,
    heroGlowSecondary,
    backgroundGlow: roomGlow,
    decorPlay,
    decorCheck,
    decorAlert,
    heroBadgeBackground,
    heroBadgeBorder,
    heroBadgeText,
    statusLobby,
    errorBackground,
    errorText,
    titleText,
  } = palette.gameRoom;

  const surface = cardBackground;
  const raised = panelSurface;
  const border = panelBorder;
  const primaryBgColor = decorCheck;
  const primaryTextColor = heroBadgeText;
  const overlayShadow = isLight
    ? 'rgba(15, 23, 42, 0.45)'
    : 'rgba(15, 23, 42, 0.65)';

  return {
    isLight,
    surface,
    raised,
    border,
    cardBorder,
    shadow,
    overlayShadow,
    primaryBgColor,
    primaryTextColor,
    titleText,
    heroBadgeText,
    heroBadgeBackground,
    heroBadgeBorder,
    decorPlay,
    decorCheck,
    decorAlert,
    heroGlowPrimary,
    heroGlowSecondary,
    roomGlow,
    statusLobby,
    errorBackground,
    errorText,
    playerCurrent,
    playerIcon,
    destructiveBg,
    destructiveText,
  };
}
