'use client';

import { useCallback, useState, type RefObject } from 'react';
import { useRouter } from 'next/navigation';
import { Text } from 'tamagui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useSoundSetting } from '@/shared/hooks/useSoundSetting';
import { useMusicSetting } from '@/shared/hooks/useMusicSetting';
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
} from '@arcadeum/ui';
import { Button, XStack, YStack } from '@arcadeum/ui';
import { ShareGameMenu } from './ShareGameMenu';

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
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
  isSpectating?: boolean;
}

export function GamesControlPanel(props: GamesControlPanelProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    roomId,
    inviteCode,
    className,
    onMovePlayer,
    onCenterView,
    showMoveControls,
    showChat,
    onToggleChat,
    onShowRules,
    isFullscreen,
    toggleFullscreen,
    isSpectating,
  } = props;

  const { snapshot } = useSessionTokens();
  const { soundEnabled, setSoundEnabled } = useSoundSetting();
  const { musicEnabled, setMusicEnabled } = useMusicSetting();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleLeaveGame = useCallback(() => {
    if (isSpectating) {
      // If spectating, we can just leave the room UI
      router.push('/games');
      return;
    }
    setShowLeaveConfirm(true);
  }, [isSpectating, router]);

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

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    onMovePlayer?.(direction);
  };

  const handleCenterView = () => {
    onCenterView?.();
  };

  return (
    <XStack
      className={className}
      data-testid="games-control-panel"
      alignItems="center"
      justifyContent="flex-start"
      gap="$4"
      flexWrap="wrap"
      $sm={{
        gap: '$2',
        justifyContent: 'center',
        paddingVertical: '$2',
        paddingHorizontal: '$3',
        borderRadius: 12,
      }}
      paddingVertical="$3"
      paddingHorizontal="$6"
      backgroundColor="$glassBg"
      borderRadius={16}
      borderWidth={1}
      borderColor="$glassBorder"
      position="relative"
      zIndex={50}
    >
      {isSpectating && (
        <XStack
          backgroundColor="rgba(56, 189, 248, 0.15)"
          borderColor="rgba(56, 189, 248, 0.4)"
          borderWidth={1}
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius={20}
          alignItems="center"
          gap="$2"
          aria-label="Spectating mode"
          data-testid="spectating-indicator"
        >
          <Text fontSize={14}>👁️</Text>
          <Text
            fontSize={11}
            fontWeight="800"
            color="$blue10"
            textTransform="uppercase"
            letterSpacing={1}
          >
            {t('games.table.controlPanel.spectating') || 'Spectating'}
          </Text>
        </XStack>
      )}

      <Button
        variant="glass"
        size="sm"
        $sm={{ scale: 0.9, paddingHorizontal: '$2' }}
        data-testid="fullscreen-button"
        onClick={toggleFullscreen}
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

      <Button
        variant="glass"
        size="sm"
        $sm={{ scale: 0.9, paddingHorizontal: '$2' }}
        isActive={soundEnabled}
        aria-pressed={soundEnabled}
        onClick={() => setSoundEnabled(!soundEnabled)}
        aria-label={t('settings.soundLabel')}
        title={t('settings.soundLabel')}
        data-testid="sound-toggle-button"
      >
        {soundEnabled ? '🔊' : '🔇'}
        <Text $sm={{ display: 'none' }}>{' ' + t('settings.soundLabel')}</Text>
      </Button>

      <Button
        variant="glass"
        size="sm"
        $sm={{ scale: 0.9, paddingHorizontal: '$2' }}
        isActive={musicEnabled}
        aria-pressed={musicEnabled}
        onClick={() => setMusicEnabled(!musicEnabled)}
        aria-label={t('settings.musicLabel')}
        title={t('settings.musicLabel')}
        data-testid="music-toggle-button"
      >
        {musicEnabled ? '🎵' : '🔕'}
        <Text $sm={{ display: 'none' }}>{' ' + t('settings.musicLabel')}</Text>
      </Button>

      {onShowRules && (
        <Button
          variant="glass"
          size="sm"
          $sm={{ scale: 0.9, paddingHorizontal: '$2' }}
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
          $sm={{ scale: 0.9, paddingHorizontal: '$2' }}
          onClick={onToggleChat}
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

      {roomId && <ShareGameMenu roomId={roomId} inviteCode={inviteCode} />}

      <Button
        variant="glass"
        size="sm"
        $sm={{ scale: 0.9, paddingHorizontal: '$2' }}
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
          $sm={{ scale: 0.9, paddingHorizontal: '$2' }}
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
        <ModalContent maxWidth="420px">
          <ModalHeader onClose={() => setShowLeaveConfirm(false)}>
            <ModalTitle>{t('games.table.controlPanel.leaveRoom')}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <YStack gap="$4" alignItems="center" paddingVertical="$4">
              <YStack
                width={80}
                height={80}
                borderRadius={40}
                backgroundColor="rgba(239, 68, 68, 0.1)"
                alignItems="center"
                justifyContent="center"
                marginBottom="$2"
              >
                <Text fontSize={32}>🚪</Text>
              </YStack>
              <Text
                textAlign="center"
                fontSize={16}
                lineHeight={24}
                opacity={0.8}
                fontWeight="500"
              >
                {t('games.table.controlPanel.leaveConfirmMessage') ||
                  'Are you sure you want to leave the game? You will be removed from the participants list.'}
              </Text>
            </YStack>
          </ModalBody>
          <ModalFooter>
            <XStack gap="$3" justifyContent="center" width="100%">
              <Button
                variant="secondary"
                size="lg"
                flex={1}
                onClick={() => setShowLeaveConfirm(false)}
                borderRadius={12}
              >
                {t('games.common.cancel') || 'Cancel'}
              </Button>
              <Button
                variant="danger"
                size="lg"
                flex={1}
                onClick={handleConfirmLeave}
                borderRadius={12}
              >
                {t('games.table.controlPanel.leaveRoom')}
              </Button>
            </XStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </XStack>
  );
}
