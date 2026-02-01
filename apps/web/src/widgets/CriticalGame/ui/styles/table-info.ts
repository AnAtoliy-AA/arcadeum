import styled, { css } from 'styled-components';
import { GAME_VARIANT } from '../../lib/constants';
import {
  getStatValueColor,
  getInfoCardBackground,
  getInfoCardBorder,
  getInfoCardShadow,
  getInfoCardPattern,
} from './table-info-helpers';

export const TableInfo = styled.div<{ $variant?: string }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid transparent;
  background-clip: padding-box;
  z-index: 5;
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.2);
  overflow: hidden;

  /* Animated gradient border for DEFAULT */
  ${({ $variant }) =>
    $variant !== GAME_VARIANT.CYBERPUNK &&
    $variant !== GAME_VARIANT.UNDERWATER &&
    css`
      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 16px;
        padding: 1px;
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.6),
          rgba(168, 85, 247, 0.4),
          rgba(236, 72, 153, 0.3),
          rgba(99, 102, 241, 0.6)
        );
        -webkit-mask:
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        mask:
          linear-gradient(#fff 0 0) content-box,
          linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        animation: shimmer 3s ease-in-out infinite;
      }
    `}

  /* Cyberpunk Styles */
  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      background: transparent;
      backdrop-filter: none;
      box-shadow: none;
      padding: 0;
      gap: 0.25rem;
      top: 1.5rem;
      right: 1.5rem;
      border: none;
    `}

  /* Underwater Styles */
  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      background: rgba(4, 11, 21, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(34, 211, 238, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
      padding: 0;
      border-radius: 8px;

      &::before {
        display: none;
      }

      /* Caustics Overlay */
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
          45deg,
          transparent 40%,
          rgba(34, 211, 238, 0.03) 45%,
          rgba(103, 232, 249, 0.07) 50%,
          rgba(34, 211, 238, 0.03) 55%,
          transparent 60%
        );
        background-size: 200% 200%;
        mix-blend-mode: overlay;
        animation: waterFlow 8s linear infinite;
        pointer-events: none;
      }
    `}

  @keyframes deepPulse {
    0%,
    100% {
      box-shadow:
        0 4px 20px rgba(0, 0, 0, 0.4),
        0 0 10px rgba(8, 51, 68, 0.5);
      border-color: rgba(34, 211, 238, 0.3);
    }
    50% {
      box-shadow:
        0 4px 25px rgba(0, 0, 0, 0.5),
        0 0 20px rgba(34, 211, 238, 0.15);
      border-color: rgba(103, 232, 249, 0.5);
    }
  }

  @keyframes waterFlow {
    0% {
      background-position: 100% 100%;
    }
    100% {
      background-position: 0% 0%;
    }
  }

  @keyframes shimmer {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    top: 0.5rem;
    right: 0.5rem;
    gap: 0.4rem;
    padding: 0.75rem;
    border-radius: 12px;
  }
