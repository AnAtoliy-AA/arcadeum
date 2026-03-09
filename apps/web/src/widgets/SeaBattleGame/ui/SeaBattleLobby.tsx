'use client';

import React from 'react';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
} from '@/features/games/ui/ReusableGameLobby';
import type { GameRoomSummary } from '@/shared/types/games';
import { MIN_PLAYERS } from '../types';
import { SEA_BATTLE_VARIANTS } from '../lib/constants';
import { VariantSelector } from './VariantSelector';
import styled from 'styled-components';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { IconButton } from '@/features/games/ui/ReusableGameLobby';
import { VARIANT_THEMES } from '../lib/theme';

const VariantSelectorWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-left: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-left: 0;
    width: 100%;
  }
`;

const ColorPreviewContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
    justify-content: space-between;
  }
`;

const ColorItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ColorSwatch = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: ${(props) => props.$color};
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ColorLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.secondary};
  white-space: nowrap;
`;

const getSeaBattleTheme = (variantId?: string): GameLobbyTheme => {
  const variant = SEA_BATTLE_VARIANTS.find((v) => v.id === variantId);
  const gradient =
    variant?.gradient ||
    'linear-gradient(135deg, #3498db 0%, #2980b9 50%, #1abc9c 100%)';

  return {
    titleGradient: gradient,
    variantGradient: gradient,
    buttonGradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
  };
};

const getVariantInfo = (variantId?: string) => {
  const variant = SEA_BATTLE_VARIANTS.find((v) => v.id === variantId);
  return {
    name: variant?.name,
    emoji: variant?.emoji,
  };
};

interface SeaBattleLobbyProps {
  room: GameRoomSummary;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (options?: { withBots?: boolean; botCount?: number }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onShowRules: (show: boolean) => void;
  onDeleteRoom?: () => void;
  onRefresh?: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function SeaBattleLobby({
  room,
  isHost,
  startBusy,
  onStartGame,
  onReorderPlayers,
  onShowRules,
  onDeleteRoom,
  onRefresh,
  t,
}: SeaBattleLobbyProps) {
  const roomVariant = (room.gameOptions?.variant as string) || 'classic';
  const [selectedVariant, setSelectedVariant] = React.useState(roomVariant);

  // Sync with room variant when it changes from server
  React.useEffect(() => {
    setSelectedVariant(roomVariant);
  }, [roomVariant]);

  const theme = getSeaBattleTheme(selectedVariant);
  const variantInfo = getVariantInfo(selectedVariant);

  const getSubtitleText = () => {
    if (room.status !== 'lobby') return t('games.roomPage.errors.loadingRoom');
    if (room.playerCount === 1) return t('games.lobby.playWithBotsNotice');
    if (room.playerCount < MIN_PLAYERS)
      return t('games.sea_battle_v1.table.lobby.needTwoPlayers');
    if (isHost) return t('games.sea_battle_v1.table.lobby.hostCanStart');
    return t('games.sea_battle_v1.table.lobby.waitingForHost');
  };

  const optionsSlot =
    isHost && room.status === 'lobby' ? (
      <VariantSelectorWrapper>
        <VariantSelector
          roomId={room.id}
          currentVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />
        <ColorPreviewContainer data-testid="color-preview-container">
          <ColorItem>
            <ColorSwatch
              $color={
                VARIANT_THEMES[selectedVariant as keyof typeof VARIANT_THEMES]
                  ?.shipColor || VARIANT_THEMES.classic.shipColor
              }
              title="Ship"
              data-testid="color-swatch-ship"
            />
            <ColorLabel data-testid="color-label-ship">
              {t('games.sea_battle_v1.colors.ship' as TranslationKey)}
            </ColorLabel>
          </ColorItem>
          <ColorItem>
            <ColorSwatch
              $color={
                VARIANT_THEMES[selectedVariant as keyof typeof VARIANT_THEMES]
                  ?.hitColor || VARIANT_THEMES.classic.hitColor
              }
              title="Hit"
              data-testid="color-swatch-hit"
            />
            <ColorLabel data-testid="color-label-hit">
              {t('games.sea_battle_v1.colors.hit' as TranslationKey)}
            </ColorLabel>
          </ColorItem>
          <ColorItem>
            <ColorSwatch
              $color={
                VARIANT_THEMES[selectedVariant as keyof typeof VARIANT_THEMES]
                  ?.missColor || VARIANT_THEMES.classic.missColor
              }
              title="Miss"
              data-testid="color-swatch-miss"
            />
            <ColorLabel data-testid="color-label-miss">
              {t('games.sea_battle_v1.colors.miss' as TranslationKey)}
            </ColorLabel>
          </ColorItem>
          <ColorItem>
            <ColorSwatch
              $color={
                VARIANT_THEMES[selectedVariant as keyof typeof VARIANT_THEMES]
                  ?.cellEmpty || VARIANT_THEMES.classic.cellEmpty
              }
              title="Empty"
              data-testid="color-swatch-empty"
            />
            <ColorLabel data-testid="color-label-empty">
              {t('games.sea_battle_v1.colors.empty' as TranslationKey)}
            </ColorLabel>
          </ColorItem>
        </ColorPreviewContainer>
      </VariantSelectorWrapper>
    ) : null;

  const headerActionsSlot = (
    <IconButton
      onClick={() => onShowRules(true)}
      title="Game Rules"
      style={{ fontSize: '1.2rem' }}
    >
      📖
    </IconButton>
  );

  return (
    <ReusableGameLobby
      room={room}
      isHost={isHost}
      startBusy={startBusy}
      onStartGame={onStartGame}
      onReorderPlayers={onReorderPlayers}
      onDeleteRoom={onDeleteRoom}
      onRefresh={onRefresh}
      gameName={t('games.sea_battle_v1.name' as TranslationKey)}
      gameIcon="🚢"
      roomIcon={variantInfo.emoji || '⚓'}
      variantName={
        variantInfo.name ? t(variantInfo.name as TranslationKey) : undefined
      }
      minPlayers={MIN_PLAYERS}
      waitingLabel={t('games.sea_battle_v1.table.lobby.waitingToStart')}
      subtitleText={getSubtitleText()}
      playersLabel={t('games.rooms.playersLabel')}
      hostControlsLabel={t('games.sea_battle_v1.table.lobby.hostControls')}
      startLabel={t('games.sea_battle_v1.table.actions.start')}
      startingLabel={t('games.sea_battle_v1.table.actions.starting')}
      roomInfoLabel={t('games.sea_battle_v1.table.lobby.roomInfo')}
      fastRoomLabel={t('games.rooms.fastRoom')}
      botCountLabel={t('games.lobby.botCountLabel')}
      startWithBotsLabel={t('games.lobby.startWithBots')}
      theme={theme}
      showReorderControls={true}
      showInvitedPlayers={false}
      optionsSlot={optionsSlot}
      headerActionsSlot={headerActionsSlot}
      enableBots={true}
    />
  );
}
