import styled, { css } from 'styled-components';

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
  ${({ $type, $variant }) => {
    if ($type === 'stash') {
      return css`
        background: ${$variant === 'cyberpunk'
          ? 'rgba(234, 179, 8, 0.1)'
          : 'rgba(255, 215, 0, 0.2)'};
        color: ${$variant === 'cyberpunk' ? '#eab308' : '#FFD700'};
        border: ${$variant === 'cyberpunk'
          ? '1px solid rgba(234, 179, 8, 0.4)'
          : '1px solid rgba(255, 215, 0, 0.3)'};
        ${$variant === 'cyberpunk' && 'border-left: 3px solid #eab308;'};
      `;
    }
    if ($type === 'marked') {
      return css`
        background: ${$variant === 'cyberpunk'
          ? 'rgba(239, 68, 68, 0.1)'
          : 'rgba(255, 0, 0, 0.2)'};
        color: ${$variant === 'cyberpunk' ? '#ef4444' : '#FF4444'};
        border: ${$variant === 'cyberpunk'
          ? '1px solid rgba(239, 68, 68, 0.4)'
          : '1px solid rgba(255, 0, 0, 0.3)'};
        ${$variant === 'cyberpunk' && 'border-left: 3px solid #ef4444;'};
      `;
    }
  }}

  /* Data Tag Style for Cyberpunk (Base Overrides) */
  ${(props) =>
    props.$variant === 'cyberpunk' &&
    css`
      /* Only apply base cyberpunk styles if not specific type overrides, or merge them? 
         actually the type overrides above handle colors/borders. 
         We just need the font/shape from below.
      */
      background: rgba(0, 0, 0, 0.6); /* Default background unless overridden */
      border: 1px solid rgba(6, 182, 212, 0.4);
      border-left: 3px solid rgba(6, 182, 212, 0.8);
      border-radius: 2px;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.5px;
      padding: 0.2rem 0.4rem;
      color: #06b6d4;
      text-shadow: 0 0 5px rgba(6, 182, 212, 0.5);

      ${props.$isCurrentTurn &&
      !props.$type &&
      css`
        color: #fff;
        border-color: rgba(192, 38, 211, 0.6);
        border-left-color: #c026d3;
        text-shadow: 0 0 5px rgba(192, 38, 211, 0.5);
        background: rgba(192, 38, 211, 0.1);
      `}
    `}
  
  /* Consolidating Cyberpunk Logic to avoid conflict */
  ${({ $variant, $type, $isCurrentTurn }) =>
    $variant === 'cyberpunk' &&
    css`
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
    `}

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
    $variant !== 'cyberpunk' &&
    css`
      border-radius: 50%;
      background: linear-gradient(135deg, #ffd700, #ffa500);
      border: 2px solid white;
      font-size: 0.75rem;
      animation: bounce 1s ease-in-out infinite;
    `}

  /* Cyberpunk Reticle Style */
  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
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
`;
