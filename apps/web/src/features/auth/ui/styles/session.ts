import styled from "styled-components";

export const SessionCallout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.2rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  box-shadow: ${({ theme }) => theme.surfaces.panel.shadow};
`;

export const CalloutHeading = styled.span`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const CalloutDetail = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const TokenRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const TokenLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const TokenValue = styled.code`
  font-family: var(--font-geist-mono);
  font-size: 0.78rem;
  padding: 0.4rem 0.6rem;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.accent};
  word-break: break-all;
`;

export const SessionDetailList = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.45rem;
`;

export const SessionDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: baseline;
`;

export const SessionDetailTerm = styled.dt`
  margin: 0;
  font-size: 0.82rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const SessionDetailValue = styled.dd`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.secondary};
  font-family: var(--font-geist-mono);
  word-break: break-all;
`;

export const EmptyState = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text.muted};
`;
