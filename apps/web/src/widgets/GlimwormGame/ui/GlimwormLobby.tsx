'use client';

import { useEffect, useState } from 'react';
import { YStack, XStack, Text } from 'tamagui';
import { Button } from '@arcadeum/ui';
import {
  ReusableGameLobby,
  type GameLobbyTheme,
  LobbyOptionSection,
  LobbyChipGroup,
} from '@/features/games/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { gameSocket } from '@/shared/lib/socket';
import { GLIMWORM_VARIANTS } from '@/features/games/lib/glimwormVariants';
import { gamesApi } from '@/features/games/api';
import type { CatalogVariant } from '@/features/games/api';
import { useGlimwormStore } from '../store/glimwormStore';
import type { GameRoomSummary } from '@/shared/types/games';
import type { GlimwormVariant } from '../types';

const PALETTE = [
  '#ff5e5e',
  '#ffb05e',
  '#ffe65e',
  '#7cff5e',
  '#5effb6',
  '#5ee0ff',
  '#5e8cff',
  '#b15eff',
  '#ff5ed4',
  '#a0ffea',
];

const MIN_PLAYERS = 2;

const GLIMWORM_THEME: GameLobbyTheme = {
  titleGradient:
    'linear-gradient(90deg, #7cff5e 0%, #5ee0ff 50%, #b15eff 100%)',
  variantGradient: 'linear-gradient(135deg, #5ee0ff 0%, #b15eff 100%)',
  buttonGradient: 'linear-gradient(135deg, #5ee0ff 0%, #7c5cff 100%)',
};

interface GlimwormLobbyProps {
  room: GameRoomSummary;
  isHost: boolean;
  currentUserId: string;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
}

