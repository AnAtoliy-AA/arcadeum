import styled, { css } from 'styled-components';
import { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  fullWidth?: boolean;
}

interface StyledInputProps {
  $error: boolean;
  $fullWidth: boolean;
}

const StyledInput = styled.input<StyledInputProps>`
  padding: 0.875rem 1.125rem;
  border-radius: 14px;
  border: 1px solid
    ${({ theme, $error }) => ($error ? '#dc2626' : theme.surfaces.card.border)};
  background: ${({ theme }) => theme.surfaces.panel.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.95rem;
  font-family: inherit;
  backdrop-filter: blur(4px);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease,
    transform 0.15s ease;

  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}

  &::placeholder {
    color: ${({ theme }) => theme.text.muted};
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }

  &:hover:not(:disabled):not(:focus) {
    border-color: ${({ theme, $error }) =>
      $error ? '#dc2626' : theme.text.muted};
  }

  &:focus {
    outline: none;
    background: ${({ theme }) => theme.surfaces.card.background};
    border-color: ${({ theme, $error }) =>
      $error ? '#dc2626' : theme.buttons.primary.gradientStart};
    box-shadow: ${({ theme, $error }) =>
      `0 0 0 3px ${$error ? 'rgba(220, 38, 38, 0.15)' : theme.buttons.primary.gradientStart + '20'},
       0 4px 12px rgba(0, 0, 0, 0.08)`};

    &::placeholder {
      opacity: 0.5;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: ${({ theme }) => theme.surfaces.panel.background};
  }

  /* Error state glow */
  ${({ $error }) =>
    $error &&
    css`
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
    `}
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, fullWidth = false, ...props }, ref) => {
    return (
      <StyledInput ref={ref} $error={error} $fullWidth={fullWidth} {...props} />
    );
  },
);

Input.displayName = 'Input';
