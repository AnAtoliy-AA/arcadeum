import styled, { css } from 'styled-components';
import { Card, ActionButton } from './cards';
import { VARIANT_COLORS } from './variant-palette';

// Hand Components
export const HandHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const HandTitle = styled.h3`
  margin: 0;
  margin-right: auto;
  font-size: 0.875rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

export const HandControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const HandToggleButton = styled(ActionButton)`
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
  min-width: auto;
  width: auto;
`;

export const HandCard = styled(Card)<{
  $clickable?: boolean;
  $dimmed?: boolean;
}>`
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  opacity: ${({ $clickable, $dimmed }) => ($clickable ? 1 : $dimmed ? 0.7 : 1)};
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    opacity 0.2s;
`;

// Player Components
export const PlayerCard = styled.div<{
  $isCurrentTurn?: boolean;
  $isAlive?: boolean;
  $isCurrentUser?: boolean;
  $variant?: string;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ $variant }) => ($variant === 'cyberpunk' ? '0.2rem' : '0.4rem')};
  padding: ${({ $variant }) =>
    $variant === 'cyberpunk' ? '0.85rem 0.75rem' : '0.75rem 0.625rem'};
  border-radius: ${({ $variant }) => ($variant === 'cyberpunk' ? '0' : '14px')};
  clip-path: ${({ $variant }) =>
    $variant === 'cyberpunk'
      ? 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)'
      : 'none'};
  background: ${({ $isCurrentTurn, $isCurrentUser, $isAlive, $variant }) => {
    if (!$isAlive) {
      return $variant === 'cyberpunk'
        ? 'linear-gradient(145deg, #2d1f3d, #1a1025)'
        : 'linear-gradient(145deg, #374151, #1f2937)';
    }
    if ($isCurrentTurn) {
      return $variant === 'cyberpunk'
        ? `linear-gradient(145deg, ${VARIANT_COLORS.cyberpunk.secondary}, #7c3aed)`
        : 'linear-gradient(145deg, #4f46e5, #7c3aed)';
    }
    if ($isCurrentUser) {
      return $variant === 'cyberpunk'
        ? 'linear-gradient(145deg, #701a75, #1a0a20)'
        : 'linear-gradient(145deg, #1e40af, #1e293b)';
    }
    return $variant === 'cyberpunk'
      ? 'linear-gradient(145deg, #3d1a4a, #1a0a20)'
      : 'linear-gradient(145deg, #334155, #1e293b)';
  }};
  color: #fff;
  opacity: ${({ $isAlive }) => ($isAlive ? 1 : 0.7)};
  filter: ${({ $isAlive }) => ($isAlive ? 'none' : 'grayscale(70%)')};
  border: 2px solid
    ${({ $isCurrentTurn, $isCurrentUser, $variant }) => {
      if ($isCurrentTurn) {
        return $variant === 'cyberpunk'
          ? `rgba(192, 38, 211, 0.6)`
          : 'rgba(255, 255, 255, 0.4)';
      }
      if ($isCurrentUser) {
        return $variant === 'cyberpunk'
          ? `rgba(6, 182, 212, 0.5)`
          : 'rgba(99, 102, 241, 0.6)';
      }
      return $variant === 'cyberpunk'
        ? `rgba(192, 38, 211, 0.25)`
        : 'rgba(255, 255, 255, 0.15)';
    }};
  box-shadow: ${({ $isCurrentTurn, $isCurrentUser, $variant }) => {
    if ($isCurrentTurn) {
      return $variant === 'cyberpunk'
        ? `0 8px 28px rgba(0, 0, 0, 0.5), 0 0 24px ${VARIANT_COLORS.cyberpunk.secondary}80`
        : '0 8px 28px rgba(0, 0, 0, 0.5), 0 0 24px rgba(99, 102, 241, 0.5)';
    }
    if ($isCurrentUser) {
      return $variant === 'cyberpunk'
        ? `0 6px 20px rgba(0, 0, 0, 0.4), 0 0 16px ${VARIANT_COLORS.cyberpunk.primary}4D`
        : '0 6px 20px rgba(0, 0, 0, 0.35)';
    }
    return $variant === 'cyberpunk'
      ? `0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px ${VARIANT_COLORS.cyberpunk.secondary}26`
      : '0 4px 16px rgba(0, 0, 0, 0.25)';
  }};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 95px;
  max-width: 115px;
  z-index: 10;

  ${({ $isCurrentTurn, $variant }) =>
    $isCurrentTurn &&
    css`
      animation: ${$variant === 'cyberpunk' ? 'cyberpunkGlow' : 'glow'} 2s
        ease-in-out infinite;
      @keyframes glow {
        0%,
        100% {
          box-shadow:
            0 8px 28px rgba(0, 0, 0, 0.5),
            0 0 24px rgba(99, 102, 241, 0.5);
        }
        50% {
          box-shadow:
            0 10px 36px rgba(0, 0, 0, 0.55),
            0 0 32px rgba(99, 102, 241, 0.7);
        }
      }
      @keyframes cyberpunkGlow {
        0%,
        100% {
          box-shadow:
            0 8px 28px rgba(0, 0, 0, 0.5),
            0 0 24px ${VARIANT_COLORS.cyberpunk.secondary}80;
        }
        50% {
          box-shadow:
            0 10px 36px rgba(0, 0, 0, 0.55),
            0 0 32px ${VARIANT_COLORS.cyberpunk.secondary}B3,
            0 0 16px ${VARIANT_COLORS.cyberpunk.primary}66;
        }
      }
    `}

  /* CYBERPUNK VARIANT OVERRIDES */
  ${({ $variant, $isCurrentTurn, $isAlive }) =>
    $variant === 'cyberpunk' &&
    css`
      background: ${!$isAlive ? 'rgba(0, 0, 0, 0.6)' : 'rgba(10, 5, 16, 0.6)'};
      border: none;
      border-radius: 0;
      clip-path: none;
      position: relative;
      overflow: visible;
      box-shadow: none;
      padding: 1rem 0.5rem;
      gap: 0.25rem;
      transition: all 0.2s ease-out;

      /* Tech Brackets (Corners) - Using pseudo-element for crisp pixel borders */
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 1px solid transparent;
        background:
          linear-gradient(
              to right,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            0 0,
          linear-gradient(
              to bottom,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            0 0,
          linear-gradient(
              to left,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            100% 0,
          linear-gradient(
              to bottom,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            100% 0,
          linear-gradient(
              to right,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            0 100%,
          linear-gradient(
              to top,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            0 100%,
          linear-gradient(
              to left,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            100% 100%,
          linear-gradient(
              to top,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            100% 100%;
        background-repeat: no-repeat;
        background-size: 10px 10px;
        opacity: ${$isCurrentTurn ? 1 : 0.5};
        pointer-events: none;
        transition: all 0.3s ease;
        box-shadow: ${$isCurrentTurn
          ? `0 0 10px ${VARIANT_COLORS.cyberpunk.secondary}4D`
          : 'none'};
      }

      /* Tech Scanline Background */
      &::after {
        content: '';
        position: absolute;
        inset: 2px;
        background: repeating-linear-gradient(
          0deg,
          ${VARIANT_COLORS.cyberpunk.secondary}0D 0px,
          ${VARIANT_COLORS.cyberpunk.secondary}0D 1px,
          transparent 1px,
          transparent 3px
        );
        pointer-events: none;
        z-index: -1;
      }

      &:hover {
        transform: translateY(-2px);
        &::before {
          opacity: 1;
          box-shadow: 0 0 15px ${VARIANT_COLORS.cyberpunk.secondary}66;
          background-size: 12px 12px;
          border-color: ${VARIANT_COLORS.cyberpunk.secondary}1A;
        }
      }

      ${$isCurrentTurn &&
      css`
        &::before {
          box-shadow: 0 0 15px ${VARIANT_COLORS.cyberpunk.secondary}99;
          animation: bracketPulse 1.5s infinite alternate;
        }

        @keyframes bracketPulse {
          from {
            filter: drop-shadow(0 0 1px ${VARIANT_COLORS.cyberpunk.secondary});
            opacity: 0.8;
          }
          to {
            filter: drop-shadow(0 0 4px ${VARIANT_COLORS.cyberpunk.secondary});
            opacity: 1;
          }
        }
      `}
    `}

  @media (max-width: 768px) {
    min-width: 80px;
    max-width: 95px;
    padding: 0.5rem 0.5rem;
    gap: 0.3rem;
    border-radius: 10px;
  }
