import styled, { keyframes } from 'styled-components';

// Header Components
export const GameHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: ${({ theme }) => theme.surfaces.card.background};
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  margin: -2.5rem -2.5rem 0 -2.5rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    margin: -1.5rem -1.5rem 0 -1.5rem;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

export const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const GameTitle = styled.h2`
  margin: 0;
  font-size: 1.75rem;
  font-weight: 900;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.buttons.primary.gradientStart},
    ${({ theme }) =>
      theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const TurnStatus = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.secondary};
`;

const buttonPulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

export const StartButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.buttons.primary.gradientStart};
  color: ${({ theme }) => theme.buttons.primary.text};
  font-weight: 600;
  cursor: pointer;
  animation: ${buttonPulse} 2s ease-in-out infinite;

  &:hover:not(:disabled) {
    transform: scale(1.08);
    animation: none;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    animation: none;
  }
`;

export const FullscreenButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.25rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.buttons.primary.gradientStart}20,
      transparent
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ChatToggleButton = styled.button<{ $active?: boolean }>`
  padding: 0.65rem 1rem;
  border-radius: 10px;
  border: 1px solid
    ${({ $active, theme }) =>
      $active
        ? theme.buttons.primary.gradientStart
        : theme.surfaces.card.border};
  background: ${({ $active, theme }) =>
    $active
      ? `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}20, transparent)`
      : theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  &:active {
    transform: translateY(1px);
  }
`;