export function GlimwormLobby({
  room,
  isHost,
  currentUserId,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
}: GlimwormLobbyProps): React.JSX.Element {
  const { t } = useTranslation();
  const selectedColor = useGlimwormStore((s) => s.selectedColor);
  const setColor = useGlimwormStore((s) => s.setColor);
  const latestSnapshot = useGlimwormStore((s) => s.latestSnapshot);

  const [variant, setVariant] = useState<GlimwormVariant>('battle_royale');
  const [powerupsEnabled, setPowerupsEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allowedVariants, setAllowedVariants] = useState<
    CatalogVariant[] | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    gamesApi
      .getCatalog()
      .then((res) => {
        if (cancelled) return;
        const glim = res.games.find((g) => g.gameId === 'glimworm_v1');
        setAllowedVariants(glim?.variants ?? null);
      })
      .catch(() => {
        if (!cancelled) setAllowedVariants(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleVariants =
    allowedVariants === null
      ? GLIMWORM_VARIANTS.map((v) => ({ ...v, comingSoon: false }))
      : GLIMWORM_VARIANTS.filter((v) =>
          allowedVariants.some((a) => a.id === v.id),
        ).map((v) => ({
          ...v,
          comingSoon:
            allowedVariants.find((a) => a.id === v.id)?.comingSoon ?? false,
        }));

  const otherWorms =
    latestSnapshot?.worms.filter((w) => w.id !== currentUserId) ?? [];
  const takenColors = new Set(otherWorms.map((w) => w.color));
  const myWorm = latestSnapshot?.worms.find((w) => w.id === currentUserId);
  const effectiveSelectedColor = selectedColor ?? myWorm?.color ?? null;

  useEffect(() => {
    const onAck = () => {
      setBusy(false);
      setError(null);
    };
    const onException = (err: unknown) => {
      const msg =
        typeof err === 'object' && err && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Server rejected the request';
      setError(msg);
      setBusy(false);
    };
    gameSocket.on('glimworm.start.ack', onAck);
    gameSocket.on('exception', onException);
    return () => {
      gameSocket.off('glimworm.start.ack', onAck);
      gameSocket.off('exception', onException);
    };
  }, []);

  const handleColor = (color: string) => {
    setColor(color);
    gameSocket.emit('glimworm.color.pick', {
      roomId: room.id,
      userId: currentUserId,
      color,
    });
  };

  const handleStartGame = (options?: {
    withBots?: boolean;
    botCount?: number;
  }) => {
    setBusy(true);
    setError(null);
    gameSocket.emit('glimworm.start', {
      roomId: room.id,
      userId: currentUserId,
      variant,
      powerupsEnabled,
      fillWithBots: !!options?.withBots,
      botCount: options?.botCount,
    });
    setTimeout(() => setBusy(false), 3000);
  };

  const variantInfo = GLIMWORM_VARIANTS.find((v) => v.id === variant);

  const variantOptions = visibleVariants.map((v) => ({
    id: v.id,
    label: t(v.name as TranslationKey),
    emoji: v.emoji,
    comingSoon: v.comingSoon,
  }));

  const optionsSlot =
    room.status === 'lobby' ? (
      <YStack gap="$4" padding="$3" borderRadius="$3">
        <LobbyOptionSection title={t('games.glimworm_v1.lobby.variant')}>
          <LobbyChipGroup
            options={variantOptions}
            value={variant}
            onChange={(v) => setVariant(v as GlimwormVariant)}
            disabled={!isHost}
            accentColor="#5ee0ff"
            testIdPrefix="glimworm-variant"
          />
          {!isHost && (
            <Text
              marginTop={2}
              fontSize="$1"
              color="$textMuted"
              fontStyle="italic"
            >
              Host chooses the variant.
            </Text>
          )}
        </LobbyOptionSection>

        <LobbyOptionSection title={t('games.glimworm_v1.lobby.powerups')}>
          <Button
            variant="chip"
            size="sm"
            disabled={!isHost}
            data-active={powerupsEnabled}
            backgroundColor={
              powerupsEnabled
                ? 'rgba(177,94,255,0.20)'
                : 'rgba(255,255,255,0.04)'
            }
            borderColor={
              powerupsEnabled
                ? 'rgba(177,94,255,0.6)'
                : 'rgba(255,255,255,0.10)'
            }
            color={powerupsEnabled ? '#d4a8ff' : '#cbd5e1'}
            hoverStyle={{
              backgroundColor: powerupsEnabled
                ? 'rgba(177,94,255,0.25)'
                : 'rgba(255,255,255,0.08)',
            }}
            borderRadius={20}
            fontWeight={500}
            fontSize={13}
            opacity={isHost ? 1 : 0.7}
            onPress={() => isHost && setPowerupsEnabled((p) => !p)}
          >
            {powerupsEnabled
              ? `✓ ${t('games.glimworm_v1.lobby.powerupsOn')}`
              : t('games.glimworm_v1.lobby.powerupsOff')}
          </Button>
        </LobbyOptionSection>

        <LobbyOptionSection title={t('games.glimworm_v1.lobby.pickColor')}>
          <XStack gap={2} flexWrap="wrap">
            {PALETTE.map((color) => {
              const isSelected = color === effectiveSelectedColor;
              const isTaken = takenColors.has(color) && !isSelected;
              return (
                <Button
                  key={color}
                  variant="chip"
                  size="sm"
                  padding={0}
                  width={32}
                  height={32}
                  borderRadius={16}
                  backgroundColor={color}
                  borderWidth={isSelected ? 3 : 2}
                  borderColor={isSelected ? '#fff' : 'rgba(255,255,255,0.18)'}
                  disabled={isTaken}
                  opacity={isTaken ? 0.3 : 1}
                  hoverStyle={{
                    opacity: isTaken ? 0.3 : 0.8,
                  }}
                  aria-label={color}
                  aria-pressed={isSelected}
                  title={isTaken ? 'Taken by another player' : color}
                  onPress={() => !isTaken && handleColor(color)}
                />
              );
            })}
          </XStack>
        </LobbyOptionSection>

        {error && (
          <Text
            fontSize="$2"
            paddingVertical={6}
            paddingHorizontal={10}
            borderRadius={4}
            backgroundColor="rgba(255,94,94,0.12)"
            color="#ffb0b0"
          >
            {error}
          </Text>
        )}
      </YStack>
    ) : null;

  return (
    <ReusableGameLobby
      room={room}
      userId={currentUserId}
      isHost={isHost}
      startBusy={busy}
      onStartGame={handleStartGame}
      onDeleteRoom={onDeleteRoom}
      onKickPlayer={onKickPlayer}
      onLeaveRoom={onLeaveRoom}
      gameName={t('games.glimworm_v1.name' as TranslationKey)}
      gameIcon="🐛"
      roomIcon={variantInfo?.emoji ?? '✨'}
      variantName={
        variantInfo?.name ? t(variantInfo.name as TranslationKey) : undefined
      }
      minPlayers={MIN_PLAYERS}
      labels={{
        waitingLabel: t('games.glimworm_v1.lobby.waitingForPlayers'),
        startWithBotsLabel: t('games.glimworm_v1.lobby.fillWithBots'),
      }}
      theme={GLIMWORM_THEME}
      optionsSlot={optionsSlot}
      enableBots={true}
    />
  );
}
