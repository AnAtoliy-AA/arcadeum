'use client';

import { useCallback, useState, type RefObject } from 'react';
import { useRouter } from 'next/navigation';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useSoundSetting } from '@/shared/hooks/useSoundSetting';
import { useMusicSetting } from '@/shared/hooks/useMusicSetting';
import { gameSocket } from '@/shared/lib/socket';
import { useGameStore } from '@/features/games/store/gameStore';
import { useGameRematchStore } from '@/features/games/store/gameRematchStore';
import { useGameChatStore } from '@/widgets/GameChat';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { ConfirmationModal } from '@/features/games/ui/ConfirmationModal';
import {
  MaximizeIcon,
  MinimizeIcon,
  VolumeOnIcon,
  VolumeOffIcon,
  MusicOnIcon,
  MusicOffIcon,
} from '@arcadeum/ui';
import { Button } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
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
  onShowTutorial?: () => void;
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
  isSpectating?: boolean;
  isGameOver?: boolean;
  onRematch?: () => void;
  rematchLoading?: boolean;
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
    onShowTutorial,
    isFullscreen,
    toggleFullscreen,
    isSpectating,
    isGameOver,
    onRematch,
    rematchLoading,
  } = props;

  const { snapshot } = useSessionTokens();
  const { soundEnabled, setSoundEnabled } = useSoundSetting();
  const { musicEnabled, setMusicEnabled } = useMusicSetting();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const rematchStoreIsGameOver = useGameRematchStore((s) => s.isGameOver);
  const rematchStoreOnRematch = useGameRematchStore((s) => s.onRematch);
  const rematchStoreLoading = useGameRematchStore((s) => s.rematchLoading);
  const chatPanelOpen = useGameChatStore((s) => s.chatPanelOpen);
  const setChatPanelOpen = useGameChatStore((s) => s.setChatPanelOpen);

  const effectiveIsGameOver = isGameOver || rematchStoreIsGameOver;
  const effectiveOnRematch = onRematch || rematchStoreOnRematch;
  const effectiveRematchLoading = rematchLoading || rematchStoreLoading;
  const isChatVisible = showChat !== undefined ? showChat : chatPanelOpen;
  const handleToggleChat =
    onToggleChat ?? (() => setChatPanelOpen(!chatPanelOpen));

  const toggleMusic = useCallback(() => {
    setMusicEnabled(!musicEnabled);
  }, [musicEnabled, setMusicEnabled]);

  const handleLeaveGame = useCallback(() => {
    if (isSpectating) {
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
    useGameStore.setState({ room: null, session: null });
    router.push('/games');
  }, [router]);

  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    onMovePlayer?.(direction);
  };

  const handleCenterView = () => {
    onCenterView?.();
  };

  return (
    <div
      className={cx(
        'relative z-[10] flex flex-row items-center justify-between gap-3 max-[800px]:gap-2 max-[800px]:py-2 max-[800px]:px-3 py-2 px-4 bg-[var(--glassBg)] rounded-2xl border border-[var(--glassBorderStrong)] backdrop-blur-md',
        className,
      )}
      data-testid="games-control-panel"
    >
      <div className="flex flex-row items-center gap-1.5 shrink-0 flex-wrap">
        {isSpectating && (
          <div
            className="flex flex-row bg-[rgba(56,_189,_248,_0.15)] border-[rgba(56,_189,_248,_0.4)] border px-2.5 py-1 rounded-full items-center gap-1.5 mr-1"
            aria-label="Spectating mode"
            data-testid="spectating-indicator"
          >
            <span
              role="status"
              aria-live="polite"
              data-testid="spectator-mode-pill"
              className="flex items-center gap-1.5"
            >
              <span className="text-[13px]">👁️</span>
              <span className="text-[10px] font-extrabold text-[#0284c7] uppercase tracking-wider hidden sm:inline">
                {t('games.table.controlPanel.spectating') || 'Spectating'}
              </span>
            </span>
          </div>
        )}

        <Button
          className="w-9 h-9 !p-0 shrink-0"
          variant="glass"
          size="sm"
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
        </Button>

        <Button
          className={cx(
            'w-9 h-9 !p-0 shrink-0',
            soundEnabled &&
              '!border-[var(--primary)] !bg-[color:color-mix(in_srgb,var(--primary)_15%,transparent)]',
          )}
          variant="glass"
          size="sm"
          aria-pressed={soundEnabled}
          onClick={() => setSoundEnabled(!soundEnabled)}
          aria-label={t('settings.soundLabel')}
          title={t('settings.soundLabel')}
          data-testid="sound-toggle-button"
        >
          {soundEnabled ? (
            <VolumeOnIcon size={16} />
          ) : (
            <VolumeOffIcon size={16} />
          )}
        </Button>

        <Button
          className={cx(
            'w-9 h-9 !p-0 shrink-0',
            musicEnabled &&
              '!border-[var(--primary)] !bg-[color:color-mix(in_srgb,var(--primary)_15%,transparent)]',
          )}
          variant="glass"
          size="sm"
          aria-pressed={musicEnabled}
          onClick={toggleMusic}
          aria-label={t('settings.musicLabel')}
          title={t('settings.musicLabel')}
          data-testid="music-toggle-button"
        >
          {musicEnabled ? (
            <MusicOnIcon size={16} />
          ) : (
            <MusicOffIcon size={16} />
          )}
        </Button>

        <Button
          className={cx(
            'w-9 h-9 !p-0 shrink-0',
            isChatVisible &&
              '!border-[var(--primary)] !bg-[color:color-mix(in_srgb,var(--primary)_15%,transparent)]',
          )}
          variant="glass"
          size="sm"
          onClick={handleToggleChat}
          data-testid="toggle-chat-button"
          aria-label={
            isChatVisible
              ? t('games.table.chat.hide')
              : t('games.table.chat.show')
          }
          title={
            isChatVisible
              ? t('games.table.chat.hide')
              : t('games.table.chat.show')
          }
        >
          💬
        </Button>

        {(onShowRules || onShowTutorial) && (
          <div className="h-5 w-px bg-white/10 mx-0.5 hidden sm:block" />
        )}

        {onShowRules && (
          <Button
            className="w-9 h-9 !p-0 shrink-0"
            variant="glass"
            size="sm"
            onClick={onShowRules}
            aria-label={t('games.table.controlPanel.rules') || 'Game Rules'}
            title={t('games.table.controlPanel.rules') || 'Game Rules'}
            data-testid="show-rules-button"
          >
            📖
          </Button>
        )}

        {onShowTutorial && (
          <Button
            className="w-9 h-9 !p-0 shrink-0"
            variant="glass"
            size="sm"
            onClick={onShowTutorial}
            aria-label={t('games.tutorial.ui.button')}
            title={t('games.tutorial.ui.button')}
            data-testid="show-tutorial-button"
          >
            🎓
          </Button>
        )}
      </div>

      {showMoveControls && (
        <div
          className="flex flex-row items-stretch gap-1 border border-[var(--borderColor)] p-1 scale-[0.9]"
          data-testid="move-controls"
        >
          <Button
            className="p-[4px] min-w-[32px]"
            variant="glass"
            size="sm"
            onClick={() => handleMove('up')}
            title={t('games.table.controlPanel.moveControls.shortcuts.up')}
            data-testid="move-up-button"
          >
            ↑
          </Button>
          <div className="flex flex-col items-stretch gap-1">
            <div className="flex flex-row items-stretch gap-1">
              <Button
                className="p-[4px] min-w-[32px]"
                variant="glass"
                size="sm"
                onClick={() => handleMove('left')}
                title={t(
                  'games.table.controlPanel.moveControls.shortcuts.left',
                )}
                data-testid="move-left-button"
              >
                ←
              </Button>
              <Button
                className="p-[4px] min-w-[32px]"
                variant="glass"
                size="sm"
                onClick={() => handleCenterView()}
                title={t(
                  'games.table.controlPanel.moveControls.shortcuts.center',
                )}
                data-testid="center-view-button"
              >
                ⚡
              </Button>
              <Button
                className="p-[4px] min-w-[32px]"
                variant="glass"
                size="sm"
                onClick={() => handleMove('right')}
                title={t(
                  'games.table.controlPanel.moveControls.shortcuts.right',
                )}
                data-testid="move-right-button"
              >
                →
              </Button>
            </div>
          </div>
          <Button
            className="p-[4px] min-w-[32px]"
            variant="glass"
            size="sm"
            onClick={() => handleMove('down')}
            title={t('games.table.controlPanel.moveControls.shortcuts.down')}
            data-testid="move-down-button"
          >
            ↓
          </Button>
        </div>
      )}

      <div className="flex flex-row items-center gap-2 ml-auto shrink-0 flex-wrap">
        {effectiveIsGameOver && effectiveOnRematch && (
          <Button
            className="active:scale-[0.95] text-xs font-semibold px-3"
            variant="primary"
            size="sm"
            onClick={effectiveOnRematch}
            disabled={effectiveRematchLoading}
            data-testid="rematch-button"
          >
            🔄
            <span className="hidden sm:inline">
              {' ' +
                (effectiveRematchLoading
                  ? t('games.table.rematch.loading' as TranslationKey) ||
                    'Loading...'
                  : t('games.table.rematch.button' as TranslationKey) ||
                    'Play Again')}
            </span>
          </Button>
        )}

        {roomId && <ShareGameMenu roomId={roomId} inviteCode={inviteCode} />}

        <Button
          className="max-[640px]:px-2.5"
          variant="glass"
          size="sm"
          onClick={handleExitRoom}
          aria-label={
            t('games.table.controlPanel.exitRoom' as TranslationKey) || 'Exit'
          }
          title={
            t('games.table.controlPanel.exitRoomTooltip' as TranslationKey) ||
            'Go back to lobby but stay in the game'
          }
          data-testid="exit-room-button"
        >
          🏃
          <span className="hidden sm:inline">
            {' ' +
              (t('games.table.controlPanel.exitRoom' as TranslationKey) ||
                'Exit')}
          </span>
        </Button>

        {snapshot.userId && (
          <Button
            className="max-[640px]:px-2.5"
            variant="danger"
            size="sm"
            onClick={handleLeaveGame}
            aria-label={
              t('games.common.leaveRoom.button' as TranslationKey) ||
              'Leave Room'
            }
            title={
              t('games.table.controlPanel.leaveGameTooltip') ||
              'Remove yourself from the game and return to lobby'
            }
            data-testid="leave-game-button"
          >
            🚪
            <span className="hidden sm:inline">
              {' ' +
                (t('games.common.leaveRoom.button' as TranslationKey) ||
                  'Leave')}
            </span>
          </Button>
        )}
      </div>

      <ConfirmationModal
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleConfirmLeave}
        title={
          t('games.common.leaveRoom.confirmTitle' as TranslationKey) ||
          'Leave Room'
        }
        message={
          t('games.common.leaveRoom.confirmMessage' as TranslationKey) ||
          'Are you sure you want to leave this room?'
        }
        confirmLabel={
          t('games.common.leaveRoom.confirmButton' as TranslationKey) || 'Leave'
        }
        cancelLabel={t('games.common.cancel' as TranslationKey) || 'Cancel'}
      />
    </div>
  );
}
