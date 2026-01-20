'use client';

import { useCallback, useState, useEffect, RefObject } from 'react';
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
  fullscreenContainerRef?: RefObject<HTMLDivElement | null>;
}

const Panel = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.surfaces.panel.background}f5,
    ${({ theme }) => theme.surfaces.card.background}e8
  );
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.surfaces.panel.border}60;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.15),
    0 4px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 1rem;
  z-index: 50;
  backdrop-filter: blur(16px);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(99, 102, 241, 0.3) 25%,
      rgba(236, 72, 153, 0.3) 50%,
      rgba(16, 185, 129, 0.3) 75%,
      transparent 100%
    );
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    gap: 0.5rem;
    border-radius: 10px;
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

const StyledFullscreenButton = styled(Button)`
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.text.primary};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;

  &:hover {
    background: ${({ theme }) => theme.surfaces.card.background};
    border-color: ${({ theme }) => theme.buttons.primary.gradientStart};
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
    color: ${({ theme }) => theme.buttons.primary.gradientStart};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export function GamesControlPanel({
  roomId,
  className,
  onMovePlayer,
  onCenterView,
  showMoveControls,
  fullscreenContainerRef,
}: GamesControlPanelProps) {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenToggle = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        // Use provided container ref, or fall back to document element
        const element =
          fullscreenContainerRef?.current || document.documentElement;
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  }, [fullscreenContainerRef]);

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
    <Panel className={className}>
      <StyledFullscreenButton
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
      </StyledFullscreenButton>

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
