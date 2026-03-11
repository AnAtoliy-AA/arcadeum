import styled from 'styled-components';
import { Input, Select } from '@/shared/ui';

import { Button, ButtonProps } from '@arcadeum/ui';
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

  @media (max-width: 640px) {
    min-width: 100%;
    width: 100%;
  }
`;

export const FilterSelect = styled(Select)`
  min-width: 180px;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

export const ClearFiltersButton = (props: ButtonProps) => (
  <Button
    variant="ghost"
    size="sm"
    whiteSpace="nowrap"
    $xs={{ width: '100%' }}
    {...props}
  />
);
