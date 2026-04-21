import {
  GameHeader,
  GameInfo,
  GameTitle,
  VariantIconBadge,
  HeaderActions,
  TimerControlsWrapper,
  FullscreenButton,
} from './styles/header';
import { appConfig } from '@/shared/config/app-config';
import { IdleTimerDisplay } from './IdleTimerDisplay';
import { AutoplayControls } from './AutoplayControls';
import { ServerLoadingNotice, MaximizeIcon, MinimizeIcon } from '@/shared/ui';
import type { GameRoomSummary, CriticalSnapshot } from '@/shared/types/games';
import { UseAutoplayReturn } from '../hooks/useAutoplay';
import { CARD_VARIANTS } from '../lib/constants';
import { RulesModal } from './RulesModal';
import React, { useState } from 'react';
import { useServerWakeUpProgress } from '@/shared/hooks/useServerWakeUpProgress';
import { TranslationKey } from '@/shared/lib/useTranslation';
import type { GameVariant } from '@arcadeum/ui';
import { YStack, Text } from 'tamagui';
import { getVariantStyles } from './styles/variants';

interface CriticalGameHeaderProps {
  room: GameRoomSummary;
  t: (key: string, params?: Record<string, string | number>) => string;
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
  isFullscreen,
  toggleFullscreen,
}: CriticalGameHeaderProps) {
  const cardVariant = room.gameOptions?.cardVariant;
  const [showRules, setShowRules] = useState(false);

  const { isLongPending, progress, elapsedSeconds } = useServerWakeUpProgress(
    Boolean(actionBusy),
  );

  const variantName = (() => {
    const variant = CARD_VARIANTS.find((v) => v.id === cardVariant);
    return variant
      ? t(variant.name as TranslationKey)
      : t('games.critical_v1.variants.cyberpunk.name' as TranslationKey);
  })();

  return (
    <GameHeader $variant={cardVariant as GameVariant}>
      <RulesModal
        isOpen={showRules}
        onClose={() => setShowRules(false)}
        currentVariant={cardVariant || 'default'}
        isFastMode={idleTimerEnabled}
        isPrivate={room.visibility === 'private'}
        t={t}
      />

      {/* Left: variant identity */}
      <GameInfo>
        <VariantIconBadge>
          <Text fontSize={15}>
            {CARD_VARIANTS.find((v) => v.id === cardVariant)?.emoji ?? '🎲'}
          </Text>
        </VariantIconBadge>

        <YStack gap={0} minWidth={0} flex={1}>
          <GameTitle numberOfLines={1}>
            <span
              className="text-gradient"
              style={{
                background: getVariantStyles(
                  cardVariant || 'default',
                ).header.getTitleBackground(),
              }}
            >
              {t('games.critical_v1.name')}
              {' · '}
              {variantName}
            </span>
          </GameTitle>

          <Text
            fontSize={11}
            opacity={0.45}
            numberOfLines={1}
            $sm={{ display: 'none' }}
          >
            {room.name}
            {idleTimerEnabled ? ' · ⚡' : ''}
          </Text>
        </YStack>
      </GameInfo>

      {/* Right: actions */}
      <HeaderActions>
        {isLongPending && (
          <ServerLoadingNotice
            title={t('common.loading.title')}
            message={t('common.loading.message')}
            progress={progress}
            elapsedSeconds={elapsedSeconds}
            supportLabel={t('common.support')}
            onSupportClick={() =>
              window.open(appConfig.supportCta.href, '_blank')
            }
          />
        )}

        {!isGameOver && currentPlayer && (
          <TimerControlsWrapper $sm={{ display: 'none' }}>
            <IdleTimerDisplay
              enabled={idleTimerEnabled}
              isMyTurn={isMyTurn}
              canAct={canAct}
              onTimeout={handleIdleTimeout}
              autoplayTriggered={idleTimerTriggered}
              onStop={handleStopAutoplay}
              t={t}
            />
            <AutoplayControls autoplayState={autoplayState} t={t} />
          </TimerControlsWrapper>
        )}

        <FullscreenButton onClick={() => setShowRules(true)} title="Game Rules">
          📖
        </FullscreenButton>

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
