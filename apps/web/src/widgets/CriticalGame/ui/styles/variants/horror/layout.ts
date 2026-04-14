import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.horror;

export const layoutStyles = {
  getBackgroundEffects: () => ({
    before: {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(ellipse at 50% 50%, ${C.primary}0a 0%, transparent 70%)`,
      animation: 'ambientGlow 10s ease-in-out infinite',
      pointerEvents: 'none',
    },
    after: {
      content: '""',
      position: 'absolute',
      inset: 0,
      background:
        'radial-gradient(circle at center, transparent 30%, rgba(0, 0, 0, 0.8) 100%)',
      pointerEvents: 'none',
      zIndex: 10,
      animation: 'vignetteFlicker 6s infinite',
    },
  }),
  getRoomBackground: () => `
    radial-gradient(ellipse at 20% 0%, ${C.primary}0f 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, ${C.primary}0a 0%, transparent 50%),
    linear-gradient(165deg, ${C.background} 0%, #000000 100%)
  `,
  getRoomBorder: (isMyTurn: boolean) =>
    isMyTurn ? `3px solid ${C.accent}80` : `1px solid ${C.primary}2a`,
  getRoomShadow: (isMyTurn: boolean) =>
    isMyTurn
      ? `0 0 40px ${C.accent}40, inset 0 0 20px ${C.accent}20`
      : `0 25px 80px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.02)`,
};
