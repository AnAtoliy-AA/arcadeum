import styled from "styled-components";

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.surfaces.card.border};
  border-top-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Empty = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${({ theme }) => theme.text.muted};
`;

export const ErrorContainer = styled.div`
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

export const ErrorText = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const RetryButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.buttons.primary.gradientStart};
  background: transparent;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: ${({ theme }) => theme.buttons.primary.text};
  }
`;
