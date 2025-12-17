import styled from "styled-components";

export const LogItem = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
`;

export const LogScope = styled.div`
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background: ${({ theme }) => theme.surfaces.card.border};
  color: ${({ theme }) => theme.text.muted};
`;

export const LogSender = styled.div`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const LogMessage = styled.div`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.text.primary};
`;
