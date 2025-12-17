import styled from "styled-components";

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

export const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.buttons.primary.gradientStart};
  background: transparent;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: ${({ theme }) => theme.buttons.primary.text};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const RefreshIcon = styled.span<{ $spinning: boolean }>`
  display: inline-block;
  font-size: 1.25rem;
  animation: ${({ $spinning }) => ($spinning ? "spin 1s linear infinite" : "none")};

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
