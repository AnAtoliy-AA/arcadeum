import styled from 'styled-components';
import { Input, Select } from '@/shared/ui';

export const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchInput = styled(Input)`
  flex: 1;
  min-width: 250px;
  border-radius: 8px;
  font-size: 0.9375rem;

  @media (max-width: 640px) {
    min-width: 100%;
    width: 100%;
  }
`;

export const FilterSelect = styled(Select)`
  border-radius: 8px;
  font-size: 0.9375rem;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const ClearFiltersButton = styled.button`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: transparent;
  color: ${({ theme }) => theme.text.muted};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.surfaces.card.background};
    border-color: ${({ theme }) => theme.text.muted};
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;
