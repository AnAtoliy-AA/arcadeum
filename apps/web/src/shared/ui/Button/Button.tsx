import styled, { css, keyframes } from 'styled-components';
import { forwardRef, ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(4px);

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.background.base},
      0 0 0 4px ${({ theme }) => theme.buttons.primary.gradientStart};
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
    transform: none;
    filter: grayscale(30%);
  }
`;

const sizeStyles = {
  sm: css`
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    border-radius: 10px;
  `,
  md: css`
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    border-radius: 12px;
  `,
  lg: css`
    padding: 1rem 2rem;
    font-size: 1rem;
    border-radius: 14px;
    letter-spacing: 0.02em;
  `,
};

const variantStyles = {
  primary: css`
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
      0 4px 15px ${({ theme }) => theme.buttons.primary.gradientStart}40,
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

    /* Shimmer effect on hover */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
      );
      background-size: 200% 100%;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow:
        0 8px 25px ${({ theme }) => theme.buttons.primary.gradientStart}50,
        0 4px 10px ${({ theme }) => theme.buttons.primary.gradientStart}30,
        inset 0 1px 0 rgba(255, 255, 255, 0.2);

      &::before {
        opacity: 1;
        animation: ${shimmer} 1.5s infinite;
      }
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.surfaces.card.background}80;
    border: 1px solid ${({ theme }) => theme.surfaces.card.border};
    color: ${({ theme }) => theme.text.secondary};
    backdrop-filter: blur(10px);

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.surfaces.card.background};
      border-color: ${({ theme }) => theme.buttons.primary.gradientStart}60;
      color: ${({ theme }) => theme.text.primary};
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
  `,
  danger: css`
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    box-shadow:
      0 4px 15px rgba(239, 68, 68, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow:
        0 8px 25px rgba(239, 68, 68, 0.45),
        0 4px 10px rgba(239, 68, 68, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }
  `,
  ghost: css`
    background: transparent;
    color: ${({ theme }) => theme.text.secondary};
    border-color: transparent;

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.surfaces.card.background}60;
      color: ${({ theme }) => theme.text.primary};
      backdrop-filter: blur(8px);
    }
  `,
};

interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  ${buttonBase}
  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}
`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', fullWidth = false, children, ...props },
    ref,
  ) => {
    return (
      <StyledButton
        ref={ref}
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        {...props}
      >
        {children}
      </StyledButton>
    );
  },
);

Button.displayName = 'Button';
