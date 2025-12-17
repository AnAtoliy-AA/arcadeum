import styled from "styled-components";

export const EntriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
`;

export const EntryCard = styled.button`
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.surfaces.card.shadow};
  }
`;

export const EntryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

export const EntryTitleGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const EntryGameName = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export const EntryRoomName = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
  margin-top: 0.25rem;
`;

export const EntryStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
`;

export const EntryMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const EntryFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

export const EntryTimestamp = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const EntryViewDetails = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
`;
