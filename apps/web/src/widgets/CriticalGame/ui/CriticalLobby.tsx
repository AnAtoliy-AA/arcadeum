'use client';

import React, { useState } from 'react';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
  IconButton,
} from '@/features/games/ui/ReusableGameLobby';
import type { GameRoomSummary } from '@/shared/types/games';
import { CARD_VARIANTS, RANDOM_VARIANT, GAME_VARIANT } from '../lib/constants';
import { VariantSelector } from './VariantSelector';
import { RulesModal } from './RulesModal';
import { VariantSelectorWrapper } from './styles/lobby';

// Get theme based on card variant
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

// Get variant display info
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
  isHost: boolean;
  startBusy: boolean;
  isFullscreen: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onToggleFullscreen: () => void;
  onStartGame: (options?: { withBots?: boolean }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onReinvite?: (userIds: string[]) => void;
  t: (key: string) => string;
}

export function CriticalLobby({
  room,
  isHost,
  startBusy,
  isFullscreen,
  containerRef,
  onToggleFullscreen,
  onStartGame,
  onReorderPlayers,
  onReinvite,
  t,
}: CriticalLobbyProps) {
  const [showRules, setShowRules] = useState(false);

  const cardVariant = room.gameOptions?.cardVariant || GAME_VARIANT.CYBERPUNK;
  const variantInfo = getVariantInfo(cardVariant);
  const theme = getCriticalTheme(cardVariant);
  const isFastMode = room.gameOptions?.idleTimerEnabled;

  // Subtitle text helper
  const getSubtitleText = () => {
    if (room.status !== 'lobby') return t('games.table.lobby.gameLoading');
    // If 1 player, we can start with bots
    if (room.playerCount === 1) return 'Play with bots or invite friends';
    // If < 2 players (0?), shouldn't happen but fallback
    if (room.playerCount < 2) return t('games.table.lobby.needTwoPlayers');
    if (isHost) return t('games.table.lobby.hostCanStart');
    return t('games.table.lobby.waitingForHost');
  };

  // Variant selector for host
  const optionsSlot =
    isHost && room.status === 'lobby' ? (
      <VariantSelectorWrapper>
        <VariantSelector roomId={room.id} currentVariant={cardVariant} />
      </VariantSelectorWrapper>
    ) : null;

  // Rules button
  const headerActionsSlot = (
    <IconButton
      onClick={() => setShowRules(true)}
      title="Game Rules"
      style={{ fontSize: '1.2rem' }}
    >
      📖
    </IconButton>
  );

  // Rules modal
  const rulesModalSlot = (
    <RulesModal
      isOpen={showRules}
      onClose={() => setShowRules(false)}
      currentVariant={cardVariant}
      isFastMode={isFastMode}
      isPrivate={room.visibility === 'private'}
      t={t}
    />
  );

  return (
    <ReusableGameLobby
      room={room}
      isHost={isHost}
      startBusy={startBusy}
      isFullscreen={isFullscreen}
      containerRef={containerRef}
      onToggleFullscreen={onToggleFullscreen}
      onStartGame={onStartGame}
      onReorderPlayers={onReorderPlayers}
      onReinvite={onReinvite}
      // Game info
      gameName="Critical"
      gameIcon="🐱💣"
      variantName={variantInfo.name}
      roomIcon={variantInfo.emoji}
      minPlayers={2}
      // Labels using translations
      waitingLabel={t('games.table.lobby.waitingToStart')}
      subtitleText={getSubtitleText()}
      playersLabel={t('games.table.lobby.players')}
      hostControlsLabel={t('games.table.lobby.hostControls')}
      startLabel={t('games.table.actions.start')}
      startingLabel={t('games.table.actions.starting')}
      roomInfoLabel={t('games.table.lobby.roomInfo')}
      statusLabel={t('games.table.lobby.status')}
      statusWaitingLabel={t('games.table.lobby.statusWaiting')}
      statusActiveLabel={t('games.table.lobby.statusActive')}
      visibilityLabel={t('games.table.lobby.visibility')}
      visibilityPublicLabel={t('games.table.lobby.visibilityPublic')}
      visibilityPrivateLabel={t('games.table.lobby.visibilityPrivate')}
      inviteCodeLabel={t('games.table.lobby.inviteCode')}
      waitingForPlayerLabel={t('games.table.lobby.waitingForPlayer')}
      invitedPlayersLabel={t('games.table.lobby.invitedPlayers')}
      declinedLabel={t('games.table.lobby.statusDeclined')}
      reinviteLabel={t('games.table.lobby.reinvite')}
      fastRoomLabel={t('games.rooms.fastRoom')}
      // Theme
      theme={theme}
      isFastMode={isFastMode}
      // Slots
      optionsSlot={optionsSlot}
      headerActionsSlot={headerActionsSlot}
      rulesModalSlot={rulesModalSlot}
      // Features
      showFullscreenButton={true}
      showReorderControls={true}
      showInvitedPlayers={true}
      enableBots={true}
    />
  );
}