`;

export const TableStat = styled.div<{ $variant?: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.65rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.02)
  );
  transition: all 0.25s ease;
  color: #fff;
  z-index: 2; /* Ensure stats interact above effects */

  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-left: 2px solid #06b6d4;
      border-radius: 2px;
      padding: 0.3rem 0.5rem;
      gap: 0.5rem;

      &:hover {
        background: rgba(6, 182, 212, 0.1);
        border-color: rgba(6, 182, 212, 0.6);
        transform: translateX(-2px);
      }

      > div:first-child {
        background: transparent !important;
        width: auto !important;
        height: auto !important;
        font-size: 1rem !important;
      }

      > div:last-child {
        font-family: 'Courier New', monospace;
        letter-spacing: 1px;
        color: #06b6d4;
        text-shadow: 0 0 5px rgba(6, 182, 212, 0.5);
      }
    `}

  /* Underwater Styles */
  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      background: rgba(22, 78, 99, 0.4);
      border: 1px solid rgba(34, 211, 238, 0.3);
      border-radius: 8px;
      padding: 0.4rem 0.6rem;
      box-shadow: inset 0 0 10px rgba(8, 51, 68, 0.5);

      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &:hover {
        background: rgba(34, 211, 238, 0.2);
        border-color: rgba(103, 232, 249, 0.8);
        box-shadow:
          0 0 15px rgba(34, 211, 238, 0.25),
          inset 0 0 10px rgba(34, 211, 238, 0.1);
        transform: translateY(-2px) scale(1.02);

        > div:last-child {
          text-shadow:
            0 0 8px rgba(103, 232, 249, 0.8),
            0 0 12px rgba(34, 211, 238, 0.4);
        }
      }

      /* Subtle bubble rise effect on hover */
      &::before {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        width: 4px;
        height: 4px;
        background: rgba(165, 243, 252, 0.6);
        border-radius: 50%;
        opacity: 0;
        transition: none;
      }

      &:hover::before {
        animation: bubbleRise 1.5s ease-out infinite;
      }

      > div:first-child {
        background: rgba(6, 182, 212, 0.25) !important;
        color: #a5f3fc;
        box-shadow: 0 0 10px rgba(34, 211, 238, 0.2);
      }

      > div:last-child {
        font-family: 'Courier New', monospace;
        letter-spacing: 0.5px;
        /* Color handled by StatValue component */
        text-shadow: 0 0 4px rgba(34, 211, 238, 0.4);
      }
    `}

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.25),
      rgba(168, 85, 247, 0.15)
    );
    transform: translateX(-2px);
  }

  > div:first-child {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.3),
      rgba(168, 85, 247, 0.2)
    );
    font-size: 0.9rem;
  }

  > div:last-child {
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
  }

  @media (max-width: 768px) {
    gap: 0.5rem;
    padding: 0.4rem 0.5rem;
    > div:first-child {
      width: 24px;
      height: 24px;
      font-size: 0.8rem;
    }
    > div:last-child {
      font-size: 0.8rem;
    }
  }
`;

export const StatIcon = styled.div`
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StatValue = styled.div<{
  $isWarning?: boolean;
  $variant?: string;
}>`
  font-size: 0.9rem;
  color: ${({ $isWarning, $variant }) =>
    getStatValueColor($isWarning, $variant)};
`;

export const InfoCard = styled.div<{ $variant?: string }>`
  padding: 1.5rem;
  border-radius: 20px;
  background: ${({ $variant, theme }) =>
    getInfoCardBackground($variant, theme)};
  backdrop-filter: blur(20px);
  border: 2px solid
    ${({ $variant, theme }) => getInfoCardBorder($variant, theme)};
  box-shadow: ${({ $variant }) => getInfoCardShadow($variant)};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $variant }) => getInfoCardPattern($variant)};
    pointer-events: none;
  }

  /* Underwater InfoCard Style */
  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      background: rgba(4, 11, 21, 0.7);
      border: 1px solid rgba(34, 211, 238, 0.15);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    `}

  @keyframes bubbleRise {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0;
    }
    20% {
      opacity: 0.8;
    }
    100% {
      transform: translateY(-30px) translateX(5px);
      opacity: 0;
    }
  }

  /* Cyberpunk Tech Brackets */
  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      background: rgba(10, 5, 20, 0.7);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 4px; /* Harder corners */
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      clip-path: polygon(
        0 0,
        100% 0,
        100% calc(100% - 15px),
        calc(100% - 15px) 100%,
        0 100%
      );

      &::after {
        content: '';
        position: absolute;
        inset: -1px;
        background:
          linear-gradient(
            135deg,
            rgba(236, 72, 153, 0) 90%,
            rgba(236, 72, 153, 0.1) 100%
          ),
          linear-gradient(to right, rgba(6, 182, 212, 1) 2px, transparent 2px) 0
            0 / 20px 20px no-repeat,
          linear-gradient(to bottom, rgba(6, 182, 212, 1) 2px, transparent 2px)
            0 0 / 20px 20px no-repeat,
          linear-gradient(to left, rgba(6, 182, 212, 1) 2px, transparent 2px)
            100% 0 / 20px 20px no-repeat,
          linear-gradient(to bottom, rgba(6, 182, 212, 1) 2px, transparent 2px)
            100% 0 / 20px 20px no-repeat;
        pointer-events: none;
      }
    `}

  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 16px;
  }

  @media (max-height: 600px) {
    padding: 1rem;
  }

  @media (max-height: 500px) {
    padding: 0.75rem;
  }
`;

export * from './table-decorations';
