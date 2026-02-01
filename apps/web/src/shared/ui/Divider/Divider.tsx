import styled from 'styled-components';
import { HTMLAttributes } from 'react';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  spacing?: 'sm' | 'md' | 'lg';
}

const spacingMap = {
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
};

const StyledDivider = styled.hr<{ $spacing: 'sm' | 'md' | 'lg' }>`
  border: none;
  height: 1px;
  background: ${({ theme }) => theme.surfaces.card.border};
  margin: ${({ $spacing }) => spacingMap[$spacing]} 0;
`;

export function Divider({ spacing = 'md', ...props }: DividerProps) {
  return <StyledDivider $spacing={spacing} {...props} />;
}
