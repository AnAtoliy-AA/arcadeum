import styled, { keyframes } from 'styled-components';
import {
  Spinner as SharedSpinner,
  Card,
  LinkButton,
  PageTitle as SharedPageTitle,
} from '@/shared/ui';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Page = styled.main`
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
`;

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const ViewToggle = styled.div`
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};

  @media (max-width: 768px) {
    display: none;
  }
`;

export const ViewToggleButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.85rem;
  border: none;
  background: ${({ $active, theme }) =>
    $active ? theme.buttons.primary.gradientStart : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.buttons.primary.text : theme.text.muted};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;

  &:hover {
    background: ${({ $active, theme }) =>
      $active
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.card.background};
    color: ${({ theme }) => theme.text.primary};
  }
`;

export const Title = styled(SharedPageTitle).attrs({
  size: 'xl',
  gradient: true,
})`
  font-weight: 800;
`;

export const CreateButton = styled(LinkButton).attrs({
  variant: 'primary',
  size: 'lg',
})``;

export const Filters = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  padding: 1.25rem 1.5rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
`;

export const SearchContainer = styled.div`
  flex: 1;
  min-width: 200px;
  max-width: 400px;
  display: flex;
  gap: 0.5rem;
`;

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.text.muted};
`;

export const FilterChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const FilterChip = styled.button<{
  $active?: boolean;
  $disabled?: boolean;
}>`
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.card.border};
  background: ${({ $active, theme }) =>
    $active
      ? `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}, ${theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart})`
      : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.buttons.primary.text : theme.text.secondary};
  font-weight: 500;
  font-size: 0.85rem;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};

  &:hover:not(:disabled) {
    border-color: ${({ theme, $disabled }) =>
      $disabled ? 'inherit' : theme.buttons.primary.gradientStart};
    color: ${({ $active, theme, $disabled }) =>
      $disabled
        ? 'inherit'
        : $active
          ? theme.buttons.primary.text
          : theme.text.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }
`;

export const RoomsContainer = styled.div<{ $viewMode?: 'grid' | 'list' }>`
  display: ${({ $viewMode }) => ($viewMode === 'list' ? 'flex' : 'grid')};
  flex-direction: ${({ $viewMode }) =>
    $viewMode === 'list' ? 'column' : 'unset'};
  grid-template-columns: ${({ $viewMode }) =>
    $viewMode === 'list' ? 'unset' : 'repeat(auto-fill, minmax(350px, 1fr))'};
  gap: 1.25rem;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 1fr;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  padding: 4rem;
  color: ${({ theme }) => theme.text.muted};
  font-size: 0.95rem;
`;

export const Spinner = styled(SharedSpinner).attrs({ size: 'lg' })``;

export const Error = styled(Card).attrs({ variant: 'outlined', padding: 'md' })`
  background: linear-gradient(135deg, #7f1d1d20, transparent);
  border-color: #dc2626;
  color: #ef4444;
  font-weight: 500;
  grid-column: 1 / -1;
`;

export const Empty = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  color: ${({ theme }) => theme.text.muted};
  font-size: 1.1rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border-radius: 20px;
  border: 1px dashed ${({ theme }) => theme.surfaces.card.border};
  grid-column: 1 / -1;
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  grid-column: 1 / -1;
`;

export const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: ${({ theme }) => theme.buttons.primary.text};
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PaginationInfo = styled.span`
  color: ${({ theme }) => theme.text.muted};
  font-size: 0.95rem;
  font-weight: 500;
`;

export const ServerWakeUpContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 50vh;
  flex: 1;
  grid-column: 1 / -1;
`;
