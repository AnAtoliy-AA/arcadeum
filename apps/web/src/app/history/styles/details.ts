import styled from 'styled-components';

export const DetailTimestamp = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
  padding: 0.75rem 1rem;
  background: ${({ theme }) => theme.surfaces.card.background}60;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border}40;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: ${({ theme }) => theme.surfaces.card.background}40;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border}30;
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    width: 4px;
    height: 1em;
    background: linear-gradient(
      180deg,
      ${({ theme }) => theme.buttons.primary.gradientStart} 0%,
      ${({ theme }) => theme.buttons.primary.gradientEnd} 100%
    );
    border-radius: 2px;
  }
`;

export const SectionDescription = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
  line-height: 1.5;
`;
