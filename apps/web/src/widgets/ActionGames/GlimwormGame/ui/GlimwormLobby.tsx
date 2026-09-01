'use client';

import { useEffect, useState } from 'react';
import { Button } from '@arcadeum/ui';
import {
  type GameLobbyTheme,
  ReusableGameLobby,
} from '@/features/games/ui/ReusableGameLobby';
import {
  LobbyOptionSection,
  LobbyChipGroup,
} from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { gameSocket } from '@/shared/lib/socket';
import { GLIMWORM_VARIANTS } from '@/features/games/lib/glimwormVariants';
import { gamesApi } from '@/features/games/api';
import type { CatalogVariant } from '@/features/games/api';
import { useGlimwormStore } from '../store/glimwormStore';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
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
  const { setOption } = useRoomOptions({
    roomId: room.id,
    userId: currentUserId,
  });
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
      <div className="flex flex-col items-stretch gap-4 p-3 rounded-xl">
        <LobbyOptionSection title={t('games.create.sectionVariant')}>
          <GameThemePicker
            selectedTheme={(room.gameOptions?.theme as string) || 'adventure'}
            onSelect={(themeId) => setOption({ theme: themeId })}
            disabled={!isHost}
          />
        </LobbyOptionSection>

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
            <span className="-mt-2 text-[12px] text-[rgba(180,_180,_200,_0.7)] italic">
              Host chooses the variant.
            </span>
          )}
        </LobbyOptionSection>

        <LobbyOptionSection title={t('games.glimworm_v1.lobby.powerups')}>
          <Button
            className={`rounded-[20px] font-medium text-[13px] ${
              powerupsEnabled
                ? 'bg-[rgba(177,94,255,0.20)] border-[rgba(177,94,255,0.6)] text-[#d4a8ff] hover:bg-[rgba(177,94,255,0.25)]'
                : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.10)] text-[#cbd5e1] hover:bg-[rgba(255,255,255,0.08)]'
            } ${isHost ? 'opacity-100' : 'opacity-[0.7]'}`}
            variant="chip"
            size="sm"
            disabled={!isHost}
            data-active={powerupsEnabled ? 'on' : undefined}
            onClick={() => isHost && setPowerupsEnabled((p) => !p)}
          >
            {powerupsEnabled
              ? `✓ ${t('games.glimworm_v1.lobby.powerupsOn')}`
              : t('games.glimworm_v1.lobby.powerupsOff')}
          </Button>
        </LobbyOptionSection>

        <LobbyOptionSection title={t('games.glimworm_v1.lobby.pickColor')}>
          <div className="flex flex-row items-stretch gap-2 flex-wrap">
            {PALETTE.map((color) => {
              const isSelected = color === effectiveSelectedColor;
              const isTaken = takenColors.has(color) && !isSelected;
              return (
                <Button
                  className={`w-[32px] h-[32px] rounded-[16px] ${
                    isSelected ? 'border-[3px]' : 'border-2'
                  } ${
                    isTaken
                      ? 'opacity-[0.3] hover:opacity-[0.3]'
                      : 'opacity-100 hover:opacity-[0.8]'
                  }`}
                  style={{
                    backgroundColor: color,
                    padding: 0,
                    borderColor: isSelected ? '#fff' : 'rgba(255,255,255,0.18)',
                  }}
                  key={color}
                  variant="chip"
                  size="sm"
                  disabled={isTaken}
                  aria-label={color}
                  aria-pressed={isSelected}
                  title={isTaken ? 'Taken by another player' : color}
                  onClick={() => !isTaken && handleColor(color)}
                />
              );
            })}
          </div>
        </LobbyOptionSection>

        {error && (
          <span className="text-[14px] py-6 px-10 rounded-2xl bg-[rgba(255,94,94,0.12)] text-[#ffb0b0]">
            {error}
          </span>
        )}
      </div>
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
      showDifficulty={false}
    />
  );
}
