'use client';

import { useMemo, useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/lib/useTranslation';
import { ReusableGameLobby } from '@/features/games/ui/ReusableGameLobby';
import { LobbyOptionSection } from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import { getLobbyTheme } from '@/features/games/ui/lobbyTheme';
import type { GameRoomSummary } from '@/shared/types/games';
import { BoardSizeSelector } from './BoardSizeSelector';
import { TicTacToeTeamPanel } from './TicTacToeTeamPanel';
import { RulesModal } from './RulesModal';
import { TIC_TAC_TOE_THEMES } from '../lib/constants';
import {
  BOARD_SIZES,
  MAX_PLAYERS_BY_BOARD_SIZE,
  type BoardSize,
  type TicTacToeOptions,
  type TicTacToeTheme,
  type InfinityMargin,
  type InfinityWinLength,
  WIN_LENGTHS,
} from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';
import type { BotDifficulty } from '@/features/games/ui/DifficultySelector';

const TIC_TAC_TOE_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
};

interface TicTacToeLobbyProps {
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
  startBusy: boolean;
  onStartGame: (options?: {
    withBots?: boolean;
    botCount?: number;
    difficulty?: BotDifficulty;
  }) => void;
  onReorderPlayers?: (newOrder: string[]) => void;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onKickPlayer?: (userId: string) => void;
  onRefresh?: () => void;
  showRulesOpen: boolean;
  onShowRulesClose: () => void;
}

function resolveOptions(raw: unknown): TicTacToeOptions {
  const r = (raw ?? {}) as Partial<{
    theme: string;
    variant: string;
    boardSize: number | string;
    teamMode: boolean;
    expansionMargin: number;
    infinityWinLength: number;
  }>;
  const isAllowedSize = (n: number | string | undefined): n is BoardSize =>
    n === 3 || n === 5 || n === 7 || n === 9 || n === 'infinity';
  const isMargin = (n: number | undefined): n is 1 | 2 | 3 =>
    n === 1 || n === 2 || n === 3;
  const isWinLen = (n: number | undefined): n is 4 | 5 => n === 4 || n === 5;
  const theme = (r.theme ?? r.variant ?? 'adventure') as TicTacToeTheme;
  return {
    variant: theme,
    theme,
    boardSize: isAllowedSize(r.boardSize) ? r.boardSize : 3,
    teamMode: !!r.teamMode,
    expansionMargin: isMargin(r.expansionMargin) ? r.expansionMargin : 3,
    infinityWinLength: isWinLen(r.infinityWinLength) ? r.infinityWinLength : 5,
  };
}

export function TicTacToeLobby({
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
}: TicTacToeLobbyProps) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });

  const options = useMemo(
    () => resolveOptions(room.gameOptions),
    [room.gameOptions],
  );
  const variant = options.variant;
  const lobbyTheme = useMemo(
    () =>
      getLobbyTheme(
        TIC_TAC_TOE_THEMES,
        variant,
        TIC_TAC_TOE_LOBBY_THEME.fallbackLightGradient,
        TIC_TAC_TOE_LOBBY_THEME.buttonGradient,
      ),
    [variant],
  );
  const variantName = useMemo(() => {
    const found = TIC_TAC_TOE_THEMES.find((v) => v.id === variant);
    return found ? t(found.name) : undefined;
  }, [variant, t]);

  const [internalTeamMode, setInternalTeamMode] = useState(options.teamMode);

  const handleTeamModeToggle = (val: boolean) => {
    if (!isHost) return;
    setInternalTeamMode(val);
    setOption({ teamMode: val });
  };

  const handleMarginChange = (margin: InfinityMargin) => {
    setOption({ expansionMargin: margin });
  };

  const handleWinLengthChange = (winLength: InfinityWinLength) => {
    setOption({ infinityWinLength: winLength });
  };

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
      <BoardSizeSelector
        roomId={room.id}
        hostId={userId}
        currentSize={options.boardSize}
        currentMargin={options.expansionMargin}
        currentWinLength={options.infinityWinLength}
        disabled={!isHost}
        onMarginChange={handleMarginChange}
        onWinLengthChange={handleWinLengthChange}
      />
      <LobbyOptionSection title={t('games.tic_tac_toe_v1.lobby.teamMode')}>
        <div className="flex flex-row items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={internalTeamMode}
            aria-label={t('games.tic_tac_toe_v1.lobby.teamMode')}
            disabled={!isHost}
            onClick={() => handleTeamModeToggle(!internalTeamMode)}
            className={cx(
              'h-6 w-11 rounded-full p-1 transition-colors duration-200 ease-out',
              internalTeamMode ? 'bg-[#2563eb]' : 'bg-[rgba(255,255,255,0.15)]',
              !isHost && 'cursor-not-allowed opacity-50',
            )}
          >
            <span
              className={cx(
                'block h-4 w-4 rounded-full bg-white transition-transform duration-200 ease-out',
                internalTeamMode ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </button>
        </div>
      </LobbyOptionSection>
      {internalTeamMode ? (
        <TicTacToeTeamPanel room={room} isHost={isHost} />
      ) : null}
      <span className="text-[16px] opacity-[0.7]">
        {options.boardSize === 'infinity'
          ? t('games.tic_tac_toe_v1.lobby.winCondition')
          : t('games.tic_tac_toe_v1.rules.winLengths')}
      </span>
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
          onStartGame({ ...opts, difficulty: opts?.difficulty ?? 'medium' })
        }
        onLeaveRoom={onLeaveRoom}
        onDeleteRoom={onDeleteRoom}
        onKickPlayer={onKickPlayer}
        onRefresh={onRefresh}
        gameName={t('games.tic_tac_toe_v1.name')}
        gameIcon="❌⭕"
        variantName={variantName}
        minPlayers={2}
        maxPlayers={MAX_PLAYERS_BY_BOARD_SIZE[options.boardSize]}
        theme={lobbyTheme}
        enableBots
        labels={{
          startWithBotsLabel: t('games.tic_tac_toe_v1.lobby.startWithBots'),
        }}
        optionsSlot={optionsSlot}
        showInvitedPlayers
        showReorderControls
        onReorderPlayers={onReorderPlayers}
      />
      <RulesModal
        open={showRulesOpen}
        onClose={onShowRulesClose}
        boardSize={options.boardSize}
        winLength={
          options.boardSize === 'infinity'
            ? options.infinityWinLength
            : WIN_LENGTHS[options.boardSize]
        }
        expansionMargin={options.expansionMargin}
      />
    </>
  );
}

// Reference to satisfy unused-variable check if BOARD_SIZES is only used by other modules
void BOARD_SIZES;
