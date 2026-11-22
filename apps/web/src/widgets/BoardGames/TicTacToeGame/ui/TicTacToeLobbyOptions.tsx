'use client';

import { useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { LobbyOptionSection } from '@/features/games/ui/LobbyOptions';
import { GameThemePicker } from '@/features/games/ui/GameThemePicker';
import type { GameRoomSummary } from '@/shared/types/games';
import { BoardSizeSelector } from './BoardSizeSelector';
import { TicTacToeTeamPanel } from './TicTacToeTeamPanel';
import {
  type BoardSize,
  type TicTacToeOptions,
  type TicTacToeTheme,
  type InfinityMargin,
  type InfinityWinLength,
  WIN_LENGTHS,
} from '../types';
import { useRoomOptions } from '@/features/games/hooks/useRoomOptions';

export const TIC_TAC_TOE_LOBBY_THEME = {
  fallbackLightGradient:
    'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
  buttonGradient: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
};

export function resolveTicTacToeLobbyOptions(
  raw: unknown,
  fallbackTheme: string,
): TicTacToeOptions {
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
  const theme = (r.theme ?? r.variant ?? fallbackTheme) as TicTacToeTheme;
  return {
    variant: theme,
    theme,
    boardSize: isAllowedSize(r.boardSize) ? r.boardSize : 3,
    teamMode: !!r.teamMode,
    expansionMargin: isMargin(r.expansionMargin) ? r.expansionMargin : 3,
    infinityWinLength: isWinLen(r.infinityWinLength) ? r.infinityWinLength : 5,
  };
}

export function TicTacToeLobbyOptionsPanel({
  options,
  room,
  userId,
  isHost,
}: {
  options: TicTacToeOptions;
  room: GameRoomSummary;
  userId: string;
  isHost: boolean;
}) {
  const { t } = useTranslation();
  const { setOption } = useRoomOptions({ roomId: room.id, userId });
  const variant = options.variant;
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

  return (
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
}

export function getWinLength(options: TicTacToeOptions) {
  return options.boardSize === 'infinity'
    ? options.infinityWinLength
    : WIN_LENGTHS[options.boardSize];
}
