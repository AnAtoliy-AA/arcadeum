'use client';

import { useMemo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import {
  ReusableGameLobby,
  LobbyOptionSection,
  GameThemePicker,
  getLobbyTheme,
} from '@/features/games/ui';
import type { GameRoomSummary } from '@/shared/types/games';
import { RulesModal } from './RulesModal';
import { BACKGAMMON_VARIANTS } from '../lib/constants';
import type { BackgammonOptions, BackgammonVariant } from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

const BACKGAMMON_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
};

interface BackgammonLobbyProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (options?: {
    withBots?: boolean;
    botCount?: number;
    botDifficulty?: string;
  }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onRefresh?: () => void;
  showRulesOpen: boolean;
  onShowRulesClose: () => void;
}

function resolveOptions(raw: unknown): BackgammonOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    aiDifficulty: string;
  }>;
  return {
    variant: (r.theme ?? r.variant ?? 'cyberpunk') as BackgammonVariant,
    aiDifficulty: (r.aiDifficulty ?? 'medium') as
      'easy' | 'medium' | 'hard' | 'expert',
  };
}

export function BackgammonLobby({
  room,
  userId,
  isHost,
  startBusy,
  onStartGame,
  onReorderPlayers,
  onLeaveRoom,
  onDeleteRoom,
  onKickPlayer,
  onRefresh,
  showRulesOpen,
  onShowRulesClose,
}: BackgammonLobbyProps) {
  const { t } = useTranslation();
  const options = useMemo(
    () => resolveOptions(room.gameOptions),
    [room.gameOptions],
  );
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  const variant = options.variant;
  const lobbyTheme = useMemo(
    () =>
      getLobbyTheme(
        BACKGAMMON_VARIANTS,
        variant,
        BACKGAMMON_LOBBY_THEME.fallbackLightGradient,
        BACKGAMMON_LOBBY_THEME.buttonGradient,
      ),
    [variant],
  );

  const variantName = useMemo(() => {
    const found = BACKGAMMON_VARIANTS.find((v) => v.id === variant);
    return found ? t(found.nameKey as TranslationKey) : undefined;
  }, [variant, t]);

  const optionsSlot = (
    <div className="flex flex-col gap-4">
      <LobbyOptionSection title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionSection>
    </div>
  );

  return (
    <>
      <ReusableGameLobby
        enableBots
        gameIcon="🎲"
        gameName={t('games.backgammon_v1.name')}
        isHost={isHost}
        labels={{
          startWithBotsLabel: t('games.backgammon_v1.lobby.startWithBots'),
        }}
        maxPlayers={2}
        minPlayers={2}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onLeaveRoom={onLeaveRoom}
        onRefresh={onRefresh}
        onReorderPlayers={onReorderPlayers}
        onStartGame={(opts) =>
          onStartGame({ ...opts, botDifficulty: opts?.difficulty ?? 'medium' })
        }
        optionsSlot={optionsSlot}
        room={room}
        showInvitedPlayers
        showReorderControls
        startBusy={startBusy}
        theme={lobbyTheme}
        userId={userId}
        variantName={variantName}
      />
      <RulesModal onClose={onShowRulesClose} open={showRulesOpen} />
    </>
  );
}
