import { VARIANT_COLORS } from '../../variant-palette';

const C = VARIANT_COLORS.adventure;

export const layoutStyles = {
  getBackgroundEffects: () => ({
    before: {
      content: '""',
      position: 'absolute',
      inset: '-20%',
      background: `radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.1) 0%, transparent 40%),
                   radial-gradient(circle at 70% 70%, rgba(16, 185, 129, 0.08) 0%, transparent 40%)`,
      animation: 'ambientGlow 15s ease-in-out infinite',
      pointerEvents: 'none',
    },
    after: {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background:
        'radial-gradient(circle at 50% 50%, transparent 20%, rgba(28, 25, 23, 0.4) 100%)',
      pointerEvents: 'none',
      zIndex: 0,
    },
  }),
  getRoomBackground: () => `
    radial-gradient(ellipse at 20% 0%, rgba(245, 158, 11, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
    linear-gradient(165deg, ${C.background} 0%, #0c0a09 100%)
  `,
  getRoomBorder: (isMyTurn: boolean) =>
    isMyTurn ? `3px solid ${C.primary}cc` : `1px solid ${C.primary}33`,
  getRoomShadow: (isMyTurn: boolean) =>
    isMyTurn
      ? `0 0 40px ${C.glow}, inset 0 0 20px ${C.glow}40`
      : `0 25px 80px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.03)`,
};
