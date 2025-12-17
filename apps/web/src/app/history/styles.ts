import styled from "styled-components";

// Page Layout
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
  gap: 1.5rem;
`;

// Header
export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

export const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.buttons.primary.gradientStart};
  background: transparent;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: ${({ theme }) => theme.buttons.primary.text};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const RefreshIcon = styled.span<{ $spinning: boolean }>`
  display: inline-block;
  font-size: 1.25rem;
  animation: ${({ $spinning }) => ($spinning ? "spin 1s linear infinite" : "none")};

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Filter Bar
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

export const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.9375rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }

  &::placeholder {
    color: ${({ theme }) => theme.text.muted};
  }

  @media (max-width: 640px) {
    min-width: 100%;
  }
`;

export const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.9375rem;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }

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

// Entries Grid
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

// Loading and Empty States
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

export const Empty = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${({ theme }) => theme.text.muted};
`;

export const ErrorContainer = styled.div`
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
`;

export const ErrorText = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const RetryButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.buttons.primary.gradientStart};
  background: transparent;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.buttons.primary.gradientStart};
    color: ${({ theme }) => theme.buttons.primary.text};
  }
`;

// Modal
export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

export const ModalContent = styled.div`
  background: ${({ theme }) => theme.background.base};
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.buttons.primary.gradientStart};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-align: left;

  &:hover {
    text-decoration: underline;
  }
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

export const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

export const ModalLoading = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
`;

export const ModalError = styled.div`
  padding: 3rem;
  text-align: center;
`;

// Detail Sections
export const DetailTimestamp = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;

export const SectionDescription = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

// Participants
export const ParticipantRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
`;

export const ParticipantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

export const ParticipantIcon = styled.span<{ $isHost: boolean }>`
  font-size: 1.25rem;
`;

export const ParticipantName = styled.span`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.text.primary};
  flex: 1;
`;

export const HostBadge = styled.span`
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
`;

export const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

// Logs
export const LogItem = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

export const LogTimestamp = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const LogScope = styled.div`
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  background: ${({ theme }) => theme.surfaces.card.border};
  color: ${({ theme }) => theme.text.muted};
`;

export const LogSender = styled.div`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.text.muted};
`;

export const LogMessage = styled.div`
  font-size: 0.9375rem;
  color: ${({ theme }) => theme.text.primary};
`;

// Action Buttons
export const ActionButton = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid
    ${({ theme, $primary, $danger }) =>
      $danger
        ? theme.text.muted
        : $primary
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.card.border};
  background: ${({ theme, $primary }) =>
    $primary ? theme.buttons.primary.gradientStart : "transparent"};
  color: ${({ theme, $primary, $danger }) =>
    $danger
      ? theme.text.muted
      : $primary
      ? theme.buttons.primary.text
      : theme.text.primary};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ConfirmRow = styled.div`
  display: flex;
  gap: 1rem;

  button {
    flex: 1;
  }
`;
