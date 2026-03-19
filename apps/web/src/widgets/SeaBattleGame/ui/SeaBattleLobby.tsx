'use client';

import React from 'react';
import { XStack, YStack, Text } from 'tamagui';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
} from '@/features/games/ui/ReusableGameLobby';
import type { GameRoomSummary } from '@/shared/types/games';
import { MIN_PLAYERS } from '../types';
import { SEA_BATTLE_VARIANTS } from '../lib/constants';
import { VariantSelector } from './VariantSelector';
import { TranslationKey } from '@/shared/lib/useTranslation';
import { IconButton } from '@/features/games/ui/ReusableGameLobby';
import { VARIANT_THEMES } from '../lib/theme';

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
      <XStack
        alignItems="center"
        gap="$6"
        marginLeft="$4"
        $md={{ flexDirection: 'column', alignItems: 'flex-start', gap: '$4', marginLeft: 0, width: '100%' }}
      >
        <VariantSelector
          roomId={room.id}
          currentVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />
        <XStack
          alignItems="center"
          gap="$4"
          backgroundColor="rgba(255,255,255,0.05)"
          paddingVertical="$2"
          paddingHorizontal="$4"
          borderRadius={8}
          borderWidth={1}
          borderColor="rgba(255,255,255,0.1)"
          data-testid="color-preview-container"
          $md={{ flexWrap: 'wrap', gap: '$3', width: '100%' }}
        >
          <XStack alignItems="center" gap="$2">
            <YStack
              width={16}
              height={16}
              borderRadius={4}
              backgroundColor={
                VARIANT_THEMES[selectedVariant as keyof typeof VARIANT_THEMES]?.shipColor ??
                VARIANT_THEMES.classic.shipColor
              }
              borderWidth={1}
              borderColor="rgba(255,255,255,0.2)"
              title="Ship"
              data-testid="color-swatch-ship"
            />
            <Text
              fontSize={12}
              color="rgba(255,255,255,0.6)"
              style={{ whiteSpace: 'nowrap' }}
              data-testid="color-label-ship"
            >
              {t('games.sea_battle_v1.colors.ship' as TranslationKey)}
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$2">
            <YStack
              width={16}
              height={16}
              borderRadius={4}
              backgroundColor={
                VARIANT_THEMES[selectedVariant as keyof typeof VARIANT_THEMES]?.hitColor ??
                VARIANT_THEMES.classic.hitColor
              }
              borderWidth={1}
              borderColor="rgba(255,255,255,0.2)"
              title="Hit"
              data-testid="color-swatch-hit"
            />
            <Text
              fontSize={12}
              color="rgba(255,255,255,0.6)"
              style={{ whiteSpace: 'nowrap' }}
              data-testid="color-label-hit"
            >
              {t('games.sea_battle_v1.colors.hit' as TranslationKey)}
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$2">
            <YStack
              width={16}
              height={16}
              borderRadius={4}
              backgroundColor={
                VARIANT_THEMES[selectedVariant as keyof typeof VARIANT_THEMES]?.missColor ??
                VARIANT_THEMES.classic.missColor
              }
              borderWidth={1}
              borderColor="rgba(255,255,255,0.2)"
              title="Miss"
              data-testid="color-swatch-miss"
            />
            <Text
              fontSize={12}
              color="rgba(255,255,255,0.6)"
              style={{ whiteSpace: 'nowrap' }}
              data-testid="color-label-miss"
            >
              {t('games.sea_battle_v1.colors.miss' as TranslationKey)}
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$2">
            <YStack
              width={16}
              height={16}
              borderRadius={4}
              backgroundColor={
                VARIANT_THEMES[selectedVariant as keyof typeof VARIANT_THEMES]?.cellEmpty ??
                VARIANT_THEMES.classic.cellEmpty
              }
              borderWidth={1}
              borderColor="rgba(255,255,255,0.2)"
              title="Empty"
              data-testid="color-swatch-empty"
            />
            <Text
              fontSize={12}
              color="rgba(255,255,255,0.6)"
              style={{ whiteSpace: 'nowrap' }}
              data-testid="color-label-empty"
            >
              {t('games.sea_battle_v1.colors.empty' as TranslationKey)}
            </Text>
          </XStack>
        </XStack>
      </XStack>
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
      labels={{
        waitingLabel: t('games.sea_battle_v1.table.lobby.waitingToStart'),
        subtitleText: getSubtitleText(),
        playersLabel: t('games.rooms.playersLabel'),
        hostControlsLabel: t('games.sea_battle_v1.table.lobby.hostControls'),
        startLabel: t('games.sea_battle_v1.table.actions.start'),
        startingLabel: t('games.sea_battle_v1.table.actions.starting'),
        roomInfoLabel: t('games.sea_battle_v1.table.lobby.roomInfo'),
        fastRoomLabel: t('games.rooms.fastRoom'),
        botCountLabel: t('games.lobby.botCountLabel'),
        startWithBotsLabel: t('games.lobby.startWithBots'),
      }}
      theme={theme}
      showReorderControls={true}
      showInvitedPlayers={false}
      optionsSlot={optionsSlot}
      headerActionsSlot={headerActionsSlot}
      enableBots={true}
    />
  );
}
