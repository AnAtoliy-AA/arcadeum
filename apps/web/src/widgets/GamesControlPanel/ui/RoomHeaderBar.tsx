'use client';

import Link from 'next/link';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { cx } from '@arcadeum/ui/utils/cx';
import { GAME_ROOM_STATUS, type GameRoomStatus } from '@/shared/types/games';

interface RoomHeaderBarProps {
  roomName?: string | null;
  status: GameRoomStatus;
  playerCount: number;
  maxPlayers?: number | null;
}

const STATUS_STYLE: Record<GameRoomStatus, string> = {
  [GAME_ROOM_STATUS.LOBBY]:
    'text-[var(--warning)] bg-[color:color-mix(in_srgb,var(--warning)_14%,transparent)] border-[color:color-mix(in_srgb,var(--warning)_40%,transparent)]',
  [GAME_ROOM_STATUS.IN_PROGRESS]:
    'text-[var(--success)] bg-[color:color-mix(in_srgb,var(--success)_14%,transparent)] border-[color:color-mix(in_srgb,var(--success)_40%,transparent)]',
  [GAME_ROOM_STATUS.COMPLETED]:
    'text-[var(--color)] bg-[var(--glassBg)] border-[var(--glassBorderStrong)]',
};

/**
 * Room identity row: back to rooms, room name, status chip and player count.
 * Shared actions (share, leave, settings) live in GamesControlPanel below it.
 */
export function RoomHeaderBar({
  roomName,
  status,
  playerCount,
  maxPlayers,
}: RoomHeaderBarProps) {
  const { t } = useTranslation();

  const statusLabel =
    status === GAME_ROOM_STATUS.LOBBY
      ? t('games.lobby.statusWaiting')
      : status === GAME_ROOM_STATUS.IN_PROGRESS
        ? t('games.lobby.statusInProgress')
        : t('games.lobby.statusFinished');

  const countLabel = maxPlayers
    ? t('games.lobby.playersCount', { count: playerCount, max: maxPlayers })
    : String(playerCount);

  return (
    <header
      className="flex flex-row items-center gap-2 sm:gap-3 min-w-0"
      data-testid="room-header-bar"
    >
      <Link
        href="/games"
        className="inline-flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 shrink-0 rounded-xl border border-[var(--glassBorderStrong)] bg-[var(--glassBg)] text-[var(--color)] transition-colors hover:bg-[var(--backgroundHover)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]"
        aria-label={t('games.lobby.backToRooms')}
        title={t('games.lobby.backToRooms')}
        data-testid="room-back-link"
      >
        <span aria-hidden="true">←</span>
      </Link>

      {roomName && (
        <h1
          className="m-0 min-w-0 truncate text-base sm:text-lg font-bold text-[var(--color)]"
          data-testid="room-header-name"
        >
          {roomName}
        </h1>
      )}

      <span
        role="status"
        className={cx(
          'shrink-0 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
          STATUS_STYLE[status],
        )}
        data-testid="room-status-chip"
      >
        {statusLabel}
      </span>

      <span
        className="shrink-0 ml-auto text-xs sm:text-sm text-[var(--textSecondary)] whitespace-nowrap"
        data-testid="room-player-count"
      >
        {countLabel}
      </span>
    </header>
  );
}
