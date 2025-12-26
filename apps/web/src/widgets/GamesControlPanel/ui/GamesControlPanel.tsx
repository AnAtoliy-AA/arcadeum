'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useTranslation } from '@/shared/lib/useTranslation';
import { gameSocket } from '@/shared/lib/socket';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { Button } from '@/shared/ui';

interface GamesControlPanelProps {
  roomId?: string;
  className?: string;
  onMovePlayer?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onCenterView?: () => void;
  showMoveControls?: boolean;
}

const Panel = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.surfaces.panel.background};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 1rem;
  z-index: 10;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }
`;

const MoveControlsContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 6px;
  padding: 0.25rem;
`;

const DirectionColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SmallButton = styled(Button)`
  padding: 0.5rem;
  min-width: auto;
`;

export function GamesControlPanel({
  roomId,
  className,
  onMovePlayer,
  onCenterView,
  showMoveControls,
}: GamesControlPanelProps) {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFullscreenToggle = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  }, []);

  const handleLeaveRoom = useCallback(() => {
    if (roomId && snapshot.userId) {
      gameSocket.emit('games.room.leave', { roomId, userId: snapshot.userId });
    }
    router.push('/games');
  }, [roomId, snapshot.userId, router]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    onMovePlayer?.(direction);
  };

  const handleCenterView = () => {
    onCenterView?.();
  };

  return (
    <Panel className={className} ref={containerRef}>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleFullscreenToggle}
        title={
          isFullscreen
            ? t('games.table.controlPanel.exitFullscreen')
            : t('games.table.controlPanel.enterFullscreen')
        }
      >
        {isFullscreen ? '⤓' : '⤢'} {t('games.table.controlPanel.fullscreen')}
      </Button>

      {showMoveControls && (
        <MoveControlsContainer>
          <SmallButton
            variant="secondary"
            size="sm"
            onClick={() => handleMove('up')}
            title={t('games.table.controlPanel.moveControls.shortcuts.up')}
          >
            ↑
          </SmallButton>
          <DirectionColumn>
            <SmallButton
              variant="secondary"
              size="sm"
              onClick={() => handleMove('left')}
              title={t('games.table.controlPanel.moveControls.shortcuts.left')}
            >
              ←
            </SmallButton>
            <SmallButton
              variant="secondary"
              size="sm"
              onClick={() => handleCenterView()}
              title={t(
                'games.table.controlPanel.moveControls.shortcuts.center',
              )}
            >
              ⚡
            </SmallButton>
            <SmallButton
              variant="secondary"
              size="sm"
              onClick={() => handleMove('right')}
              title={t('games.table.controlPanel.moveControls.shortcuts.right')}
            >
              →
            </SmallButton>
          </DirectionColumn>
          <SmallButton
            variant="secondary"
            size="sm"
            onClick={() => handleMove('down')}
            title={t('games.table.controlPanel.moveControls.shortcuts.down')}
          >
            ↓
          </SmallButton>
        </MoveControlsContainer>
      )}

      <Button variant="danger" size="sm" onClick={handleLeaveRoom}>
        🚪 {t('games.table.controlPanel.leaveRoom')}
      </Button>
    </Panel>
  );
}
