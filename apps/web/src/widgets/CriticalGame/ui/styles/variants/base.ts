import { VariantStyleConfig } from './types';
import { GAME_VARIANT } from '../../../lib/constants';
import { VARIANT_COLORS } from '../variant-palette';

export const baseVariantStyles: VariantStyleConfig = {
  layout: {
    getBackgroundEffects: () => ({
      after: {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(
          90deg,
          transparent 0%,
          rgba(99, 102, 241, 0.8) 15%,
          rgba(236, 72, 153, 0.8) 50%,
          rgba(16, 185, 129, 0.8) 85%,
          transparent 100%
        )`,
        boxShadow:
          '0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(236, 72, 153, 0.3)',
        animation: 'shimmer 6s ease-in-out infinite',
      },
    }),
    getRoomBackground: (themeBase, themeCardBg) => `
      radial-gradient(
        ellipse at 20% 0%,
        rgba(99, 102, 241, 0.15) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 80% 100%,
        rgba(236, 72, 153, 0.12) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 50% 50%,
        rgba(16, 185, 129, 0.08) 0%,
        transparent 60%
      ),
      linear-gradient(
        165deg,
        ${themeBase} 0%,
        ${themeCardBg} 100%
      )
    `,
    getRoomBorder: (isMyTurn, themeBorder) => {
      if (isMyTurn) return '3px solid rgba(34, 197, 94, 0.8)';
      return `1px solid ${themeBorder}`;
    },
    getRoomShadow: (isMyTurn) => {
      if (isMyTurn) {
        return `0 0 20px rgba(34, 197, 94, 0.4),
            0 0 40px rgba(34, 197, 94, 0.2),
            inset 0 0 20px rgba(34, 197, 94, 0.1)`;
      }
      return `0 25px 80px rgba(0, 0, 0, 0.4),
          0 10px 30px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)`;
    },
  },
  table: {
    getBackground: () =>
      `linear-gradient(180deg, ${VARIANT_COLORS.default.secondary} 0%, #1e1b4b 50%, ${VARIANT_COLORS.default.secondary} 100%)`,
    getBorder: () => `1px solid ${VARIANT_COLORS.default.primary}`,
    getShadow: () => `0 20px 60px rgba(0, 0, 0, 0.4),
           inset 0 1px 0 rgba(255, 255, 255, 0.05),
           inset 0 -1px 0 rgba(0, 0, 0, 0.2)`,
    center: {
      getBackground: () => 'linear-gradient(145deg, #1e293b, #0f172a)',
      getBorder: () => '2px solid rgba(99, 102, 241, 0.3)',
      getShadow: () => `0 12px 40px rgba(0, 0, 0, 0.4),
           inset 0 2px 4px rgba(255, 255, 255, 0.05),
           inset 0 -2px 8px rgba(0, 0, 0, 0.3)`,
      getGlow: () => `conic-gradient(
        from 0deg,
        rgba(99, 102, 241, 0.6) 0deg,
        rgba(168, 85, 247, 0.5) 60deg,
        rgba(236, 72, 153, 0.4) 120deg,
        rgba(99, 102, 241, 0.3) 180deg,
        rgba(16, 185, 129, 0.4) 240deg,
        rgba(59, 130, 246, 0.5) 300deg,
        rgba(99, 102, 241, 0.6) 360deg
      )`,
    },
    actions: {
      getContainerStyles: () => ({}),
      getTitleStyles: () => ({}),
      getButtonStyles: () => ({}),
    },
  },
  header: {
    getBackground: (theme) =>
      `linear-gradient(135deg, ${theme.glassBg?.val || theme.backgroundHover?.val || ''}f5, ${theme.backgroundPress?.val || ''}e8)`,
    getBorder: (theme) =>
      `${theme.glassBorder?.val || theme.borderColor?.val || ''}40`,
    getLineBackground: () =>
      'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.4) 25%, rgba(236, 72, 153, 0.4) 50%, rgba(16, 185, 129, 0.4) 75%, transparent 100%)',
    getLineShadow: () => 'none',
    getTitleBackground: () =>
      'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #10b981 100%)',
    getTitleTextStyles: () => ({}),
  },
  players: {
    getCardBackground: (isCurrentTurn, isCurrentUser, isAlive) => {
      if (!isAlive) return 'linear-gradient(145deg, #374151, #1f2937)';
      if (isCurrentTurn) return 'linear-gradient(145deg, #4f46e5, #7c3aed)';
      if (isCurrentUser) return 'linear-gradient(145deg, #1e40af, #1e293b)';
      return 'linear-gradient(145deg, #334155, #1e293b)';
    },
    getCardBorder: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn) return 'rgba(255, 255, 255, 0.4)';
      if (isCurrentUser) return 'rgba(99, 102, 241, 0.6)';
      return 'rgba(255, 255, 255, 0.15)';
    },
    getCardShadow: (isCurrentTurn, isCurrentUser) => {
      if (isCurrentTurn)
        return '0 8px 28px rgba(0, 0, 0, 0.5), 0 0 24px rgba(99, 102, 241, 0.5)';
      if (isCurrentUser) return '0 6px 20px rgba(0, 0, 0, 0.35)';
      return '0 4px 16px rgba(0, 0, 0, 0.25)';
    },
    getCardGap: () => '0.4rem',
    getCardPadding: () => '0.75rem 0.625rem',
    getCardBorderRadius: () => '14px',
    getCardClipPath: () => 'none',
    getCardDimensions: () => ({ minWidth: '95px', maxWidth: '115px' }),
    getAvatarBackground: (isCurrentTurn, theme) =>
      isCurrentTurn ? '#fff' : theme?.background?.val || 'inherit',
    getAvatarBorder: (isCurrentTurn, theme) =>
      isCurrentTurn
        ? '#fff'
        : theme?.glassBorder?.val || theme?.borderColor?.val || 'inherit',
    getNameShadow: (isCurrentTurn) =>
      isCurrentTurn
        ? '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)'
        : 'none',
    getAvatarRing: (isCurrentTurn, isEliminated) => {
      if (isEliminated) return '3px solid rgba(255, 255, 255, 0.1)';
      if (isCurrentTurn) return '3px solid #10b981';
      return '3px solid transparent';
    },
    getAvatarShadow: (isCurrentTurn) =>
      isCurrentTurn ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
    getTurnIndicatorGlow: () =>
      'radial-gradient(circle at center, rgba(16, 185, 129, 0.8) 0%, transparent 70%)',
    getCardCountStyles: () => null,
    getTurnIndicatorStyles: () => ({
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #ffd700, #ffa500)',
      border: '2px solid white',
      fontSize: '0.75rem',
      animation: 'bounce 1s ease-in-out infinite',
    }),
  },
  tableInfo: {
    getBackground: () => 'rgba(15, 23, 42, 0.85)',
    getBorder: () => '1px solid transparent',
    getShadow: () =>
      '0 12px 32px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.2)',
    getTextGlow: () => 'inherit',
    getStatValueColor: (isWarning) => (isWarning ? '#DC2626' : 'inherit'),
    getInfoCardBackground: (theme) =>
      `linear-gradient(135deg, ${theme?.backgroundPress?.val || ''}ee, ${theme?.glassBg?.val || theme?.backgroundHover?.val || ''}dd)`,
    getInfoCardBorder: (theme) => theme?.borderColor?.val || 'inherit',
    getInfoCardShadow: () =>
      '0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    getInfoCardPattern: () => `repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.02) 10px,
      rgba(255, 255, 255, 0.02) 20px
    )`,
    getStyles: () => ({
      before: {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 16,
        padding: 1,
        background: `linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.6),
          rgba(168, 85, 247, 0.4),
          rgba(236, 72, 153, 0.3),
          rgba(99, 102, 241, 0.6)
        )`,
        WebkitMask:
          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        animation: 'shimmer 3s ease-in-out infinite',
      },
    }),
  },
  chat: {
    getBackground: () => 'inherit',
    getBorder: () => 'inherit',
    getShadow: () => 'none',
    getInputBackground: (theme) => theme.background?.val || '',
    getInputBorder: (theme) =>
      theme.glassBorder?.val || theme.borderColor?.val || '',
    getInputFocusBorder: (theme) => theme.primaryGradientStart?.val || '',
    getInputFocusShadow: () => '0 0 0 3px rgba(59, 130, 246, 0.2)',
  },
  cards: {
    glowEffect: `${VARIANT_COLORS.default.primary}`,
    borderEffect: `2px solid ${VARIANT_COLORS.default.primary}`,
    deckBorderColor: VARIANT_COLORS.default.primary,
    getHoverGlow: () => `0 0 24px ${VARIANT_COLORS.default.primary}cc`,
    getCardNameColor: () => 'rgba(255, 255, 255, 0.9)',
    getCardSpriteUrl: (variant) => {
      if (variant === GAME_VARIANT.CRIME)
        return '/images/cards/crime_sprites.png';
      if (variant === GAME_VARIANT.HORROR)
        return '/images/cards/horror_sprites.png';
      if (variant === GAME_VARIANT.ADVENTURE)
        return '/images/cards/adventure_sprites.png';
      return undefined;
    },
  },
  scene: {
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(120, 0, 220, 0.18) 0%, rgba(15, 5, 24, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(168, 85, 247, 0.28)',
    gridLineColorB: 'rgba(236, 72, 153, 0.18)',
    horizonGradient:
      'linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.9) 25%, rgba(236, 72, 153, 0.9) 75%, transparent 100%)',
    backlightColor: 'rgba(168, 85, 247, 0.32)',
    vignetteColor: 'rgba(0, 0, 0, 0.75)',
    particleColors: [
      'rgba(236, 72, 153, 0.85)',
      'rgba(168, 85, 247, 0.75)',
      'rgba(99, 102, 241, 0.6)',
    ],
    ambientGlowColorA: 'rgba(99, 102, 241, 0.12)',
    ambientGlowColorB: 'rgba(236, 72, 153, 0.1)',

    turnBannerBorderGradient:
      'linear-gradient(90deg, rgba(168, 85, 247, 1), rgba(236, 72, 153, 1))',
    turnBannerDotColor: 'rgba(236, 72, 153, 1)',
    turnBannerShadow:
      '0 0 24px rgba(168, 85, 247, 0.6), 0 0 48px rgba(236, 72, 153, 0.35)',
    opponentTurnRingColor: 'rgba(236, 72, 153, 1)',
    opponentTurnHaloColor: 'rgba(236, 72, 153, 0.35)',
    youAvatarGradient: 'linear-gradient(135deg, #f5c56a 0%, #c4902f 100%)',
    deckGradient:
      'linear-gradient(160deg, rgba(30, 15, 55, 1) 0%, rgba(12, 5, 22, 1) 100%)',
    deckGlow:
      '0 6px 20px rgba(168, 85, 247, 0.35), inset 0 0 12px rgba(236, 72, 153, 0.25)',
    discardGradient:
      'linear-gradient(160deg, rgba(13, 52, 64, 1) 0%, rgba(5, 22, 30, 1) 100%)',
    discardGlow:
      '0 6px 20px rgba(20, 184, 166, 0.35), inset 0 0 12px rgba(56, 189, 248, 0.2)',
    lastPlayedGradient:
      'linear-gradient(160deg, rgba(236, 72, 153, 1) 0%, rgba(168, 85, 247, 1) 55%, rgba(99, 102, 241, 1) 100%)',
    lastPlayedHaloColor: 'rgba(245, 197, 106, 0.5)',
    handColorByRole: {
      attack:
        'linear-gradient(160deg, rgba(236, 72, 153, 1) 0%, rgba(139, 28, 98, 1) 100%)',
      defuse:
        'linear-gradient(160deg, rgba(34, 197, 94, 1) 0%, rgba(6, 95, 70, 1) 100%)',
      skip: 'linear-gradient(160deg, rgba(239, 68, 68, 1) 0%, rgba(127, 29, 29, 1) 100%)',
      nope: 'linear-gradient(160deg, rgba(100, 116, 139, 1) 0%, rgba(30, 41, 59, 1) 100%)',
      favor:
        'linear-gradient(160deg, rgba(249, 115, 22, 1) 0%, rgba(154, 52, 18, 1) 100%)',
      see: 'linear-gradient(160deg, rgba(56, 189, 248, 1) 0%, rgba(12, 74, 110, 1) 100%)',
      combo:
        'linear-gradient(160deg, rgba(168, 85, 247, 1) 0%, rgba(76, 29, 149, 1) 100%)',
      special:
        'linear-gradient(160deg, rgba(245, 197, 106, 1) 0%, rgba(146, 96, 20, 1) 100%)',
    },
  },
};
