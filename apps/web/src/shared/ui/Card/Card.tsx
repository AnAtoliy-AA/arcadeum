import styled, { css, keyframes } from 'styled-components';
import { ReactNode, HTMLAttributes } from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  children: ReactNode;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const paddingMap = {
  none: '0',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
};

const variantStyles = {
  default: css`
    background: ${({ theme }) => theme.surfaces.card.background};
    border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  `,
  elevated: css`
    background: linear-gradient(
      165deg,
      ${({ theme }) => theme.surfaces.card.background} 0%,
      ${({ theme }) => theme.surfaces.panel.background} 100%
    );
    border: 1px solid ${({ theme }) => theme.surfaces.card.border}80;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.1),
      0 1px 3px rgba(0, 0, 0, 0.08);
  `,
  outlined: css`
    background: transparent;
    border: 1px dashed ${({ theme }) => theme.surfaces.card.border};
  `,
  glass: css`
    background: ${({ theme }) => theme.surfaces.card.background}60;
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid ${({ theme }) => theme.surfaces.card.border}50;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  `,
};

interface StyledCardProps {
  $variant: CardVariant;
  $padding: CardPadding;
  $interactive: boolean;
}

const StyledCard = styled.div<StyledCardProps>`
  border-radius: 20px;
  padding: ${({ $padding }) => paddingMap[$padding]};
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  animation: ${fadeIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation-fill-mode: both;
  position: relative;
  overflow: hidden;

  ${({ $variant }) => variantStyles[$variant]}

  /* Top gradient line */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      ${({ theme }) => theme.buttons.primary.gradientStart}40 20%,
      ${({ theme }) => theme.buttons.primary.gradientStart} 50%,
      ${({ theme }) => theme.buttons.primary.gradientStart}40 80%,
      transparent 100%
    );
    opacity: 0;
    transform: scaleX(0.5);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  /* Corner glow effect */
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle,
      ${({ theme }) => theme.buttons.primary.gradientStart}10 0%,
      transparent 70%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }

  ${({ $interactive, theme }) =>
    $interactive &&
    css`
      cursor: pointer;

      &:hover {
        transform: translateY(-6px);
        border-color: ${theme.buttons.primary.gradientStart}50;
        box-shadow:
          0 20px 40px rgba(0, 0, 0, 0.15),
          0 8px 16px rgba(0, 0, 0, 0.1),
          0 0 30px ${theme.buttons.primary.gradientStart}15;

        &::before {
          opacity: 1;
          transform: scaleX(1);
        }

        &::after {
          opacity: 1;
        }
      }

      &:active {
        transform: translateY(-2px);
      }

      &:focus-visible {
        outline: none;
        box-shadow:
          0 0 0 2px ${theme.background.base},
          0 0 0 4px ${theme.buttons.primary.gradientStart};
      }
    `}
`;

export function Card({
  variant = 'elevated',
  padding = 'md',
  interactive = false,
  children,
  ...props
}: CardProps) {
  return (
    <StyledCard
      $variant={variant}
      $padding={padding}
      $interactive={interactive}
      {...props}
    >
      {children}
    </StyledCard>
  );
}
