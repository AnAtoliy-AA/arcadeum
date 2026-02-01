import styled, { css, keyframes } from 'styled-components';
import { ReactNode, HTMLAttributes } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  pulse?: boolean;
  children: ReactNode;
}

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.05);
  }
`;

const variantStyles = {
  success: css`
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow:
      0 2px 8px rgba(16, 185, 129, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  `,
  warning: css`
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    box-shadow:
      0 2px 8px rgba(245, 158, 11, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  `,
  error: css`
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    box-shadow:
      0 2px 8px rgba(239, 68, 68, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  `,
  info: css`
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.buttons.primary.gradientStart} 0%,
      ${({ theme }) =>
          theme.buttons.primary.gradientEnd ||
          theme.buttons.primary.gradientStart}
        100%
    );
    color: ${({ theme }) => theme.buttons.primary.text};
    box-shadow:
      0 2px 8px ${({ theme }) => theme.buttons.primary.gradientStart}35,
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  `,
  neutral: css`
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    color: white;
    box-shadow:
      0 2px 8px rgba(107, 114, 128, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  `,
};

const sizeStyles = {
  sm: css`
    padding: 0.3rem 0.7rem;
    font-size: 0.65rem;
    border-radius: 8px;
  `,
  md: css`
    padding: 0.4rem 0.9rem;
    font-size: 0.75rem;
    border-radius: 10px;
  `,
};

interface StyledBadgeProps {
  $variant: BadgeVariant;
  $size: BadgeSize;
  $pulse: boolean;
}

const StyledBadge = styled.span<StyledBadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}

  ${({ $pulse }) =>
    $pulse &&
    css`
      animation: ${pulseAnimation} 2s ease-in-out infinite;
    `}

  &:hover {
    transform: translateY(-1px);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }
`;

export function Badge({
  variant = 'neutral',
  size = 'md',
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <StyledBadge $variant={variant} $size={size} $pulse={pulse} {...props}>
      {children}
    </StyledBadge>
  );
}
