import styled, { css, keyframes } from 'styled-components';
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { ButtonVariant, ButtonSize, GameVariant } from './types';

// Re-export for convenience if needed, but index.ts will handle it
export type { ButtonVariant, ButtonSize, GameVariant } from './types';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  gameVariant?: GameVariant;
  pulse?: boolean;
  uppercase?: boolean;
  $active?: boolean;
}

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const buttonPulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
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
    background: color-mix(
      in srgb,
      ${({ theme }) => theme.surfaces.card.background},
      transparent 50%
    );
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
      background: color-mix(
        in srgb,
        ${({ theme }) => theme.surfaces.card.background},
        transparent 40%
      );
      color: ${({ theme }) => theme.text.primary};
      backdrop-filter: blur(8px);
    }
  `,
  icon: css`
    background: transparent;
    color: ${({ theme }) => theme.text.secondary};
    border-color: transparent;
    padding: 0.5rem;
    min-width: auto;
    border-radius: 50%;
    aspect-ratio: 1;

    &:hover:not(:disabled) {
      background: color-mix(
        in srgb,
        ${({ theme }) => theme.surfaces.card.background},
        transparent 40%
      );
      color: ${({ theme }) => theme.text.primary};
    }
  `,
  link: css`
    background: transparent;
    color: ${({ theme }) => theme.text.secondary};
    border-color: transparent;
    padding: 0.25rem 0.5rem;
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover:not(:disabled) {
      color: ${({ theme }) => theme.text.primary};
      background: transparent;
    }
  `,
  chip: css`
    background: color-mix(
      in srgb,
      ${({ theme }) => theme.surfaces.card.background},
      transparent 50%
    );
    border: 1px solid ${({ theme }) => theme.surfaces.card.border};
    color: ${({ theme }) => theme.text.secondary};
    padding: 0.4rem 0.85rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
      color: ${({ theme }) => theme.text.primary};
    }
  `,
  listItem: css`
    background: transparent;
    color: ${({ theme }) => theme.text.primary};
    border-color: transparent;
    justify-content: flex-start;
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0;
    text-align: left;

    &:hover:not(:disabled) {
      background: color-mix(
        in srgb,
        ${({ theme }) => theme.surfaces.card.background},
        transparent 40%
      );
    }
  `,
  glass: css`
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.text.primary};
    backdrop-filter: blur(8px);

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.surfaces.card.background};
      border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    }
  `,
  neutral: css`
    background: #6b7280;
    color: white;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    &:hover:not(:disabled) {
      background: #4b5563;
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
    }
  `,
  success: css`
    background: #10b981;
    color: white;
    border: none;
    box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);

    &:hover:not(:disabled) {
      background: #059669;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
    }
  `,
  warning: css`
    background: #f59e0b;
    color: white;
    border: none;
    box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2);

    &:hover:not(:disabled) {
      background: #d97706;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(245, 158, 11, 0.3);
    }
  `,
  info: css`
    background: #3b82f6;
    color: white;
    border: none;
    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);

    &:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3);
    }
  `,
};

const gameVariantStyles = {
  cyberpunk: css<{ $active?: boolean }>`
    font-family: 'Courier New', monospace;
    letter-spacing: 1px;
    text-transform: uppercase;
    border-radius: 4px;

    /* Base styles for cyberpunk buttons */
    background: ${({ $active }) =>
      $active ? 'rgba(192, 38, 211, 0.2)' : 'rgba(6, 182, 212, 0.1)'};
    border: 1px solid ${({ $active }) => ($active ? '#c026d3' : '#06b6d4')};
    color: ${({ $active }) => ($active ? '#e879f9' : '#06b6d4')};
    box-shadow: ${({ $active }) =>
      $active ? '0 0 10px rgba(192, 38, 211, 0.3)' : 'none'};
    text-shadow: 0 0 5px ${({ $active }) => ($active ? '#c026d3' : '#06b6d4')}80;

    &:hover:not(:disabled) {
      background: ${({ $active }) =>
        $active ? 'rgba(192, 38, 211, 0.3)' : 'rgba(6, 182, 212, 0.2)'};
      box-shadow: 0 0 15px
        ${({ $active }) => ($active ? '#c026d3' : '#06b6d4')}40;
    }

    &::after {
      /* Arrow for dropdowns/selects if present */
      border-top-color: ${({ $active }) =>
        $active ? '#e879f9' : '#06b6d4'} !important;
    }
  `,
  underwater: css<{ $active?: boolean }>`
    font-family: 'Courier New', monospace;
    font-weight: 700;
    letter-spacing: 0.5px;
    border-radius: 12px;

    /* Base styles for underwater buttons */
    background: ${({ $active }) =>
      $active
        ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.3), rgba(8, 51, 68, 0.3))'
        : 'rgba(4, 11, 21, 0.6)'};
    border: 1px solid
      ${({ $active }) => ($active ? '#22d3ee' : 'rgba(34, 211, 238, 0.4)')};
    color: ${({ $active }) => ($active ? '#e0f2fe' : '#22d3ee')};
    box-shadow: ${({ $active }) =>
      $active ? '0 0 10px rgba(34, 211, 238, 0.25)' : 'none'};
    backdrop-filter: blur(4px);

    &:hover:not(:disabled) {
      border-color: #67e8f9;
      color: #ecfeff;
      background: ${({ $active }) =>
        $active
          ? 'linear-gradient(135deg, rgba(34, 211, 238, 0.4), rgba(8, 51, 68, 0.4))'
          : 'rgba(34, 211, 238, 0.2)'};
      box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
    }

    &::after {
      border-top-color: #22d3ee !important;
    }
  `,
};

// Active state styles for toggle buttons
const activeStyles = css<{ $active?: boolean }>`
  ${({ $active, theme }) =>
    $active &&
    css`
      background: ${theme.buttons.primary.gradientStart};
      color: ${theme.buttons.primary.text};
      border-color: ${theme.buttons.primary.gradientStart};

      &:hover:not(:disabled) {
        background: ${theme.buttons.primary.gradientStart};
      }
    `}
`;

interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $active?: boolean;
  $gameVariant?: GameVariant;
  $pulse?: boolean;
  $uppercase?: boolean;
}

const StyledButton = styled.button<StyledButtonProps>`
  ${buttonBase}
  ${({ $size }) => sizeStyles[$size]}
  ${({ $variant }) => variantStyles[$variant]}
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}
  ${({ $gameVariant }) => $gameVariant && gameVariantStyles[$gameVariant]}
  ${({ $pulse }) =>
    $pulse &&
    css`
      animation: ${buttonPulse} 2s ease-in-out infinite;
    `}
  ${({ $uppercase }) =>
    $uppercase && 'text-transform: uppercase; letter-spacing: 0.5px;'}
  ${activeStyles}
`;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  gameVariant?: GameVariant;
  pulse?: boolean;
  uppercase?: boolean;
  active?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      gameVariant,
      pulse,
      uppercase,
      active,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <StyledButton
        ref={ref}
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        $active={active}
        $gameVariant={gameVariant}
        $pulse={pulse}
        $uppercase={uppercase}
        {...props}
      >
        {children}
      </StyledButton>
    );
  },
);

Button.displayName = 'Button';
