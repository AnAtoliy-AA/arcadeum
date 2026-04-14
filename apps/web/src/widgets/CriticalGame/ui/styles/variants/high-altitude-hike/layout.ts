import { VARIANT_COLORS } from '../../variant-palette';

const COLORS = VARIANT_COLORS['high-altitude-hike'];

export const layoutStyles = {
  getBackgroundEffects: () => ({
    before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(
        circle at 50% -20%,
        rgba(255, 255, 255, 0.2) 0%,
        transparent 60%
      )`,
      pointerEvents: 'none',
      zIndex: 0,
    },
    after: {
      content: '""',
      position: 'absolute',
      inset: 0,
      background:
        'linear-gradient(rgba(2, 6, 23, 0) 60%, rgba(56, 189, 248, 0.05) 100%)',
      pointerEvents: 'none',
      zIndex: 0,
    },
  }),
  getRoomBackground: () => `
    linear-gradient(
      180deg,
      ${COLORS.background} 0%,
      ${COLORS.secondary} 100%
    )
  `,
  getRoomBorder: (isMyTurn: boolean) => {
    if (isMyTurn) return `3px solid ${COLORS.primary}`;
    return `1px solid ${COLORS.secondary}66`;
  },
  getRoomShadow: (isMyTurn: boolean) => {
    if (isMyTurn) {
      return `0 0 30px ${COLORS.glow}, inset 0 0 20px ${COLORS.glow}40`;
    }
    return '0 25px 80px rgba(0, 0, 0, 0.6)';
  },
};
