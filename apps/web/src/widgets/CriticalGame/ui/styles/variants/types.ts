export interface VariantStyleConfig {
  tableInfo: {
    getBackground: () => string;
    getBorder: () => string;
    getShadow: () => string;
    getTextGlow: () => string;
    getStatValueColor: (isWarning?: boolean) => string;
    getStyles?: () => Record<string, unknown>;
    getTableStatStyles?: () => Record<string, unknown>;
  };
  cards: {
    glowEffect: string;
    borderEffect: string;
    deckBorderColor?: string;
    getDecorationBackground?: () => string;
    getDecorationBorder?: () => string;
    getDecorationEffects?: () => Record<string, unknown>;
    getDisabledOverlay?: () => string;
    getActionButtonsStyles?: () => Record<string, unknown>;
    getCardNameStyles?: () => Record<string, unknown>;
    getCardDescriptionStyles?: () => Record<string, unknown>;
    getCardInnerStyles?: () => Record<string, unknown>;

    // sprite support
    getCardSpriteUrl?: (variant?: string) => string | undefined;
    getDeckStyles?: () => Record<string, unknown>;
    getCardStyles?: () => Record<string, unknown>;
    getHoverGlow?: () => string; // box-shadow string for card hover
    getCardNameColor?: () => string; // color for name label overlay
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
