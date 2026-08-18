import type { CSSProperties } from 'react';

/**
 * Custom props consumed by TableStat's Tailwind hover: classes
 * (see styles/table-info.tsx). Variants set them to get per-variant
 * hover colors/transforms without JS event handlers.
 */
export type StatHoverVars = {
  '--stat-hover-bg'?: string;
  '--stat-hover-border'?: string;
  '--stat-hover-transform'?: string;
};

export type TableStatStyles = CSSProperties & StatHoverVars;

export interface VariantStyleConfig {
  tableInfo: {
    getBackground: () => string;
    getBorder: () => string;
    getShadow: () => string;
    getTextGlow: () => string;
    getStatValueColor: (isWarning?: boolean) => string;
    getStyles?: () => CSSProperties;
    getTableStatStyles?: () => TableStatStyles;
  };
  cards: {
    glowEffect: string;
    borderEffect: string;
    deckBorderColor?: string;
    getCardSpriteUrl?: (variant?: string) => string | undefined;
  };
  scene: VariantScenePalette;
}

export interface VariantScenePalette {
  // Background scene
  sceneBgGradient: string;
  gridLineColorA: string;
  gridLineColorB: string;
  horizonGradient: string;
  backlightColor: string;
  vignetteColor: string;
  particleColors: string[];
  ambientGlowColorA: string;
  ambientGlowColorB: string;
  sceneBackgroundImage?: string;

  // Turn banner
  turnBannerBorderGradient: string;
  turnBannerDotColor: string;
  turnBannerShadow: string;

  // Player (opponents + you)
  opponentTurnRingColor: string;
  opponentTurnHaloColor: string;
  youAvatarGradient: string;

  // Table cards
  deckGradient: string;
  deckGlow: string;
  discardGradient: string;
  discardGlow: string;
  lastPlayedGradient: string;
  lastPlayedHaloColor: string;

  // Background for the hand / cards section below the scene backdrop
  handBackground: string;

  // Hand card gradients by role
  handColorByRole: {
    attack: string;
    defuse: string;
    skip: string;
    nope: string;
    favor: string;
    see: string;
    combo: string;
    special: string;
    [k: string]: string;
  };
}
