import styled from "styled-components";

export const DetailTimestamp = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export const SectionDescription = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;
