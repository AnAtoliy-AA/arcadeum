import styled from 'styled-components';
import { Card, Badge } from '@/shared/ui';

export const EntriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
`;

export const EntryCard = styled(Card).attrs({
  variant: 'default',
  padding: 'md',
  interactive: true,
})`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
  cursor: pointer;
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

export const EntryStatus = styled(Badge).attrs({ variant: 'info', size: 'sm' })`
  border-radius: 999px;
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
