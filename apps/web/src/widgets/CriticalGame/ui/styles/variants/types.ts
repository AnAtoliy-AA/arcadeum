import { RuleSet, DefaultTheme } from 'styled-components';

export interface VariantStyleConfig {
  layout: {
    getBackgroundEffects: () => RuleSet<object>;
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
      getContainerStyles?: () => RuleSet<object>;
      getTitleStyles?: () => RuleSet<object>;
      getButtonStyles?: () => RuleSet<object>;
    };
  };
  header: {
    getBackground: (theme: DefaultTheme) => string;
    getBorder: (theme: DefaultTheme) => string;
    getLineBackground: () => string;
    getLineShadow: () => string;
    getTitleBackground: () => string;
    getTitleTextStyles?: () => RuleSet<object>;
  };
  players: {
    getCardBackground: (
      isCurrentTurn?: boolean,
      isCurrentUser?: boolean,
      isAlive?: boolean,
      theme?: DefaultTheme,
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
      theme?: DefaultTheme,
    ) => string;
    getAvatarBorder: (isCurrentTurn?: boolean, theme?: DefaultTheme) => string;
    getNameShadow: (isCurrentTurn?: boolean) => string;
    getAvatarRing: (isCurrentTurn: boolean, isEliminated: boolean) => string;
    getAvatarShadow: (isCurrentTurn: boolean) => string;
    getTurnIndicatorGlow: () => string;
    getCardCountStyles?: (
      isCurrentTurn?: boolean,
      type?: 'default' | 'stash' | 'marked',
    ) => RuleSet<object> | null;
    getTurnIndicatorStyles?: () => RuleSet<object>;
    getStyles?: () => RuleSet<object>;
    getAvatarStyles?: () => RuleSet<object>;
    getNameStyles?: () => RuleSet<object>;
  };
  tableInfo: {
    getBackground: () => string;
    getBorder: () => string;
    getShadow: () => string;
    getTextGlow: () => string;
    getStatValueColor: (isWarning?: boolean) => string;
    getInfoCardBackground: (theme?: DefaultTheme) => string;
    getInfoCardBorder: (theme?: DefaultTheme) => string;
    getInfoCardShadow: () => string;
    getInfoCardPattern: () => string;
    getStyles?: () => RuleSet<object>;
    getTableStatStyles?: () => RuleSet<object>;
    getInfoCardStyles?: () => RuleSet<object>;
  };
  chat: {
    getBackground: () => string;
    getBorder: () => string;
    getShadow: () => string;
    getInputBackground?: (theme: DefaultTheme) => string;
    getInputBorder?: (theme: DefaultTheme) => string;
    getInputFocusBorder?: (theme: DefaultTheme) => string;
    getInputFocusShadow?: () => string;
    getInputStyles?: () => RuleSet<object>;
    getTurnStatusStyles?: () => RuleSet<object>;
  };
  cards: {
    glowEffect: string;
    borderEffect: string;
    getDecorationBackground?: () => string;
    getDecorationBorder?: () => string;
    getDecorationEffects?: () => RuleSet<object>;
    getDisabledOverlay?: () => string;
    getActionButtonsStyles?: () => RuleSet<object>;
    getCardNameStyles?: () => RuleSet<object>;
    getCardDescriptionStyles?: () => RuleSet<object>;
    getCardInnerStyles?: () => RuleSet<object>;

    // cards-base.ts additions
    getCardSpriteUrl?: (variant?: string) => string | undefined;
    getDeckBackground?: (variant?: string) => string;
    getDeckBorder?: (variant?: string) => string;
    getDeckStyles?: () => RuleSet<object>;
    getCardStyles?: () => RuleSet<object>;
  };
}
