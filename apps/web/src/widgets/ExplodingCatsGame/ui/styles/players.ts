import styled, { css } from 'styled-components';

// Player Components
export const PlayerCard = styled.div<{
  $isCurrentTurn?: boolean;
  $isAlive?: boolean;
  $isCurrentUser?: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.75rem 0.625rem;
  border-radius: 14px;
  background: ${({ $isCurrentTurn, $isCurrentUser, $isAlive }) =>
    !$isAlive
      ? 'linear-gradient(145deg, #374151, #1f2937)'
      : $isCurrentTurn
        ? 'linear-gradient(145deg, #4f46e5, #7c3aed)'
        : $isCurrentUser
          ? 'linear-gradient(145deg, #1e40af, #1e293b)'
          : 'linear-gradient(145deg, #334155, #1e293b)'};
  color: #fff;
  opacity: ${({ $isAlive }) => ($isAlive ? 1 : 0.7)};
  filter: ${({ $isAlive }) => ($isAlive ? 'none' : 'grayscale(70%)')};
  border: 2px solid
    ${({ $isCurrentTurn, $isCurrentUser }) =>
      $isCurrentTurn
        ? 'rgba(255, 255, 255, 0.4)'
        : $isCurrentUser
          ? 'rgba(99, 102, 241, 0.6)'
          : 'rgba(255, 255, 255, 0.15)'};
  box-shadow: ${({ $isCurrentTurn, $isCurrentUser }) =>
    $isCurrentTurn
      ? '0 8px 28px rgba(0, 0, 0, 0.5), 0 0 24px rgba(99, 102, 241, 0.5)'
      : $isCurrentUser
        ? '0 6px 20px rgba(0, 0, 0, 0.35)'
        : '0 4px 16px rgba(0, 0, 0, 0.25)'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-width: 95px;
  max-width: 115px;
  z-index: 10;

  ${({ $isCurrentTurn }) =>
    $isCurrentTurn &&
    css`
      animation: glow 2s ease-in-out infinite;
      @keyframes glow {
        0%,
        100% {
          box-shadow:
            0 8px 28px rgba(0, 0, 0, 0.5),
            0 0 24px rgba(99, 102, 241, 0.5);
        }
        50% {
          box-shadow:
            0 10px 36px rgba(0, 0, 0, 0.55),
            0 0 32px rgba(99, 102, 241, 0.7);
        }
      }
    `}

  &:hover {
    transform: scale(1.04) translateY(-3px);
    box-shadow: ${({ $isCurrentTurn }) =>
      $isCurrentTurn
        ? '0 12px 40px rgba(0, 0, 0, 0.55), 0 0 36px rgba(99, 102, 241, 0.8)'
        : '0 8px 24px rgba(0, 0, 0, 0.35)'};
  }

  @media (max-width: 768px) {
    min-width: 80px;
    max-width: 95px;
    padding: 0.5rem 0.5rem;
    gap: 0.3rem;
    border-radius: 10px;
  }
`;

export const PlayerAvatar = styled.div<{
  $isCurrentTurn?: boolean;
  $isAlive?: boolean;
}>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? '#fff' : theme.background.base};
  border: 2px solid
    ${({ $isCurrentTurn, theme }) =>
      $isCurrentTurn ? '#fff' : theme.surfaces.card.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.3s ease;
  position: relative;

  ${({ $isAlive }) =>
    !$isAlive &&
    css`
      filter: grayscale(100%);
    `}

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 1rem;
    border-width: 1.5px;
  }
`;

export const PlayerName = styled.div<{ $isCurrentTurn?: boolean }>`
  font-weight: 700;
  font-size: 0.8rem;
  text-align: center;
  word-break: break-word;
  max-width: 100%;
  line-height: 1.2;
  text-shadow: ${({ $isCurrentTurn }) =>
    $isCurrentTurn
      ? '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.5)'
      : 'none'};

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

export const PlayerCardCount = styled.div<{ $isCurrentTurn?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: ${({ $isCurrentTurn, theme }) =>
    $isCurrentTurn ? `rgba(0, 0, 0, 0.5)` : theme.background.base};
  border: 1px solid
    ${({ $isCurrentTurn, theme }) =>
      $isCurrentTurn ? 'rgba(255, 255, 255, 0.4)' : theme.surfaces.card.border};
  font-weight: 700;
  color: ${({ $isCurrentTurn }) => ($isCurrentTurn ? '#fff' : 'inherit')};
  text-shadow: ${({ $isCurrentTurn }) =>
    $isCurrentTurn ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none'};

  @media (max-width: 768px) {
    font-size: 0.65rem;
    padding: 0.2rem 0.5rem;
  }
`;

export const TurnIndicator = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd700, #ffa500);
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  animation: bounce 1s ease-in-out infinite;

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
`;
