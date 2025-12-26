import styled from 'styled-components';
import { forwardRef, SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  fullWidth?: boolean;
}

interface StyledSelectProps {
  $error: boolean;
  $fullWidth: boolean;
}

const StyledSelect = styled.select<StyledSelectProps>`
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $error }) => ($error ? '#dc2626' : theme.surfaces.card.border)};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;
  font-family: inherit;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%239ba1a6' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  transition: all 0.2s ease;

  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}

  &:focus {
    outline: none;
    border-color: ${({ theme, $error }) =>
      $error ? '#dc2626' : theme.buttons.primary.gradientStart};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  option {
    background: ${({ theme }) => theme.surfaces.card.background};
    color: ${({ theme }) => theme.text.primary};
  }
`;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error = false, fullWidth = false, children, ...props }, ref) => {
    return (
      <StyledSelect ref={ref} $error={error} $fullWidth={fullWidth} {...props}>
        {children}
      </StyledSelect>
    );
  },
);

Select.displayName = 'Select';
