import styled, { css } from 'styled-components';
import { GAME_VARIANT } from '../../lib/constants';

const getCardCountTypeStyles = (
  $type: string | undefined,
  $variant: string | undefined,
) => {
  if ($type === 'stash') {
    return css`
      background: ${$variant === GAME_VARIANT.CYBERPUNK
        ? 'rgba(234, 179, 8, 0.1)'
        : 'rgba(255, 215, 0, 0.2)'};
      color: ${$variant === GAME_VARIANT.CYBERPUNK ? '#eab308' : '#FFD700'};
      border: ${$variant === GAME_VARIANT.CYBERPUNK
        ? '1px solid rgba(234, 179, 8, 0.4)'
        : '1px solid rgba(255, 215, 0, 0.3)'};
      ${$variant === GAME_VARIANT.CYBERPUNK &&
      'border-left: 3px solid #eab308;'};
    `;
  }
  if ($type === 'marked') {
    return css`
      background: ${$variant === GAME_VARIANT.CYBERPUNK
        ? 'rgba(239, 68, 68, 0.1)'
        : 'rgba(255, 0, 0, 0.2)'};
      color: ${$variant === GAME_VARIANT.CYBERPUNK ? '#ef4444' : '#FF4444'};
      border: ${$variant === GAME_VARIANT.CYBERPUNK
        ? '1px solid rgba(239, 68, 68, 0.4)'
        : '1px solid rgba(255, 0, 0, 0.3)'};
      ${$variant === GAME_VARIANT.CYBERPUNK &&
      'border-left: 3px solid #ef4444;'};
    `;
  }
  return null;
};

const getCyberpunkCardCountStyles = (
  $isCurrentTurn: boolean | undefined,
  $type: string | undefined,
) => {
  return css`
    border-radius: 2px;
    font-family: 'Courier New', monospace;
    letter-spacing: 0.5px;
    padding: 0.2rem 0.4rem;
    text-shadow: 0 0 5px currentColor;

    /* Default Hand Count colors if no type */
    ${!$type &&
    css`
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(6, 182, 212, 0.4);
      border-left: 3px solid rgba(6, 182, 212, 0.8);
      color: #06b6d4;

      ${$isCurrentTurn &&
      css`
        color: #fff;
        border-color: rgba(192, 38, 211, 0.6);
        border-left-color: #c026d3;
        background: rgba(192, 38, 211, 0.1);
      `}
    `}

    /* Stash Override */
    ${$type === 'stash' &&
    css`
      background: rgba(234, 179, 8, 0.1);
      color: #eab308;
      border: 1px solid rgba(234, 179, 8, 0.4);
      border-left: 3px solid #eab308;
    `}

    /* Marked Override */
    ${$type === 'marked' &&
    css`
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-left: 3px solid #ef4444;
    `}
  `;
};

const getUnderwaterCardCountStyles = ($isCurrentTurn: boolean | undefined) => {
  return css`
    background: rgba(4, 11, 21, 0.6);
    border: 1px solid rgba(34, 211, 238, 0.4);
    border-radius: 4px;
    color: #a5f3fc;
    padding: 0.15rem 0.4rem;
    font-family: 'Courier New', monospace;

    &::before {
      content: '🎴';
      font-size: 0.8rem;
      margin-right: 0.2rem;
      opacity: 0.7;
    }

    ${$isCurrentTurn &&
    css`
      background: rgba(34, 211, 238, 0.15);
      border-color: #22d3ee;
      color: #fff;
    `}
  `;
};

export const PlayerStatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
`;

export const PlayerCardCount = styled.div<{
  $isCurrentTurn?: boolean;
  $variant?: string;
  $type?: 'default' | 'stash' | 'marked';
}>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? `rgba(0, 0, 0, 0.5)` : theme.background.base};
  border: 1px solid
    ${({ $isCurrentTurn, theme }) =>
      $isCurrentTurn ? 'rgba(255, 255, 255, 0.4)' : theme.surfaces.card.border};
  font-weight: 700;
  color: ${({ $isCurrentTurn }) => ($isCurrentTurn ? '#fff' : 'inherit')};
  text-shadow: ${({ $isCurrentTurn }) =>
    $isCurrentTurn ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none'};

  /* Type Specific Styles (Stash/Marked) */
  ${({ $type, $variant }) => getCardCountTypeStyles($type, $variant)}

  /* Variant Specific Styles */
  ${({ $variant, $type, $isCurrentTurn }) =>
    $variant === GAME_VARIANT.CYBERPUNK
      ? getCyberpunkCardCountStyles($isCurrentTurn, $type)
      : $variant === GAME_VARIANT.UNDERWATER
        ? getUnderwaterCardCountStyles($isCurrentTurn)
        : null}

  @media (max-width: 768px) {
    font-size: 0.65rem;
    padding: 0.2rem 0.5rem;
  }
`;

export const TurnIndicator = styled.div<{ $variant?: string }>`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;

  /* Default Style */
  ${({ $variant }) =>
    $variant !== GAME_VARIANT.CYBERPUNK &&
    css`
      border-radius: 50%;
      background: linear-gradient(135deg, #ffd700, #ffa500);
      border: 2px solid white;
      font-size: 0.75rem;
      animation: bounce 1s ease-in-out infinite;
    `}

  /* Cyberpunk Reticle Style */
  ${({ $variant }) =>
    $variant === GAME_VARIANT.CYBERPUNK &&
    css`
      width: 30px;
      height: 30px;
      top: -12px;
      right: -12px;
      background: transparent;
      border: none;
      font-size: 0; /* Hide default icon text */

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        border: 2px solid #ef4444; /* Target red */
        border-radius: 50%;
        border-left-color: transparent;
        border-right-color: transparent;
        animation: reticleSpin 2s linear infinite;
      }

      &::after {
        content: '';
        position: absolute;
        inset: 8px;
        background: #ef4444;
        border-radius: 50%;
        animation: reticlePulse 1s ease-in-out infinite;
      }
    `}

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }

  @keyframes reticleSpin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes reticlePulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(0.8);
    }
  }

  /* Underwater Bubble Pulse */
  ${({ $variant }) =>
    $variant === GAME_VARIANT.UNDERWATER &&
    css`
      background: radial-gradient(circle at 30% 30%, #67e8f9, #0891b2);
      border: 2px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 0 10px rgba(34, 211, 238, 0.6);
      animation: bubbleFloat 2s ease-in-out infinite;

      @keyframes bubbleFloat {
        0%,
        100% {
          transform: translateY(0) scale(1.05);
        }
        50% {
          transform: translateY(-4px) scale(0.95);
        }
      }
    `}
`;