`;

export const PlayerAvatar = styled.div<{
  $isCurrentTurn?: boolean;
  $isAlive?: boolean;
  $variant?: string;
}>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? '#fff' : theme.background.base};
  border: 2px solid
    ${({ $isCurrentTurn, theme }) =>
      $isCurrentTurn ? '#fff' : theme.surfaces.card.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.3s ease;
  position: relative;

  ${({ $isAlive }) =>
    !$isAlive &&
    css`
      filter: grayscale(100%);
    `}

  /* Hexagon Clip for Cyberpunk */
  ${() => css`
    // Access theme if needed, or check a prop if we pass one.
    // Since we don't pass variant prop here yet, we will rely on Game styling context or pass it.
    // Ideally we should pass $variant to PlayerAvatar.
    // For now, let's assume we update TablePlayer to pass $variant.
  `}
  
  /* Applying Cyberpunk Styles via class/prop if passed */
  
  ${(props) =>
    props.$variant === 'cyberpunk' &&
    css`
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      border: none;
      border-radius: 0;
      ackground: #000;

      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border: 1px solid ${VARIANT_COLORS.cyberpunk.primary}CC;
        clip-path: polygon(
          50% 0%,
          100% 25%,
          100% 75%,
          50% 100%,
          0% 75%,
          0% 25%
        );
        pointer-events: none;
      }

      &::before {
        content: '';
        position: absolute;
        inset: -4px;
        border: 1px dashed ${VARIANT_COLORS.cyberpunk.primary}4D;
        border-radius: 50%; /* Outer ring */
        animation: spinAvatar 10s linear infinite;
      }

      @keyframes spinAvatar {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `}
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 1rem;
    border-width: 1.5px;
  }
`;

export const PlayerName = styled.div<{ $isCurrentTurn?: boolean }>`
  font-weight: 700;
  font-size: 0.8rem;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  line-height: 1.2;
  text-shadow: ${({ $isCurrentTurn }) =>
    $isCurrentTurn
      ? '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)'
      : 'none'};

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;
