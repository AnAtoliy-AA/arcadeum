import styled from 'styled-components';

export const LogItem = styled.div`
  padding: 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border}60;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.surfaces.card.border};
  }
`;

export const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

export const LogTimestamp = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.muted};
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
`;

export const LogScope = styled.div`
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.surfaces.card.border}40;
  color: ${({ theme }) => theme.text.muted};
`;

export const LogSender = styled.div`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.text.secondary};
  font-weight: 500;
`;

export const LogMessage = styled.div`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.text.primary};
  line-height: 1.5;
`;
