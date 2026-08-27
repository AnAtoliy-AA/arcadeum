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
import { HEARTS_VARIANTS } from '../lib/constants';
import { resolveHeartsVariant } from '../lib/theme';
import { RulesModal } from './RulesModal';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

interface HeartsLobbyProps {
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

const HEARTS_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #fff1f2 0%, #fda4af 50%, #fff1f2 100%)',
  buttonGradient: 'linear-gradient(135deg, #dc2626 0%, #9f1239 100%)',
};

function resolveOptions(raw: unknown): {
  variant: ReturnType<typeof resolveHeartsVariant>;
  passingEnabled: boolean;
  targetScore: 50 | 100;
} {
  const r = (raw ?? {}) as Partial<{
    passingEnabled: boolean;
    targetScore: number;
  }>;
  return {
    variant: resolveHeartsVariant(raw),
    passingEnabled:
      typeof r.passingEnabled === 'boolean' ? r.passingEnabled : true,
    targetScore: r.targetScore === 50 ? 50 : 100,
  };
}

export function HeartsLobby({
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
}: HeartsLobbyProps) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  const options = useMemo(
    () => resolveOptions(room.gameOptions),
    [room.gameOptions],
  );

  const variantTokens = useMemo(
    () =>
      HEARTS_VARIANTS.find((v) => v.id === options.variant) ??
      HEARTS_VARIANTS[0],
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
      <LobbyOptionSection title={t('games.hearts_v1.lobby.variant')}>
        <GameThemePicker
          selectedTheme={options.variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionSection>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LobbyOptionSection title={t('games.hearts_v1.lobby.targetScore')}>
          <LobbyChipGroup
            options={[
              { id: '50', label: '50' },
              { id: '100', label: '100' },
            ]}
            value={String(options.targetScore)}
            onChange={(v) => setOption({ targetScore: v === '50' ? 50 : 100 })}
            accentColor="#dc2626"
            testIdPrefix="hearts-target-score"
          />
        </LobbyOptionSection>

        <div className="flex items-center">
          <LobbyToggle
            label={t('games.hearts_v1.lobby.passingEnabled')}
            checked={options.passingEnabled}
            onCheckedChange={(val) => setOption({ passingEnabled: val })}
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
      gameName="Hearts"
      gameIcon="♥"
      variantName={t(variantTokens.name)}
      theme={getLobbyTheme(
        HEARTS_VARIANTS,
        options.variant,
        HEARTS_LOBBY_THEME.fallbackLightGradient,
        HEARTS_LOBBY_THEME.buttonGradient,
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
