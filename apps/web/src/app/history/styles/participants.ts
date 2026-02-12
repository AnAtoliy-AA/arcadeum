import styled from 'styled-components';

export const ParticipantRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  background: ${({ theme }) => theme.surfaces.card.background};
  border: 1px solid ${({ theme }) => theme.surfaces.card.border}60;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart}40;
    background: ${({ theme }) => theme.surfaces.card.background}80;
  }
`;

export const ParticipantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

export const ParticipantName = styled.span`
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
  flex: 1;
`;

export const Checkbox = styled.input`
  appearance: none;
  width: 22px;
  height: 22px;
  border: 2px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  background: ${({ theme }) => theme.surfaces.card.background};

  &:checked {
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.buttons.primary.gradientStart} 0%,
      ${({ theme }) => theme.buttons.primary.gradientEnd} 100%
    );
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }

  &:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: ${({ theme }) => theme.buttons.primary.text};
    font-size: 0.875rem;
    font-weight: bold;
  }

  &:hover {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.buttons.primary.gradientStart};
    outline-offset: 2px;
  }
`;
