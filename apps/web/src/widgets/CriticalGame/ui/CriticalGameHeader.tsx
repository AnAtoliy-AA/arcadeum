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
import { ServerLoadingNotice } from '@/shared/ui/ServerLoadingNotice';
import type { GameRoomSummary, CriticalSnapshot } from '@/shared/types/games';
import { UseAutoplayReturn } from '../hooks/useAutoplay';
import { CARD_VARIANTS } from '../lib/constants';
import { RulesModal } from './RulesModal';
import React, { useState } from 'react';
import { useServerWakeUpProgress } from '@/shared/hooks/useServerWakeUpProgress';
import { MaximizeIcon, MinimizeIcon } from '@/shared/ui';
import { TranslationKey } from '@/shared/lib/useTranslation';

interface CriticalGameHeaderProps {
  room: GameRoomSummary;
  t: (key: string, params?: Record<string, unknown>) => string;
  idleTimerEnabled: boolean;
  turnStatusVariant: 'completed' | 'yourTurn' | 'waiting' | 'default';
  turnStatusText: string;
  actionBusy: string | null;
  isGameOver: boolean;
  currentPlayer: CriticalSnapshot['players'][0] | undefined;
  canAct: boolean;
  isMyTurn: boolean;
  handleIdleTimeout: () => void;
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
  actionBusy,
  isGameOver,
  currentPlayer,
  canAct,
  isMyTurn,
  handleIdleTimeout,
  autoplayState,
  idleTimerTriggered,
  handleStopAutoplay,
  showChat,
  handleToggleChat,
  isFullscreen,
  toggleFullscreen,
}: CriticalGameHeaderProps) {
  const cardVariant = room.gameOptions?.cardVariant;
  const [showRules, setShowRules] = useState(true);

  const { isLongPending } = useServerWakeUpProgress(Boolean(actionBusy));

  return (
    <GameHeader $variant={cardVariant}>
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        currentVariant={cardVariant || 'default'}
        isFastMode={idleTimerEnabled}
        isPrivate={room.visibility === 'private'}
        t={t}
      />
      <GameInfo>
        <GameTitle>
          {t('games.critical_v1.name')}
          <span
            style={{
              background: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '0.8em',
            }}
          >
            :{' '}
            {(() => {
              const variant = CARD_VARIANTS.find(
                (v) => v.id === room.gameOptions?.cardVariant,
              );
              return variant
                ? t(variant.name as TranslationKey)
                : t(
                    'games.critical_v1.variants.cyberpunk.name' as TranslationKey,
                  ); // Fallback to default variant name instead of 'Classic'
            })()}
          </span>
        </GameTitle>
        <RoomNameBadge>
          <RoomNameIcon>
            {CARD_VARIANTS.find((v) => v.id === room.gameOptions?.cardVariant)
              ?.emoji || '🎲'}
          </RoomNameIcon>
          <RoomNameText>{room.name}</RoomNameText>
        </RoomNameBadge>
        {idleTimerEnabled && (
          <FastBadge>
            <span>⚡</span>
            <span>{t('games.rooms.fastRoom')}</span>
          </FastBadge>
        )}
        <TurnStatus $variant={turnStatusVariant}>{turnStatusText}</TurnStatus>
        {isLongPending && <ServerLoadingNotice actionBusy={actionBusy} />}
      </GameInfo>
      <HeaderActions>
        <FullscreenButton
          onClick={() => setShowRules(true)}
          title="Game Rules"
          style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}
        >
          📖
        </FullscreenButton>
        {!isGameOver && currentPlayer && (
          <TimerControlsWrapper>
            <IdleTimerDisplay
              enabled={idleTimerEnabled}
              isMyTurn={isMyTurn}
              canAct={canAct}
              onTimeout={handleIdleTimeout}
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
          {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
        </FullscreenButton>
      </HeaderActions>
    </GameHeader>
  );
}
