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
import { useGameResultStore } from '@/features/games/store/gameResultStore';
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

  const hasResult = useGameResultStore((s) => s.hasResult);
  const toggleResult = useGameResultStore((s) => s.toggle);
  const rematchStoreIsGameOver = useGameRematchStore((s) => s.isGameOver);
  const rematchStoreOnRematch = useGameRematchStore((s) => s.onRematch);
  const rematchStoreLoading = useGameRematchStore((s) => s.rematchLoading);
  const chatPanelOpen = useGameChatStore((s) => s.chatPanelOpen);
  const setChatPanelOpen = useGameChatStore((s) => s.setChatPanelOpen);

  const effectiveIsGameOver = isGameOver || rematchStoreIsGameOver || hasResult;
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
      className={`flex flex-row items-center justify-start gap-4 flex-wrap max-[800px]:gap-2 max-[800px]:justify-center max-[800px]:py-2 max-[800px]:px-3 max-[800px]:rounded-[12px] py-3 px-6 bg-[var(--glassBg)] rounded-[16px] border border-[var(--glassBorderStrong)] ${className}`}
      data-testid="games-control-panel"
    >
      {isSpectating && (
        <div
          className="flex flex-row bg-[rgba(56,_189,_248,_0.15)] border-[rgba(56,_189,_248,_0.4)] border px-3 py-2 rounded-[20px] items-center gap-2"
          aria-label="Spectating mode"
          data-testid="spectating-indicator"
        >
          <span className="text-[14px]">👁️</span>
          <span className="text-[11px] font-extrabold text-[#0284c7] uppercase tracking-[1px]">
            {t('games.table.controlPanel.spectating') || 'Spectating'}
          </span>
        </div>
      )}

      <Button
        className="max-[640px]:scale-[0.9] max-[640px]:px-2"
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
        <span className="max-[800px]:hidden">
          {' ' + t('games.table.controlPanel.fullscreen')}
        </span>
      </Button>

      <Button
        className={cx(
          'max-[640px]:scale-[0.9] max-[640px]:px-2',
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
        <span className="max-[800px]:hidden">
          {' ' + t('settings.soundLabel')}
        </span>
      </Button>

      <Button
        className={cx(
          'max-[640px]:scale-[0.9] max-[640px]:px-2',
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
        {musicEnabled ? <MusicOnIcon size={16} /> : <MusicOffIcon size={16} />}
        <span className="max-[800px]:hidden">
          {' ' + t('settings.musicLabel')}
        </span>
      </Button>

      {onShowRules && (
        <Button
          className="max-[640px]:scale-[0.9] max-[640px]:px-2"
          variant="glass"
          size="sm"
          onClick={onShowRules}
          aria-label={t('games.table.controlPanel.rules') || 'Game Rules'}
          title={t('games.table.controlPanel.rules') || 'Game Rules'}
          data-testid="show-rules-button"
        >
          📖
          <span className="max-[800px]:hidden">
            {' ' + (t('games.table.controlPanel.rules') || 'Rules')}
          </span>
        </Button>
      )}

      {onShowTutorial && (
        <Button
          className="max-[640px]:scale-[0.9] max-[640px]:px-2"
          variant="glass"
          size="sm"
          onClick={onShowTutorial}
          aria-label={t('games.tutorial.ui.button')}
          title={t('games.tutorial.ui.button')}
          data-testid="show-tutorial-button"
        >
          🎓
          <span className="max-[800px]:hidden">
            {' ' + t('games.tutorial.ui.button')}
          </span>
        </Button>
      )}

      <Button
        className="max-[640px]:scale-[0.9] max-[640px]:px-2"
        variant="glass"
        size="sm"
        onClick={handleToggleChat}
        data-testid="toggle-chat-button"
        aria-label={
          isChatVisible
            ? t('games.table.chat.hide')
            : t('games.table.chat.show')
        }
      >
        💬
        <span className="max-[800px]:hidden">
          {' ' +
            (isChatVisible
              ? t('games.table.chat.hide')
              : t('games.table.chat.show'))}
        </span>
      </Button>

      {showMoveControls && (
        <div
          className="flex flex-row items-stretch gap-1 border border-[var(--borderColor)] p-1 scale-[1] max-[800px]:scale-[0.9]"
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

      {roomId && <ShareGameMenu roomId={roomId} inviteCode={inviteCode} />}

      {effectiveIsGameOver && (
        <Button
          className="max-[640px]:scale-[0.9] max-[640px]:px-2 active:scale-[0.95] !border-amber-500/50 !bg-amber-950/40 text-amber-300 hover:!bg-amber-900/60"
          variant="glass"
          size="sm"
          onClick={toggleResult}
          data-testid="show-game-result-button"
          aria-label={t('games.table.analytics.view') || 'Results'}
          title={t('games.table.analytics.view') || 'Results'}
        >
          🏆
          <span className="max-[800px]:hidden">
            {' ' + (t('games.table.analytics.view') || 'Results')}
          </span>
        </Button>
      )}

      {effectiveIsGameOver && effectiveOnRematch && (
        <Button
          className="max-[640px]:scale-[0.9] max-[640px]:px-2 active:scale-[0.95]"
          variant="primary"
          size="sm"
          onClick={effectiveOnRematch}
          disabled={effectiveRematchLoading}
          data-testid="rematch-button"
        >
          🔄
          <span className="max-[800px]:hidden">
            {' ' +
              (effectiveRematchLoading
                ? t(
                    'games.table.rematch.loading' as import('@/shared/lib/useTranslation').TranslationKey,
                  ) || 'Loading...'
                : t(
                    'games.table.rematch.button' as import('@/shared/lib/useTranslation').TranslationKey,
                  ) || 'Play Again')}
          </span>
        </Button>
      )}

      <Button
        className="max-[640px]:scale-[0.9] max-[640px]:px-2"
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
        <span className="max-[800px]:hidden">
          {' ' + (t('games.table.controlPanel.exitRoom') || 'Exit')}
        </span>
      </Button>

      {snapshot.userId && (
        <Button
          className="max-[640px]:scale-[0.9] max-[640px]:px-2"
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
          <span className="max-[800px]:hidden">
            {' ' + t('games.table.controlPanel.leaveRoom')}
          </span>
        </Button>
      )}

      <ConfirmationModal
        open={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleConfirmLeave}
        title={t('games.table.leaveGame' as TranslationKey) || 'Leave Game'}
        message={
          t('games.table.leaveGameConfirmation' as TranslationKey) ||
          'Are you sure you want to leave the game?'
        }
        confirmLabel={
          t('games.table.controlPanel.leaveRoom' as TranslationKey) || 'Leave'
        }
        cancelLabel={t('common.close' as TranslationKey) || 'Cancel'}
      />
    </div>
  );
}
