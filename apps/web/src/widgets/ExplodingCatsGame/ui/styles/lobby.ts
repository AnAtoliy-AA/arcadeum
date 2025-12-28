import styled, { keyframes } from 'styled-components';

// Animations
export const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(3deg); }
  75% { transform: translateY(-4px) rotate(-3deg); }
`;

export const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

// Layout
export const LobbyContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.5rem;
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

// Main Center Section
export const CenterSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  animation: ${slideIn} 0.5s ease-out;
`;

export const GameIcon = styled.div`
  font-size: 5rem;
  line-height: 1;
  animation: ${float} 4s ease-in-out infinite;
  filter: drop-shadow(0 8px 24px rgba(99, 102, 241, 0.3));
`;

export const LobbyTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #10b981 100%);
  background-size: 200% 200%;
  animation: ${shimmer} 4s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  text-align: center;
`;

export const LobbySubtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  margin: 0;
  max-width: 400px;
`;

// Room Name Badge
export const RoomNameBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 1rem;
  background: linear-gradient(
    135deg,
    rgba(16, 185, 129, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(4px);
`;

const diceRoll = keyframes`
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-15deg) scale(1.1); }
  50% { transform: rotate(15deg) scale(1); }
  75% { transform: rotate(-5deg) scale(1.05); }
`;

export const RoomNameIcon = styled.span`
  font-size: 1rem;
  display: inline-block;
  animation: ${diceRoll} 2s ease-in-out infinite;
`;

export const RoomNameText = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #f59e0b 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
`;

// Progress Bar
export const ProgressWrapper = styled.div`
  width: 100%;
  max-width: 300px;
`;

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 0.5rem;
`;

export const ProgressBar = styled.div`
  height: 8px;
  background: rgba(99, 102, 241, 0.15);
  border-radius: 4px;
  overflow: hidden;
`;

export const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
  border-radius: 4px;
  transition: width 0.4s ease;
`;

// Host Controls
export const HostControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.1),
    rgba(236, 72, 153, 0.05)
  );
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  animation: ${slideIn} 0.6s ease-out 0.1s both;
`;

export const HostLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #6366f1;
`;

// Sidebar
export const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  animation: ${slideIn} 0.5s ease-out 0.2s both;
`;

export const LobbyCard = styled.div`
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    rgba(139, 92, 246, 0.04)
  );
  backdrop-filter: blur(12px);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 16px;
  padding: 1.25rem;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
  }
`;

export const CardTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.text.secondary};
  margin: 0 0 1rem 0;
`;

// Player List
export const PlayerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const PlayerItem = styled.div<{ $isHost?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 10px;
  background: ${({ $isHost }) =>
    $isHost ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid
    ${({ $isHost }) => ($isHost ? 'rgba(99, 102, 241, 0.3)' : 'transparent')};
`;

export const LobbyPlayerAvatar = styled.div<{ $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
  color: white;
  flex-shrink: 0;
`;

export const PlayerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const LobbyPlayerName = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const PlayerBadge = styled.span`
  font-size: 0.65rem;
  padding: 0.15rem 0.5rem;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 8px;
  font-weight: 600;
`;

export const EmptySlot = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 10px;
  border: 1px dashed rgba(99, 102, 241, 0.2);
  opacity: 0.5;
`;

export const EmptyAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;

// Info Row
export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  &:last-child {
    border-bottom: none;
  }
`;

export const InfoLabel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text.secondary};
`;

export const InfoValue = styled.span`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.primary};
`;

export const StatusBadge = styled.span<{ $status: string }>`
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  font-weight: 500;
  background: ${({ $status }) =>
    $status === 'lobby'
      ? 'rgba(16, 185, 129, 0.15)'
      : 'rgba(99, 102, 241, 0.15)'};
  color: ${({ $status }) => ($status === 'lobby' ? '#10b981' : '#6366f1')};
`;

// Waiting Animation
export const WaitingDots = styled.div`
  display: flex;
  gap: 0.4rem;
`;

export const Dot = styled.div<{ $delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  animation: ${pulse} 1.4s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;
