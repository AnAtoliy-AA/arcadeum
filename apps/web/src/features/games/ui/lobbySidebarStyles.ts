import styled from 'styled-components';
import { Button } from '@/shared/ui';
import { slideIn } from './lobbyAnimations';

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

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const CardTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.text.secondary};
  margin: 0;
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
