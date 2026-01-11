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

export const FilterChip = styled.button<{ $active?: boolean }>`
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
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: ${({ $active, theme }) =>
      $active ? theme.buttons.primary.text : theme.text.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
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

export const RoomCard = styled.div<{ $viewMode?: 'grid' | 'list' }>`
  padding: ${({ $viewMode }) =>
    $viewMode === 'list' ? '1rem 1.5rem' : '1.5rem'};
  border-radius: ${({ $viewMode }) => ($viewMode === 'list' ? '14px' : '20px')};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: linear-gradient(
    145deg,
    ${({ theme }) => theme.surfaces.card.background} 0%,
    ${({ theme }) => theme.surfaces.panel.background} 100%
  );
  display: flex;
  flex-direction: ${({ $viewMode }) =>
    $viewMode === 'list' ? 'row' : 'column'};
  align-items: ${({ $viewMode }) =>
    $viewMode === 'list' ? 'center' : 'stretch'};
  justify-content: ${({ $viewMode }) =>
    $viewMode === 'list' ? 'space-between' : 'flex-start'};
  gap: ${({ $viewMode }) => ($viewMode === 'list' ? '1.5rem' : '1rem')};
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease-out;
  animation-fill-mode: both;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 20px;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    gap: 1rem;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      transparent,
      ${({ theme }) => theme.buttons.primary.gradientStart},
      transparent
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart}40;
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.3),
      0 0 20px ${({ theme }) => theme.buttons.primary.gradientStart}20;

    &::before {
      opacity: 1;
    }
  }

  &:nth-child(1) {
    animation-delay: 0s;
  }
  &:nth-child(2) {
    animation-delay: 0.1s;
  }
  &:nth-child(3) {
    animation-delay: 0.2s;
  }
  &:nth-child(4) {
    animation-delay: 0.3s;
  }
  &:nth-child(5) {
    animation-delay: 0.4s;
  }
`;

export const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

export const RoomTitle = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  letter-spacing: -0.3px;
`;

export const StatusBadge = styled.span<{ status: string }>`
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ status }) => {
    if (status === 'lobby')
      return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
    if (status === 'in_progress')
      return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
    return 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)';
  }};
  color: white;
  box-shadow: ${({ status }) => {
    if (status === 'lobby') return '0 2px 8px #10B98140';
    if (status === 'in_progress') return '0 2px 8px #F59E0B40';
    return '0 2px 8px #6B728040';
  }};
`;

export const FastBadge = styled.span`
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
  color: white;
  box-shadow: 0 2px 8px #eab30840;
`;

export const RoomMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text.primary};
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.text.primary};
`;

export const MetaIcon = styled.span`
  font-size: 0.9rem;
  filter: grayscale(30%);
`;

export const MetaLabel = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.text.muted};
  font-size: 0.8rem;
`;

export const MetaValue = styled.span`
  color: ${({ theme }) => theme.text.primary};
  font-weight: 600;
`;

export const RoomActions = styled.div<{ $viewMode?: 'grid' | 'list' }>`
  display: flex;
  gap: 0.75rem;
  margin-top: ${({ $viewMode }) => ($viewMode === 'list' ? '0' : '0.5rem')};
  padding-top: ${({ $viewMode }) => ($viewMode === 'list' ? '0' : '1rem')};
  border-top: ${({ $viewMode, theme }) =>
    $viewMode === 'list' ? 'none' : `1px solid ${theme.surfaces.card.border}`};
  flex-shrink: 0;
`;

export const ParticipantsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
  grid-column: 1 / -1;
`;

export const ParticipantChip = styled.span<{ $isHost?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  background: ${({ $isHost, theme }) =>
    $isHost
      ? `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}30, transparent)`
      : theme.surfaces.panel.background};
  border: 1px solid
    ${({ $isHost, theme }) =>
      $isHost
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.card.border};
`;

export const ActionButton = styled(LinkButton)<{
  variant?: 'primary' | 'secondary';
}>`
  padding: 0.75rem 1.25rem;
  font-size: 0.85rem;
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
`;

export const Empty = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  color: ${({ theme }) => theme.text.muted};
  font-size: 1.1rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border-radius: 20px;
  border: 1px dashed ${({ theme }) => theme.surfaces.card.border};
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
