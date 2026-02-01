import styled from 'styled-components';
import { forwardRef, TextareaHTMLAttributes } from 'react';

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  fullWidth?: boolean;
}

interface StyledTextAreaProps {
  $error: boolean;
  $fullWidth: boolean;
}

const StyledTextArea = styled.textarea<StyledTextAreaProps>`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid
    ${({ theme, $error }) => ($error ? '#dc2626' : theme.surfaces.card.border)};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1rem;
  font-family: inherit;
  min-height: 100px;
  resize: vertical;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}

  &::placeholder {
    color: ${({ theme }) => theme.text.muted};
    opacity: 0.75;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $error }) =>
      $error ? '#dc2626' : theme.buttons.primary.gradientStart};
    box-shadow: ${({ theme, $error }) =>
      $error
        ? '0 0 0 3px rgba(220, 38, 38, 0.15)'
        : `0 0 0 3px ${theme.buttons.primary.gradientStart}20`};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error = false, fullWidth = false, ...props }, ref) => {
    return (
      <StyledTextArea
        ref={ref}
        $error={error}
        $fullWidth={fullWidth}
        {...props}
      />
    );
  },
);

TextArea.displayName = 'TextArea';
