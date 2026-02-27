import styled from 'styled-components';
import { Button } from '@/shared/ui';
import { slideIn, float, shimmer, pulse, diceRoll } from './lobbyAnimations';

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

// diceRoll imported from lobbyAnimations

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

export const ReorderButton = styled(Button).attrs({
  variant: 'icon',
  size: 'sm',
})``;

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

export const FastBadge = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  font-weight: 500;
  background: rgba(234, 179, 8, 0.15);
  color: #eab308;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
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

export const VariantSelectorWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-left: 0.5rem;
`;
// ============ Container Components ============

export const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: linear-gradient(
    180deg,
    rgba(99, 102, 241, 0.05) 0%,
    transparent 100%
  );
`;

export const GameHeader = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-wrap: wrap;
  gap: 0.75rem;
`;

export const GameInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const GameTitleText = styled.h1<{ $gradient?: string }>`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: ${(props) =>
    props.$gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const VariantText = styled.span<{ $gradient?: string }>`
  font-size: 0.8em;
  background: ${(props) =>
    props.$gradient || 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)'};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

export const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const StartButton = styled.button<{ $gradient?: string }>`
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: ${(props) =>
    props.$gradient ||
    'linear-gradient(135deg, #c7aa2f 0%, #c7aa2f 50%, #8B7500 100%)'};
  color: #1a1a2e;
  box-shadow: 0 4px 16px rgba(199, 170, 47, 0.3);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(199, 170, 47, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const DeleteButton = styled(StartButton)`
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);

  &:hover:not(:disabled) {
    box-shadow: 0 6px 24px rgba(239, 68, 68, 0.4);
  }
`;

export const BotCountSelector = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

export const BotCountLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const BotCountButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const BotCountButton = styled.button<{ $active?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) =>
    $active ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid
    ${({ $active }) =>
      $active ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${({ $active, theme }) => ($active ? '#6366f1' : theme.text.primary)};

  &:hover:not(:disabled) {
    background: ${({ $active }) =>
      $active ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.1)'};
    border-color: ${({ $active }) =>
      $active ? 'rgba(99, 102, 241, 0.6)' : 'rgba(255, 255, 255, 0.2)'};
  }
`;
