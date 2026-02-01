import styled from "styled-components";

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
