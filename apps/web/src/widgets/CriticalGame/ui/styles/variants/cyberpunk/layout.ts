import { css, RuleSet } from 'styled-components';
import { VARIANT_COLORS } from '../../variant-palette';

export const layoutStyles = {
  getBackgroundEffects: (): RuleSet<object> => css`
    perspective: 1000px;
    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
          transparent 0%,
          rgba(192, 38, 211, 0.2) 2%,
          transparent 3%
        ),
        linear-gradient(
          90deg,
          transparent 0%,
          rgba(6, 182, 212, 0.2) 2%,
          transparent 3%
        );
      background-size: 100px 100px;
      transform: rotateX(60deg);
      animation: gridMove 20s linear infinite;
      z-index: 0;
      pointer-events: none;
    }

    &::after {
      content: ' ';
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: linear-gradient(
        rgba(18, 16, 16, 0) 50%,
        rgba(0, 0, 0, 0.1) 50%
      );
      background-size: 100% 4px;
      z-index: 2;
      pointer-events: none;
    }
  `,
  getRoomBackground: (): string => `
    radial-gradient(
      ellipse at 20% 0%,
      rgba(192, 38, 211, 0.2) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 80% 100%,
      rgba(6, 182, 212, 0.15) 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse at 50% 50%,
      rgba(168, 85, 247, 0.1) 0%,
      transparent 60%
    ),
    linear-gradient(
      165deg,
      ${VARIANT_COLORS.cyberpunk.background} 0%,
      #1a0a20 100%
    )
  `,
  getRoomBorder: (isMyTurn: boolean): string => {
    if (isMyTurn) return `3px solid ${VARIANT_COLORS.cyberpunk.secondary}cc`;
    return `1px solid ${VARIANT_COLORS.cyberpunk.secondary}4d`;
  },
  getRoomShadow: (isMyTurn: boolean): string => {
    if (isMyTurn) {
      return `0 0 20px ${VARIANT_COLORS.cyberpunk.secondary}80,
            0 0 40px ${VARIANT_COLORS.cyberpunk.primary}4d,
            inset 0 0 20px ${VARIANT_COLORS.cyberpunk.secondary}26`;
    }
    return `0 25px 80px rgba(0, 0, 0, 0.6),
          0 10px 30px ${VARIANT_COLORS.cyberpunk.secondary}26,
          inset 0 1px 0 ${VARIANT_COLORS.cyberpunk.secondary}1a,
          inset 0 -1px 0 rgba(0, 0, 0, 0.2)`;
  },
};
