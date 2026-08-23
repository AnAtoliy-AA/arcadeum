'use client';

import { useCallback, useMemo } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  ReusableGameLobby,
  LobbyOptionSection,
  LobbyChipGroup,
  LobbyToggle,
  GameThemePicker,
  getLobbyTheme,
} from '@/features/games/ui';
import type { GameRoomSummary } from '@/shared/types/games';
import { reorderRoomParticipants } from '@/shared/api/gamesApi';
import { MIN_PLAYERS } from '../types';
import { SPADES_VARIANTS } from '../lib/constants';
import { resolveSpadesVariant } from '../lib/theme';
import { RulesModal } from './RulesModal';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

interface SpadesLobbyProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (opts?: { withBots?: boolean; botCount?: number }) => void;
  onLeaveRoom: () => void;
  onDeleteRoom: () => void;
  onKickPlayer: (userId: string) => void;
  onRefresh: () => void;
  showRulesOpen?: boolean;
  onShowRulesClose?: () => void;
  accessToken?: string | null;
}

const SPADES_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #eef2ff 0%, #818cf8 50%, #eef2ff 100%)',
  buttonGradient: 'linear-gradient(135deg, #1d4ed8 0%, #312e81 100%)',
};

function resolveOptions(raw: unknown): {
  variant: ReturnType<typeof resolveSpadesVariant>;
  nilEnabled: boolean;
  targetScore: number;
} {
  const r = (raw ?? {}) as Partial<{
    nilEnabled: boolean;
    targetScore: number;
  }>;
  return {
    variant: resolveSpadesVariant(raw),
    nilEnabled: typeof r.nilEnabled === 'boolean' ? r.nilEnabled : true,
    targetScore: r.targetScore === 300 ? 300 : 500,
  };
}

export function SpadesLobby({
  room,
  userId,
  isHost,
  startBusy,
  onStartGame,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
  onRefresh,
  showRulesOpen,
  onShowRulesClose,
  accessToken,
}: SpadesLobbyProps) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  const options = useMemo(
    () => resolveOptions(room.gameOptions),
    [room.gameOptions],
  );

  const variantTokens = useMemo(
    () =>
      SPADES_VARIANTS.find((v) => v.id === options.variant) ??
      SPADES_VARIANTS[0],
    [options.variant],
  );

  const handleReorderPlayers = useCallback(
    async (newOrder: string[]) => {
      if (!accessToken || !room.id) return;
      try {
        await reorderRoomParticipants(room.id, newOrder, accessToken);
      } catch {}
    },
    [accessToken, room.id],
  );

  const optionsSlot = (
    <div className="flex flex-col items-stretch gap-4">
      <LobbyOptionSection title={t('games.spades_v1.lobby.variant')}>
        <GameThemePicker
          selectedTheme={options.variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionSection>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LobbyOptionSection title={t('games.spades_v1.lobby.targetScore')}>
          <LobbyChipGroup
            options={[
              { id: '300', label: '300' },
              { id: '500', label: '500' },
            ]}
            value={String(options.targetScore)}
            onChange={(v) =>
              setOption({ targetScore: v === '300' ? 300 : 500 })
            }
            accentColor="#1d4ed8"
            testIdPrefix="spades-target-score"
          />
        </LobbyOptionSection>

        <div className="flex items-center">
          <LobbyToggle
            label={t('games.spades_v1.lobby.nilEnabled')}
            checked={options.nilEnabled}
            onCheckedChange={(val) => setOption({ nilEnabled: val })}
            disabled={!isHost}
          />
        </div>
      </div>
    </div>
  );

  return (
    <ReusableGameLobby
      room={room}
      userId={userId}
      isHost={isHost}
      startBusy={startBusy}
      minPlayers={MIN_PLAYERS}
      gameName="Spades"
      gameIcon="♠"
      variantName={t(variantTokens.name)}
      theme={getLobbyTheme(
        SPADES_VARIANTS,
        options.variant,
        SPADES_LOBBY_THEME.fallbackLightGradient,
        SPADES_LOBBY_THEME.buttonGradient,
      )}
      optionsSlot={optionsSlot}
      rulesModalSlot={
        <RulesModal
          open={!!showRulesOpen}
          onClose={onShowRulesClose ?? (() => {})}
        />
      }
      onStartGame={onStartGame}
      onReorderPlayers={handleReorderPlayers}
      onLeaveRoom={onLeaveRoom}
      onDeleteRoom={onDeleteRoom}
      onKickPlayer={onKickPlayer}
      onRefresh={onRefresh}
      enableBots
    />
  );
}
