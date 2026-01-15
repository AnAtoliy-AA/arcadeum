import styled, { css } from 'styled-components';
import { VARIANT_COLORS } from './variant-palette';

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
    $variant !== 'cyberpunk' &&
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
    $variant === 'cyberpunk' &&
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

  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
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
`;

export const StatValue = styled.div<{ $isWarning?: boolean }>`
  font-size: 0.9rem;
  color: ${({ $isWarning }) => ($isWarning ? '#DC2626' : 'inherit')};
`;

export const InfoCard = styled.div<{ $variant?: string }>`
  padding: 1.5rem;
  border-radius: 20px;
  background: ${({ $variant, theme }) =>
    $variant === 'cyberpunk'
      ? 'linear-gradient(135deg, rgba(20, 10, 35, 0.95), rgba(45, 10, 60, 0.9))'
      : `linear-gradient(135deg, ${theme.surfaces.panel.background}ee, ${theme.surfaces.card.background}dd)`};
  backdrop-filter: blur(20px);
  border: 2px solid
    ${({ $variant, theme }) =>
      $variant === 'cyberpunk'
        ? `${VARIANT_COLORS.cyberpunk.secondary}4D`
        : theme.surfaces.panel.border};
  box-shadow: ${({ $variant }) =>
    $variant === 'cyberpunk'
      ? `0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 0 1px ${VARIANT_COLORS.cyberpunk.secondary}4D`
      : '0 8px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $variant }) =>
      $variant === 'cyberpunk'
        ? `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            ${VARIANT_COLORS.cyberpunk.secondary}08 10px,
            ${VARIANT_COLORS.cyberpunk.secondary}08 20px
          )`
        : `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.02) 10px,
            rgba(255, 255, 255, 0.02) 20px
          )`};
    pointer-events: none;
  }

  /* Cyberpunk Tech Brackets */
  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
    css`
      background: rgba(10, 5, 20, 0.7);
      border: 1px solid ${VARIANT_COLORS.cyberpunk.secondary}4D;
      border-radius: 4px; /* Harder corners */
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
      clip-path: polygon(
        0 0,
        100% 0,
        100% calc(100% - 15px),
        calc(100% - 15px) 100%,
        0 100%
      );

      /* Corner Accents */
      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:
          linear-gradient(
            135deg,
            ${VARIANT_COLORS.cyberpunk.primary}00 90%,
            ${VARIANT_COLORS.cyberpunk.primary}1A 100%
          ),
          linear-gradient(
              to right,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            0 0 / 20px 20px no-repeat,
          linear-gradient(
              to bottom,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            0 0 / 20px 20px no-repeat,
          linear-gradient(
              to left,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            100% 0 / 20px 20px no-repeat,
          linear-gradient(
              to bottom,
              ${VARIANT_COLORS.cyberpunk.secondary} 2px,
              transparent 2px
            )
            100% 0 / 20px 20px no-repeat;
        pointer-events: none;
      }

      &::after {
        content: '';
        position: absolute;
        inset: -1px;
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
        background-size: 8px 8px;
        pointer-events: none;
        opacity: 0.6;
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

export const InfoTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 0.75rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.buttons.primary.gradientStart},
      transparent
    );
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }
`;

export const ActionsHeader = styled.div<{ $variant?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 2px solid
    ${({ $variant }) =>
      $variant === 'cyberpunk'
        ? `${VARIANT_COLORS.cyberpunk.secondary}66`
        : 'rgba(99, 102, 241, 0.3)'};
  padding-bottom: 0.5rem;

  ${InfoTitle} {
    margin: 0;
    padding: 0;
    border: none;
    ${({ $variant }) =>
      $variant === 'cyberpunk' &&
      css`
        color: ${VARIANT_COLORS.cyberpunk.secondary};
        text-shadow: 0 0 5px ${VARIANT_COLORS.cyberpunk.secondary}80;
        font-family: 'Courier New', monospace;
      `}

    &::after {
      display: none;
    }
  }
`;

export const ActionsToggleButton = styled.button<{ $variant?: string }>`
  background: none;
  border: none;
  color: ${({ $variant }) =>
    $variant === 'cyberpunk'
      ? VARIANT_COLORS.cyberpunk.secondary
      : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.2s,
    transform 0.2s;

  ${({ $variant }) =>
    $variant === 'cyberpunk' &&
    css`
      font-family: monospace;
      text-shadow: 0 0 5px ${VARIANT_COLORS.cyberpunk.secondary}80;
      border: 1px solid ${VARIANT_COLORS.cyberpunk.secondary}66;
      border-radius: 4px;
      width: 24px;
      height: 24px;
      &:hover {
        background: ${VARIANT_COLORS.cyberpunk.secondary}26;
      }
    `}

  &:hover {
    color: ${({ theme, $variant }) =>
      $variant === 'cyberpunk'
        ? VARIANT_COLORS.cyberpunk.accent
        : theme.buttons.primary?.gradientStart || '#ffffff'};
    transform: scale(1.1);
  }
`;
