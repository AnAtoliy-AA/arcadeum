import styled from 'styled-components';
import { Button, Card } from '@/shared/ui';

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const GameSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
`;

export const SelectionIndicator = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s ease;

  &::after {
    content: '✓';
    font-weight: bold;
  }
`;

export const GameTile = styled(Card)<{ $active?: boolean; disabled?: boolean }>`
  padding: 1rem;
  border-radius: 12px;
  background: ${({ $active }) =>
    $active ? 'rgba(var(--accent-rgb), 0.05)' : 'rgba(255, 255, 255, 0.03)'};
  border: 2px solid
    ${({ $active, theme }) =>
      $active
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.card.border};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow:
      ${({ theme }) => theme.surfaces.card.shadow},
      0 10px 20px -5px rgba(0, 0, 0, 0.1);
    border-color: ${({ theme, $active }) =>
      $active
        ? theme.buttons.primary.gradientStart
        : theme.text.primary}; // Highlight border on hover even if not active
  }

  ${({ $active }) =>
    $active &&
    `
    background: rgba(var(--accent-rgb), 0.05);
    box-shadow: 0 0 0 2px var(--accent-color);
    
    ${SelectionIndicator} {
      opacity: 1;
      transform: scale(1);
    }
  `}
`;

export const GameTileIcon = styled.div<{ $gradient?: string }>`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  background: ${({ $gradient }) => $gradient || 'none'};
  -webkit-background-clip: text;
  background-clip: text;
  display: inline-block;
  transition: transform 0.3s ease;

  ${GameTile}:hover & {
    transform: scale(1.1);
  }
`;

export const GameTileName = styled.div`
  font-weight: 700;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.text.primary};
`;

export const GameTileSummary = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 1.4;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const VisibilityToggle = styled(Button)<{ $isPublic: boolean }>`
  background: ${({ $isPublic }) =>
    $isPublic ? 'rgba(34, 197, 94, 0.1)' : 'rgba(191, 90, 242, 0.1)'};
`;

export const ErrorCard = styled(Card)`
  border-color: #dc2626;
  color: #ef4444;
`;

export const ExpansionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
`;

export const ExpansionCheckbox = styled.label<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  transition: all 0.2s ease;

  &:hover:not([data-disabled='true']) {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }

  input {
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }
`;

export const ExpansionLabel = styled.span`
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
`;

export const ExpansionBadge = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.muted};
  background: ${({ theme }) => theme.surfaces.panel.background};
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
`;

// Expandable Pack Components
export const ExpandablePackContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ExpandablePackHeader = styled.div<{
  $disabled?: boolean;
  $expanded?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  transition: all 0.2s ease;

  &:hover:not([data-disabled='true']) {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }
`;

export const ExpandToggle = styled.span<{ $expanded?: boolean }>`
  margin-left: auto;
  font-size: 0.875rem;
  transition: transform 0.2s ease;
  transform: rotate(${({ $expanded }) => ($expanded ? '180deg' : '0deg')});
`;

export const PackCardList = styled.div<{ $expanded?: boolean }>`
  display: ${({ $expanded }) => ($expanded ? 'flex' : 'none')};
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 1.5rem;
  margin-top: -0.25rem;
`;

export const PackCardRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: ${({ theme }) => theme.surfaces.panel.background};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.surfaces.card.background};
  }

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }
`;

export const PackCardName = styled.span`
  flex: 1;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.text.secondary};
`;

export const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const QuantityButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 4px;
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.secondary};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

export const QuantityValue = styled.span`
  min-width: 24px;
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;
