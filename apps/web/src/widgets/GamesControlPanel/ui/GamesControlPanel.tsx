'use client';

import { useCallback, useState, useEffect, RefObject } from 'react';
import { useRouter } from 'next/navigation';
import { Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useTimedTrue } from '@/shared/hooks/useTimedTrue';
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
  onShowRules?: () => void;
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
  onShowRules,
}: GamesControlPanelProps) {
  const router = useRouter();

  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useTimedTrue(2000);
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
      setIsCopied();
    } catch {}
  };

  return (
    <XStack
      className={className}
      data-testid="games-control-panel"
      alignItems="center"
      justifyContent="flex-start"
      gap="$4"
      flexWrap="wrap"
      paddingVertical="$3"
      paddingHorizontal="$6"
      backgroundColor="$glassBg"
      borderRadius={16}
      borderWidth={1}
      borderColor="$glassBorder"
      position="relative"
      zIndex={50}
      $sm={{
        justifyContent: 'center',
        gap: '$2',
        paddingVertical: '$2',
        paddingHorizontal: '$4',
      }}
    >
      <Button
        variant="glass"
        size="sm"
        data-testid="fullscreen-button"
        onClick={handleFullscreenToggle}
        aria-label={
          isFullscreen
            ? t('games.table.controlPanel.exitFullscreen')
            : t('games.table.controlPanel.enterFullscreen')
        }
        title={
          isFullscreen
            ? t('games.table.controlPanel.exitFullscreen')
            : t('games.table.controlPanel.enterFullscreen')
        }
      >
        {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
        <Text $sm={{ display: 'none' }}>
          {' ' + t('games.table.controlPanel.fullscreen')}
        </Text>
      </Button>

      {onShowRules && (
        <Button
          variant="glass"
          size="sm"
          onClick={onShowRules}
          aria-label={t('games.table.controlPanel.rules') || 'Game Rules'}
          title={t('games.table.controlPanel.rules') || 'Game Rules'}
          data-testid="show-rules-button"
        >
          📖
          <Text $sm={{ display: 'none' }}>
            {' ' + (t('games.table.controlPanel.rules') || 'Rules')}
          </Text>
        </Button>
      )}

      {onToggleChat && (
        <Button
          variant="glass"
          size="sm"
          onPress={onToggleChat}
          data-testid="toggle-chat-button"
          aria-label={
            showChat ? t('games.table.chat.hide') : t('games.table.chat.show')
          }
        >
          💬
          <Text $sm={{ display: 'none' }}>
            {' ' +
              (showChat
                ? t('games.table.chat.hide')
                : t('games.table.chat.show'))}
          </Text>
        </Button>
      )}

      {showMoveControls && (
        <XStack
          gap="$1"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius={8}
          padding="$1"
          scale={1}
          $sm={{ scale: 0.9 }}
          data-testid="move-controls"
        >
          <Button
            variant="glass"
            size="sm"
            p="$1"
            minWidth={32}
            onClick={() => handleMove('up')}
            title={t('games.table.controlPanel.moveControls.shortcuts.up')}
            data-testid="move-up-button"
          >
            ↑
          </Button>
          <YStack gap="$1">
            <XStack gap="$1">
              <Button
                variant="glass"
                size="sm"
                p="$1"
                minWidth={32}
                onClick={() => handleMove('left')}
                title={t(
                  'games.table.controlPanel.moveControls.shortcuts.left',
                )}
                data-testid="move-left-button"
              >
                ←
              </Button>
              <Button
                variant="glass"
                size="sm"
                p="$1"
                minWidth={32}
                onClick={() => handleCenterView()}
                title={t(
                  'games.table.controlPanel.moveControls.shortcuts.center',
                )}
                data-testid="center-view-button"
              >
                ⚡
              </Button>
              <Button
                variant="glass"
                size="sm"
                p="$1"
                minWidth={32}
                onClick={() => handleMove('right')}
                title={t(
                  'games.table.controlPanel.moveControls.shortcuts.right',
                )}
                data-testid="move-right-button"
              >
                →
              </Button>
            </XStack>
          </YStack>
          <Button
            variant="glass"
            size="sm"
            p="$1"
            minWidth={32}
            onClick={() => handleMove('down')}
            title={t('games.table.controlPanel.moveControls.shortcuts.down')}
            data-testid="move-down-button"
          >
            ↓
          </Button>
        </XStack>
      )}

      <Button
        variant="glass"
        size="sm"
        onClick={handleCopyInviteLink}
        aria-label={
          isCopied
            ? t('games.common.copyInviteLinkCopied')
            : t('games.common.copyInviteLinkButton')
        }
        title={t('games.common.copyInviteLink') || 'Share Game Link'}
        data-testid="copy-invite-button"
      >
        {isCopied ? '✅' : '🔗'}
        <Text $sm={{ display: 'none' }}>
          {' ' +
            (isCopied
              ? t('games.common.copyInviteLinkCopied')
              : t('games.common.copyInviteLinkButton'))}
        </Text>
      </Button>

      <Button
        variant="glass"
        size="sm"
        onClick={handleExitRoom}
        aria-label={t('games.table.controlPanel.exitRoom') || 'Exit'}
        title={
          t('games.table.controlPanel.exitRoomTooltip') ||
          'Go back to lobby but stay in the game'
        }
        data-testid="exit-room-button"
      >
        🏃
        <Text $sm={{ display: 'none' }}>
          {' ' + (t('games.table.controlPanel.exitRoom') || 'Exit')}
        </Text>
      </Button>

      {snapshot.userId && (
        <Button
          variant="danger"
          size="sm"
          onClick={handleLeaveGame}
          aria-label={t('games.table.controlPanel.leaveRoom')}
          title={
            t('games.table.controlPanel.leaveGameTooltip') ||
            'Remove yourself from the game and return to lobby'
          }
          data-testid="leave-game-button"
        >
          🚪
          <Text $sm={{ display: 'none' }}>
            {' ' + t('games.table.controlPanel.leaveRoom')}
          </Text>
        </Button>
      )}

      <Modal open={showLeaveConfirm} onClose={() => setShowLeaveConfirm(false)}>
        <ModalContent maxWidth="400px">
          <ModalHeader onClose={() => setShowLeaveConfirm(false)}>
            <ModalTitle>{t('games.table.controlPanel.leaveRoom')}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <YStack padding="$4">
              <p>
                {t('games.table.controlPanel.leaveConfirmMessage') ||
                  'Are you sure you want to leave the game? You will be removed from the participants list.'}
              </p>
            </YStack>
          </ModalBody>
          <ModalFooter>
            <XStack gap="$3" justifyContent="flex-end">
              <Button
                variant="secondary"
                onClick={() => setShowLeaveConfirm(false)}
              >
                {t('games.common.cancel') || 'Cancel'}
              </Button>
              <Button variant="danger" onClick={handleConfirmLeave}>
                {t('games.table.controlPanel.leaveRoom')}
              </Button>
            </XStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </XStack>
  );
}
