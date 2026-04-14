import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.crime;

export const layoutStyles = {
  getBackgroundEffects: () => ({
    after: {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(225, 29, 72, 0.02) 2px,
        rgba(225, 29, 72, 0.02) 3px
      )`,
      pointerEvents: 'none',
      zIndex: 0,
    },
    before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      background:
        'radial-gradient(circle at 30% 0%, rgba(225, 29, 72, 0.08) 0%, transparent 60%)',
      pointerEvents: 'none',
    },
  }),
  getRoomBackground: () => `
    radial-gradient(ellipse at 30% 0%, rgba(225, 29, 72, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 100%, rgba(39, 39, 42, 0.4) 0%, transparent 50%),
    linear-gradient(165deg, ${C.background} 0%, #000000 100%)
  `,
  getRoomBorder: (isMyTurn: boolean) =>
    isMyTurn ? `2px solid ${C.primary}` : `1px solid ${C.primary}33`,
  getRoomShadow: (isMyTurn: boolean) =>
    isMyTurn
      ? `0 0 30px ${C.glow}, 0 0 60px ${C.glow}80, inset 0 0 20px ${C.glow}40`
      : `0 25px 80px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)`,
};
