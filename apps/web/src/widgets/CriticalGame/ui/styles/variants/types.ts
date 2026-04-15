export interface TamaguiTheme {
  [key: string]: { val?: string; get?: () => string } | undefined;
}

export interface VariantStyleConfig {
  layout: {
    getBackgroundEffects: () => Record<string, unknown>;
    getRoomBackground: (themeBase: string, themeCardBg: string) => string;
    getRoomBorder: (isMyTurn: boolean, themeBorder: string) => string;
    getRoomShadow: (isMyTurn: boolean) => string;
  };
  table: {
    getBackground: () => string;
    getBorder: () => string;
    getShadow: () => string;
    center: {
      getBackground: () => string;
      getBorder: () => string;
      getShadow: () => string;
      getGlow: () => string;
    };
    actions?: {
      getContainerStyles?: () => Record<string, unknown>;
      getTitleStyles?: () => Record<string, unknown>;
      getButtonStyles?: () => Record<string, unknown>;
    };
  };
  header: {
    getBackground: (theme: TamaguiTheme) => string;
    getBorder: (theme: TamaguiTheme) => string;
    getLineBackground: () => string;
    getLineShadow: () => string;
    getTitleBackground: () => string;
    getTitleTextStyles?: () => Record<string, unknown>;
  };
  players: {
    getCardBackground: (
      isCurrentTurn?: boolean,
      isCurrentUser?: boolean,
      isAlive?: boolean,
      theme?: TamaguiTheme,
    ) => string;
    getCardBorder: (isCurrentTurn?: boolean, isCurrentUser?: boolean) => string;
    getCardShadow: (isCurrentTurn?: boolean, isCurrentUser?: boolean) => string;
    getCardGap: () => string;
    getCardPadding: () => string;
    getCardBorderRadius: () => string;
    getCardClipPath: () => string;
    getCardDimensions: () => { minWidth: string; maxWidth: string };
    getAvatarBackground: (
      isCurrentTurn?: boolean,
      theme?: TamaguiTheme,
    ) => string;
    getAvatarBorder: (isCurrentTurn?: boolean, theme?: TamaguiTheme) => string;
    getNameShadow: (isCurrentTurn?: boolean) => string;
    getAvatarRing: (isCurrentTurn: boolean, isEliminated: boolean) => string;
    getAvatarShadow: (isCurrentTurn: boolean) => string;
    getTurnIndicatorGlow: () => string;
    getCardCountStyles?: (
      isCurrentTurn?: boolean,
      type?: 'default' | 'stash' | 'marked',
    ) => Record<string, unknown> | null;
    getTurnIndicatorStyles?: () => Record<string, unknown>;
    getStyles?: () => Record<string, unknown>;
    getAvatarStyles?: () => Record<string, unknown>;
    getNameStyles?: () => Record<string, unknown>;
  };
  tableInfo: {
    getBackground: () => string;
    getBorder: () => string;
    getShadow: () => string;
    getTextGlow: () => string;
    getStatValueColor: (isWarning?: boolean) => string;
    getInfoCardBackground: (theme?: TamaguiTheme) => string;
    getInfoCardBorder: (theme?: TamaguiTheme) => string;
    getInfoCardShadow: () => string;
    getInfoCardPattern: () => string;
    getStyles?: () => Record<string, unknown>;
    getTableStatStyles?: () => Record<string, unknown>;
    getInfoCardStyles?: () => Record<string, unknown>;
  };
  chat: {
    getBackground: () => string;
    getBorder: () => string;
    getShadow: () => string;
    getInputBackground?: (theme: TamaguiTheme) => string;
    getInputBorder?: (theme: TamaguiTheme) => string;
    getInputFocusBorder?: (theme: TamaguiTheme) => string;
    getInputFocusShadow?: () => string;
    getInputStyles?: () => Record<string, unknown>;
    getTurnStatusStyles?: () => Record<string, unknown>;
  };
  cards: {
    glowEffect: string;
    borderEffect: string;
    deckBorderColor?: string;           // replaces getDeckBorder
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
    getHoverGlow?: () => string;         // box-shadow string for card hover
    getCardNameColor?: () => string;     // color for name label overlay
  };
}
