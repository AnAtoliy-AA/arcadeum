import styled from "styled-components";
import Link from "next/link";

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
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

export const CreateButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const Filters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const FilterChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const FilterChip = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ $active, theme }) =>
    $active ? theme.buttons.primary.gradientStart : theme.surfaces.card.background};
  color: ${({ $active, theme }) =>
    $active ? theme.buttons.primary.text : theme.text.primary};
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.outlines.focus};
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const RoomsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const RoomCard = styled.div`
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.surfaces.card.shadow};
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
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ status }) => {
    if (status === "lobby") return "#DCFCE7";
    if (status === "in_progress") return "#FDE68A";
    return "#E2E8F0";
  }};
  color: ${({ theme }) => theme.text.primary};
`;

export const RoomMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.9rem;
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
  opacity: 0.85;
`;

export const MetaLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

export const MetaValue = styled.span`
  color: ${({ theme }) => theme.text.primary};
`;

export const RoomActions = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

export const ParticipantsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

export const ParticipantChip = styled.span<{ $isHost?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  background: ${({ $isHost, theme }) =>
    $isHost ? theme.interactive.pill.activeBackground : theme.interactive.pill.inactiveBackground};
  border: 1px solid
    ${({ $isHost, theme }) =>
      $isHost ? theme.interactive.pill.activeBorder : theme.interactive.pill.border};
  box-shadow: ${({ $isHost, theme }) => ($isHost ? theme.interactive.pill.activeShadow : "none")};
`;

export const ActionButton = styled(Link)<{ variant?: "primary" | "secondary" }>`
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  ${({ variant, theme }) =>
    variant === "primary"
      ? `
    background: ${theme.buttons.primary.gradientStart};
    color: ${theme.buttons.primary.text};
  `
      : `
    border: 1px solid ${theme.buttons.secondary.border};
    color: ${theme.buttons.secondary.text};
    background: ${theme.buttons.secondary.background};
  `}

  &:hover {
    transform: translateY(-1px);
  }
`;

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.surfaces.card.border};
  border-top-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Error = styled.div`
  padding: 1.5rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid #F97316;
  color: #F97316;
`;

export const Empty = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${({ theme }) => theme.text.muted};
`;
