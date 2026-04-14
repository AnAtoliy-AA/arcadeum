import { VARIANT_COLORS } from '../../variant-palette';

export const layoutStyles = {
  getBackgroundEffects: () => ({
    after: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: `linear-gradient(
        105deg,
        transparent 40%,
        rgba(34, 211, 238, 0.05) 45%,
        transparent 50%,
        rgba(34, 211, 238, 0.03) 55%,
        transparent 60%
      )`,
      filter: 'blur(12px)',
      transformOrigin: 'top left',
      pointerEvents: 'none',
      zIndex: -1,
    },
    before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      background:
        'radial-gradient(circle at 50% 50%, transparent 0%, rgba(2, 6, 23, 0.4) 100%)',
      pointerEvents: 'none',
      zIndex: -1,
    },
  }),
  getRoomBackground: () => `
    radial-gradient(
      ellipse at 50% 100%,
      rgba(34, 211, 238, 0.15) 0%,
      transparent 70%
    ),
    radial-gradient(
      ellipse at 50% 0%,
      rgba(8, 51, 68, 0.2) 0%,
      transparent 70%
    ),
    linear-gradient(
      180deg,
      #082f49 0%,
      ${VARIANT_COLORS.underwater.background} 100%
    )
  `,
  getRoomBorder: (isMyTurn: boolean) => {
    if (isMyTurn) return `2px solid ${VARIANT_COLORS.underwater.primary}`;
    return `1px solid ${VARIANT_COLORS.underwater.primary}33`;
  },
  getRoomShadow: (isMyTurn: boolean) => {
    if (isMyTurn) {
      return `0 0 30px ${VARIANT_COLORS.underwater.glow},
          0 0 60px ${VARIANT_COLORS.underwater.glow}80,
          inset 0 0 20px ${VARIANT_COLORS.underwater.glow}40`;
    }
    return `0 25px 80px rgba(0, 0, 0, 0.6),
        0 10px 30px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.05),
        inset 0 -1px 0 rgba(0, 0, 0, 0.2)`;
  },
};
