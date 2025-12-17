import styled from "styled-components";

export const ActionButton = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid
    ${({ theme, $primary, $danger }) =>
      $danger
        ? theme.text.muted
        : $primary
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.card.border};
  background: ${({ theme, $primary }) =>
    $primary ? theme.buttons.primary.gradientStart : "transparent"};
  color: ${({ theme, $primary, $danger }) =>
    $danger
      ? theme.text.muted
      : $primary
      ? theme.buttons.primary.text
      : theme.text.primary};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ConfirmRow = styled.div`
  display: flex;
  gap: 1rem;

  button {
    flex: 1;
  }
`;
