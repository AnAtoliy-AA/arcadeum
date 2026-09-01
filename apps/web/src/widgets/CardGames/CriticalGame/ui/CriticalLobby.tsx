'use client';

import React, { useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  type GameLobbyTheme,
  ReusableGameLobby,
  IconButton,
} from '@/features/games/ui/ReusableGameLobby';
import { LobbyOptionSection } from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { Typography } from '@arcadeum/ui';
import type { GameRoomSummary } from '@/shared/types/games';
import { CARD_VARIANTS, RANDOM_VARIANT } from '../lib/constants';
import { RulesModal } from './RulesModal';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

const getCriticalTheme = (variant?: string): GameLobbyTheme => {
  const variantConfig = CARD_VARIANTS.find((v) => v.id === variant);
  const gradient =
    variantConfig?.gradient ||
    'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)';

  return {
    titleGradient: gradient,
    variantGradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
    buttonGradient:
      'linear-gradient(135deg, #c7aa2f 0%, #c7aa2f 50%, #8B7500 100%)',
  };
};

const getVariantInfo = (variant?: string) => {
  if (variant === 'random') {
    return { name: RANDOM_VARIANT.name, emoji: RANDOM_VARIANT.emoji };
  }
  const variantConfig = CARD_VARIANTS.find((v) => v.id === variant);
  return {
    name: variantConfig?.name || 'Classic',
    emoji: variantConfig?.emoji || '🎲',
  };
};

export interface CriticalLobbyProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  isFullscreen: boolean;
  containerRef?: React.RefObject<HTMLElement | null>;
  onToggleFullscreen: () => void;
  onStartGame: (options?: { withBots?: boolean; botCount?: number }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onReinvite?: (userIds: string[]) => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onLeaveRoom?: () => void;
  onRefresh?: () => void;
  showRulesOpen?: boolean;
  onShowRulesClose?: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function CriticalLobby({
  room,
  userId,
  isHost,
  startBusy,
  isFullscreen,
  containerRef,
  onToggleFullscreen,
  onStartGame,
  onReorderPlayers,
  onReinvite,
  onDeleteRoom,
  onKickPlayer,
  onLeaveRoom,
  onRefresh,
  showRulesOpen,
  onShowRulesClose,
  t,
}: CriticalLobbyProps) {
  const [showRules, setShowRules] = useState(false);
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  const [ruleComingSoon, setRuleComingSoon] = useState<Map<string, boolean>>(
    new Map(),
  );

  const cardVariant =
    (room.gameOptions?.theme as string) ||
    (room.gameOptions?.cardVariant as string) ||
    (room.gameOptions?.variant as string) ||
    'adventure';
  const variantInfo = getVariantInfo(cardVariant);
  const theme = getCriticalTheme(cardVariant);
  const isFastMode = room.gameOptions?.idleTimerEnabled;

  const getSubtitleText = () => {
    if (room.status !== 'lobby') return t('games.table.lobby.gameLoading');
    if (room.playerCount === 1) return t('games.lobby.playWithBotsNotice');
    if (room.playerCount < 2) return t('games.table.lobby.needTwoPlayers');
    if (isHost) return t('games.table.lobby.hostCanStart');
    return t('games.table.lobby.waitingForHost');
  };

  const optionsSlot =
    room.status === 'lobby' ? (
      <LobbyOptionSection title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={cardVariant}
          onSelect={(themeId) =>
            setOption({
              theme: themeId,
              cardVariant: themeId,
              variant: themeId,
            })
          }
          disabled={!isHost}
        />
        {isHost ? (
          <div className="flex flex-row items-center gap-2 pt-2">
            <input
              type="checkbox"
              checked={
                !!(room.gameOptions as Record<string, unknown>)
                  ?.allowActionCardCombos
              }
              disabled={!!ruleComingSoon.get('combos')}
              onChange={(e) =>
                setOption({ allowActionCardCombos: e.target.checked })
              }
              aria-label={
                t('games.create.houseRuleActionCardCombos') ||
                'Action Card Combos'
              }
              className="w-4 h-4 cursor-pointer accent-[var(--primary)]"
            />
            <Typography
              uiSize="sm"
              className={cx(
                ruleComingSoon.get('combos') ? 'opacity-40' : 'opacity-100',
              )}
            >
              {t('games.create.houseRuleActionCardCombos') ||
                'Action Card Combos'}
            </Typography>
            {ruleComingSoon.get('combos') && (
              <Typography uiSize="xs" weight="600" className="text-[#f59e0b]">
                {t('games.create.comingSoon') || 'Coming Soon'}
              </Typography>
            )}
          </div>
        ) : null}
      </LobbyOptionSection>
    ) : null;

  const headerActionsSlot = (
    <IconButton onClick={() => setShowRules(true)} title="Game Rules">
      📖
    </IconButton>
  );

  return (
    <>
      <RulesModal
        isOpen={showRules || !!showRulesOpen}
        onClose={() => {
          setShowRules(false);
          onShowRulesClose?.();
        }}
        currentVariant={cardVariant}
        isFastMode={isFastMode}
        isPrivate={room.visibility === 'private'}
        t={t}
      />
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        isFullscreen={isFullscreen}
        // ReusableGameLobby.types accepts HTMLElement refs; HTMLElement
        // is not assignable to it, so narrow the ref type for the handoff.
        containerRef={containerRef as React.RefObject<never>}
        onToggleFullscreen={onToggleFullscreen}
        onStartGame={onStartGame}
        onReorderPlayers={onReorderPlayers}
        onReinvite={onReinvite}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onLeaveRoom={onLeaveRoom}
        onRefresh={onRefresh}
        gameName={t('games.critical_v1.name')}
        gameIcon="🐱💣"
        variantName={t(variantInfo.name as TranslationKey)}
        roomIcon={variantInfo.emoji}
        minPlayers={2}
        labels={{
          waitingLabel: t('games.table.lobby.waitingToStart'),
          subtitleText: getSubtitleText(),
          playersLabel: t('games.table.lobby.players'),
          hostControlsLabel: t('games.table.lobby.hostControls'),
          startLabel: t('games.table.actions.start'),
          startingLabel: t('games.table.actions.starting'),
          roomInfoLabel: t('games.table.lobby.roomInfo'),
          statusLabel: t('games.table.lobby.status'),
          visibilityLabel: t('games.table.lobby.visibility'),
          visibilityPublicLabel: t('games.table.lobby.visibilityPublic'),
          visibilityPrivateLabel: t('games.table.lobby.visibilityPrivate'),
          inviteCodeLabel: t('games.table.lobby.inviteCode'),
          waitingForPlayerLabel: t('games.table.lobby.waitingForPlayer'),
          invitedPlayersLabel: t('games.table.lobby.invitedPlayers'),
          declinedLabel: t('games.table.lobby.statusDeclined'),
          reinviteLabel: t('games.table.lobby.reinvite'),
          fastRoomLabel: t('games.rooms.fastRoom'),
          botCountLabel: t('games.lobby.botCountLabel'),
          startWithBotsLabel: t('games.lobby.startWithBots'),
        }}
        theme={theme}
        isFastMode={isFastMode}
        optionsSlot={optionsSlot}
        headerActionsSlot={headerActionsSlot}
        showFullscreenButton={true}
        showReorderControls={true}
        showInvitedPlayers={true}
        enableBots={true}
        onRuleComingSoonChange={setRuleComingSoon}
      />
    </>
  );
}
