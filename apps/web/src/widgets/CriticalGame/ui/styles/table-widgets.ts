import styled from 'styled-components';
import { Button } from '@/shared/ui';
import { getVariantStyles } from './variants';

/* TableInfo, TableStat, StatIcon, StatValue, and InfoCard have been moved to table-info.ts */

export const InfoTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 0.75rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.buttons.primary.gradientStart},
      transparent
    );
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }
`;

export const ActionsHeader = styled.div<{ $variant?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: ${({ $variant }) =>
    getVariantStyles($variant).table.actions?.getContainerStyles?.()
      ? '0.5rem 1rem'
      : '0 0 0.5rem 0'};
  background: none;
  position: relative;

  ${({ $variant }) =>
    getVariantStyles($variant).table.actions?.getContainerStyles?.()}

  ${InfoTitle} {
    margin: 0;
    padding: 0;
    border: none;
    ${({ $variant }) =>
      getVariantStyles($variant).table.actions?.getTitleStyles?.()}

    &::after {
      display: none;
    }
  }
`;

export const ActionsToggleButton = styled(Button).attrs({
  variant: 'icon',
  size: 'sm',
})<{ $variant?: string }>`
  ${({ $variant }) =>
    getVariantStyles($variant).table.actions?.getButtonStyles?.()}
`;
