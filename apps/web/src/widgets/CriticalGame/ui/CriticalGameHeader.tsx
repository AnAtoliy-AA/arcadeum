import {
  GameHeader,
  GameInfo,
  GameTitle,
  TurnStatus,
  HeaderActions,
  TimerControlsWrapper,
  ChatToggleButton,
  FullscreenButton,
} from './styles';
import {
  RoomNameBadge,
  RoomNameIcon,
  RoomNameText,
  FastBadge,
} from './styles/lobby';
import { IdleTimerDisplay } from './IdleTimerDisplay';
import { AutoplayControls } from './AutoplayControls';
import { ServerLoadingNotice } from './ServerLoadingNotice';
import type { GameRoomSummary, CriticalSnapshot } from '@/shared/types/games';
import { UseAutoplayReturn } from '../hooks/useAutoplay';

interface CriticalGameHeaderProps {
  room: GameRoomSummary;
  t: (key: string, params?: Record<string, unknown>) => string;
  idleTimerEnabled: boolean;
  turnStatusVariant: 'completed' | 'yourTurn' | 'waiting' | 'default';
  turnStatusText: string;
  actionLongPending: boolean;
  pendingProgress: number;
  pendingElapsedSeconds: number;
  isGameOver: boolean;
  currentPlayer: CriticalSnapshot['players'][0] | undefined;
  idleTimer: {
    secondsRemaining: number;
    isActive: boolean;
    isRunning: boolean;
    reset: () => void;
  };
  autoplayState: UseAutoplayReturn;
  idleTimerTriggered: boolean;
  handleStopAutoplay: () => void;
  showChat: boolean;
  handleToggleChat: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

export function CriticalGameHeader({
  room,
  t,
  idleTimerEnabled,
  turnStatusVariant,
  turnStatusText,
  actionLongPending,
  pendingProgress,
  pendingElapsedSeconds,
  isGameOver,
  currentPlayer,
  idleTimer,
  autoplayState,
  idleTimerTriggered,
  handleStopAutoplay,
  showChat,
  handleToggleChat,
  isFullscreen,
  toggleFullscreen,
}: CriticalGameHeaderProps) {
  return (
    <GameHeader>
      <GameInfo>
        <GameTitle>{t('games.critical_v1.name')}</GameTitle>
        <RoomNameBadge>
          <RoomNameIcon>🎲</RoomNameIcon>
          <RoomNameText>{room.name}</RoomNameText>
        </RoomNameBadge>
        {idleTimerEnabled && (
          <FastBadge>
            <span>⚡</span>
            <span>{t('games.rooms.fastRoom')}</span>
          </FastBadge>
        )}
        <TurnStatus $variant={turnStatusVariant}>{turnStatusText}</TurnStatus>
        {actionLongPending && (
          <ServerLoadingNotice
            pendingProgress={pendingProgress}
            pendingElapsedSeconds={pendingElapsedSeconds}
          />
        )}
      </GameInfo>
      <HeaderActions>
        {!isGameOver && currentPlayer && (
          <TimerControlsWrapper>
            <IdleTimerDisplay
              secondsRemaining={idleTimer.secondsRemaining}
              isActive={idleTimer.isActive && !autoplayState.allEnabled}
              isRunning={idleTimer.isRunning}
              autoplayTriggered={idleTimerTriggered}
              onStop={handleStopAutoplay}
              t={t}
            />
            <AutoplayControls
              autoplayState={autoplayState}
              t={t as (key: string) => string}
            />
          </TimerControlsWrapper>
        )}
        <ChatToggleButton
          type="button"
          onClick={handleToggleChat}
          $active={showChat}
        >
          {showChat ? t('games.table.chat.hide') : t('games.table.chat.show')}
        </ChatToggleButton>
        <FullscreenButton
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? '⤓' : '⤢'}
        </FullscreenButton>
      </HeaderActions>
    </GameHeader>
  );
}
