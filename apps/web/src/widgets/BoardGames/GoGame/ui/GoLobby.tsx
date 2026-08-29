'use client';

import { useMemo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import { LobbyOptionSection } from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import type { GameRoomSummary } from '@/shared/types/games';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import { RulesModal } from './RulesModal';
import {
  GO_VARIANTS,
  GO_BOARD_SIZES,
  resolveGoOptions,
} from '../lib/constants';

const GO_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
};

interface GoLobbyProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (options?: { withBots?: boolean; botCount?: number }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onRefresh?: () => void;
  showRulesOpen: boolean;
  onShowRulesClose: () => void;
}

export function GoLobby({
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
}: GoLobbyProps) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  const options = useMemo(
    () => resolveGoOptions(room.gameOptions),
    [room.gameOptions],
  );
  const variant = options.variant;
  const lobbyTheme = useMemo(
    () =>
      getLobbyTheme(
        GO_VARIANTS,
        variant,
        GO_LOBBY_THEME.fallbackLightGradient,
        GO_LOBBY_THEME.buttonGradient,
      ),
    [variant],
  );
  const variantName = useMemo(() => {
    const found = GO_VARIANTS.find((v) => v.id === variant);
    return found ? t(found.name) : undefined;
  }, [variant, t]);

  const optionsSlot = (
    <div className="flex flex-col items-stretch gap-4">
      <LobbyOptionSection title={t('games.create.sectionVariant')}>
        <GameThemePicker
          selectedTheme={variant}
          onSelect={(themeId) =>
            setOption({ theme: themeId, variant: themeId })
          }
          disabled={!isHost}
        />
      </LobbyOptionSection>
      <LobbyOptionSection title={t('games.go_v1.lobby.boardSize')}>
        <div className="flex flex-row flex-wrap gap-2">
          {GO_BOARD_SIZES.map(({ size, label }) => (
            <button
              key={size}
              type="button"
              data-testid={`go-board-size-${size}`}
              disabled={!isHost}
              aria-pressed={options.boardSize === size}
              onClick={() => setOption({ boardSize: size })}
              className={cx(
                'rounded-lg border px-4 py-2 text-sm font-semibold transition-colors',
                options.boardSize === size
                  ? 'border-[#3fd38666] bg-[#2563eb] text-white'
                  : 'border-[var(--borderColor)] bg-[var(--backgroundHover)]',
                !isHost && 'cursor-not-allowed opacity-50',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-[14px] opacity-[0.7]">
          {t('games.go_v1.lobby.boardSizeHint')}
        </span>
      </LobbyOptionSection>
    </div>
  );

  return (
    <>
      <ReusableGameLobby
        room={room}
        userId={userId}
        isHost={isHost}
        startBusy={startBusy}
        onStartGame={(opts) =>
          onStartGame({ withBots: opts?.withBots, botCount: opts?.botCount })
        }
        onLeaveRoom={onLeaveRoom}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onRefresh={onRefresh}
        gameName={t('games.go_v1.name')}
        gameIcon="⚫⚪"
        variantName={variantName}
        minPlayers={2}
        maxPlayers={2}
        theme={lobbyTheme}
        enableBots
        labels={{
          startWithBotsLabel: t('games.go_v1.lobby.startWithBots'),
        }}
        optionsSlot={optionsSlot}
        showInvitedPlayers
        showReorderControls
        onReorderPlayers={onReorderPlayers}
      />
      <RulesModal open={showRulesOpen} onClose={onShowRulesClose} />
    </>
  );
}
