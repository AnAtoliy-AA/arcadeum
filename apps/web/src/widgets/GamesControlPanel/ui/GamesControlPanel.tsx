'use client';

import { useCallback, useState, useEffect, RefObject } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/shared/lib/useTranslation';
import { gameSocket } from '@/shared/lib/socket';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  MaximizeIcon,
  MinimizeIcon,
} from '@/shared/ui';
import { Button, XStack, YStack } from '@arcadeum/ui';

interface GamesControlPanelProps {
  roomId?: string;
  inviteCode?: string;
  className?: string;
  onMovePlayer?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onCenterView?: () => void;
  showMoveControls?: boolean;
  fullscreenContainerRef?: RefObject<HTMLDivElement | null>;
  showChat?: boolean;
  onToggleChat?: () => void;
}

export function GamesControlPanel({
  roomId,
  inviteCode,
  className,
  onMovePlayer,
  onCenterView,
  showMoveControls,
  fullscreenContainerRef,
  showChat,
  onToggleChat,
}: GamesControlPanelProps) {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleFullscreenToggle = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        const element =
          fullscreenContainerRef?.current || document.documentElement;
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {}
  }, [fullscreenContainerRef]);

  const handleLeaveGame = useCallback(() => {
    setShowLeaveConfirm(true);
  }, []);

  const handleConfirmLeave = useCallback(() => {
    if (roomId && snapshot.userId) {
      gameSocket.emit(
        'games.room.leave',
        { roomId, userId: snapshot.userId },
        () => {
          router.push('/games');
        },
      );
    } else {
      router.push('/games');
    }
    setShowLeaveConfirm(false);
  }, [roomId, snapshot.userId, router]);

  const handleExitRoom = useCallback(() => {
    router.push('/games');
  }, [router]);

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

  const handleCopyInviteLink = async () => {
    if (!roomId) return;
    const origin = window.location.origin;
    const url = `${origin}/games/rooms/${roomId}${inviteCode ? `?inviteCode=${inviteCode}` : ''}`;
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
    } catch {}
  };

  return (
    <XStack
      className={className}
      alignItems="center"
      gap="$4"
      paddingVertical="$3"
      paddingHorizontal="$6"
      backgroundColor="rgba(15,23,42,0.95)"
      borderRadius={14}
      borderWidth={1}
      borderColor="rgba(99,102,241,0.2)"
      position="relative"
      zIndex={50}
    >
      <Button
        variant="glass"
        size="sm"
        onClick={handleFullscreenToggle}
        title={
          isFullscreen
            ? t('games.table.controlPanel.exitFullscreen')
            : t('games.table.controlPanel.enterFullscreen')
        }
      >
        {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}{' '}
        {t('games.table.controlPanel.fullscreen')}
      </Button>

      {onToggleChat && (
        <Button variant="glass" size="sm" onPress={onToggleChat}>
          💬{' '}
          {showChat ? t('games.table.chat.hide') : t('games.table.chat.show')}
        </Button>
      )}

      {showMoveControls && (
        <XStack
          gap="$1"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius={6}
          padding="$1"
        >
          <Button
            variant="glass"
            size="sm"
            p="$2"
            minWidth="auto"
            onClick={() => handleMove('up')}
            title={t('games.table.controlPanel.moveControls.shortcuts.up')}
          >
            ↑
          </Button>
          <YStack gap="$1">
            <Button
              variant="glass"
              size="sm"
              p="$2"
              minWidth="auto"
              onClick={() => handleMove('left')}
              title={t('games.table.controlPanel.moveControls.shortcuts.left')}
            >
              ←
            </Button>
            <Button
              variant="glass"
              size="sm"
              p="$2"
              minWidth="auto"
              onClick={() => handleCenterView()}
              title={t(
                'games.table.controlPanel.moveControls.shortcuts.center',
              )}
            >
              ⚡
            </Button>
            <Button
              variant="glass"
              size="sm"
              p="$2"
              minWidth="auto"
              onClick={() => handleMove('right')}
              title={t('games.table.controlPanel.moveControls.shortcuts.right')}
            >
              →
            </Button>
          </YStack>
          <Button
            variant="glass"
            size="sm"
            p="$2"
            minWidth="auto"
            onClick={() => handleMove('down')}
            title={t('games.table.controlPanel.moveControls.shortcuts.down')}
          >
            ↓
          </Button>
        </XStack>
      )}

      <Button
        variant="glass"
        size="sm"
        onClick={handleCopyInviteLink}
        title={t('games.common.copyInviteLink') || 'Share Game Link'}
      >
        {isCopied
          ? '✅ ' + t('games.common.copyInviteLinkCopied')
          : '🔗 ' + t('games.common.copyInviteLinkButton')}
      </Button>

      <Button
        variant="glass"
        size="sm"
        onClick={handleExitRoom}
        title={
          t('games.table.controlPanel.exitRoomTooltip') ||
          'Go back to lobby but stay in the game'
        }
      >
        🏃 {t('games.table.controlPanel.exitRoom') || 'Exit'}
      </Button>

      {snapshot.userId && (
        <Button
          variant="danger"
          size="sm"
          onClick={handleLeaveGame}
          title={
            t('games.table.controlPanel.leaveGameTooltip') ||
            'Remove yourself from the game and return to lobby'
          }
        >
          🚪 {t('games.table.controlPanel.leaveRoom')}
        </Button>
      )}

      <Modal open={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)}>
        <ModalContent maxWidth="400px">
          <ModalHeader onClose={() => setShowLeaveConfirm(false)}>
            <ModalTitle>{t('games.table.controlPanel.leaveRoom')}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>
              {t('games.table.controlPanel.leaveConfirmMessage') ||
                'Are you sure you want to leave the game? You will be removed from the participants list.'}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="secondary"
              onClick={() => setShowLeaveConfirm(false)}
            >
              {t('games.common.cancel') || 'Cancel'}
            </Button>
            <Button variant="danger" onClick={handleConfirmLeave}>
              {t('games.table.controlPanel.leaveRoom')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </XStack>
  );
}
