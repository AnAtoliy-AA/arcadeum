import styled, { css } from "styled-components";

// Player Components
export const PlayerCard = styled.div<{ $isCurrentTurn?: boolean; $isAlive?: boolean; $isCurrentUser?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 0.75rem;
  border-radius: 16px;
  background: ${({ $isCurrentTurn, $isCurrentUser, $isAlive, theme }) =>
    !$isAlive
      ? `${theme.surfaces.panel.background}80`
      : $isCurrentTurn
      ? `linear-gradient(135deg, ${theme.buttons.primary.gradientStart}ee, ${theme.buttons.primary.gradientEnd || theme.buttons.primary.gradientStart}ee)`
      : $isCurrentUser
      ? `${theme.surfaces.card.background}dd`
      : `${theme.surfaces.panel.background}cc`};
  backdrop-filter: blur(10px);
  color: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? theme.buttons.primary.text : theme.text.primary};
  opacity: ${({ $isAlive }) => ($isAlive ? 1 : 0.6)};
  filter: ${({ $isAlive }) => ($isAlive ? 'none' : 'grayscale(80%)')};
  border: 2px solid ${({ $isCurrentTurn, $isCurrentUser, theme }) =>
    $isCurrentTurn
      ? theme.buttons.primary.gradientStart
      : $isCurrentUser
      ? theme.buttons.primary.gradientStart
      : theme.surfaces.panel.border};
  box-shadow: ${({ $isCurrentTurn, $isCurrentUser }) =>
    $isCurrentTurn
      ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(59, 130, 246, 0.6)"
      : $isCurrentUser
      ? "0 4px 16px rgba(0, 0, 0, 0.25)"
      : "0 2px 12px rgba(0, 0, 0, 0.15)"};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 120px;
  max-width: 140px;

  ${({ $isCurrentTurn }) => $isCurrentTurn && css`
    animation: glow 2s ease-in-out infinite;
    @keyframes glow {
      0%, 100% { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(59, 130, 246, 0.6); }
      50% { box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 36px rgba(59, 130, 246, 0.9); }
    }
  `}

  &:hover {
    transform: scale(1.05) translateY(-4px);
    box-shadow: ${({ $isCurrentTurn }) =>
      $isCurrentTurn
        ? "0 16px 48px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 1)"
        : "0 8px 24px rgba(0, 0, 0, 0.3)"};
  }

  @media (max-width: 768px) {
    min-width: 100px;
    max-width: 110px;
    padding: 0.75rem 0.5rem;
  }
`;

export const PlayerAvatar = styled.div<{ $isCurrentTurn?: boolean; $isAlive?: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? theme.buttons.primary.text : theme.background.base};
  border: 3px solid ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? theme.buttons.primary.text : theme.surfaces.card.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  transition: all 0.3s ease;
  position: relative;

  ${({ $isAlive }) => !$isAlive && css`filter: grayscale(100%);`}
`;

export const PlayerName = styled.div<{ $isCurrentTurn?: boolean }>`
  font-weight: ${({ $isCurrentTurn }) => ($isCurrentTurn ? "700" : "600")};
  font-size: 0.875rem;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
`;

export const PlayerCardCount = styled.div<{ $isCurrentTurn?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? `${theme.buttons.primary.text}20` : theme.background.base};
  border: 1px solid ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? theme.buttons.primary.text : theme.surfaces.card.border};
  font-weight: 600;
`;

export const TurnIndicator = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  animation: bounce 1s ease-in-out infinite;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
`;
