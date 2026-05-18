import {
  GAME_ROOM_PARTICIPATION_FILTERS,
  type GameRoomParticipationFilter,
} from './games.types';
import {
  GAME_ROOM_STATUS_VALUES,
  GAME_ROOM_VISIBILITY_VALUES,
  type GameRoomStatus,
  type GameRoomVisibility,
} from './schemas/game-room.schema';

export function parseCsvList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function parseStatusFilters(raw?: string): GameRoomStatus[] {
  return parseCsvList(raw).reduce<GameRoomStatus[]>((acc, value) => {
    if (
      GAME_ROOM_STATUS_VALUES.includes(value as GameRoomStatus) &&
      !acc.includes(value as GameRoomStatus)
    ) {
      acc.push(value as GameRoomStatus);
    }
    return acc;
  }, []);
}

export function parseVisibilityFilters(raw?: string): GameRoomVisibility[] {
  return parseCsvList(raw).reduce<GameRoomVisibility[]>((acc, value) => {
    if (
      GAME_ROOM_VISIBILITY_VALUES.includes(value as GameRoomVisibility) &&
      !acc.includes(value as GameRoomVisibility)
    ) {
      acc.push(value as GameRoomVisibility);
    }
    return acc;
  }, []);
}

export type NarrowedParticipationFilter = Exclude<
  GameRoomParticipationFilter,
  'all'
>;

export function parseParticipationFilter(
  raw?: string,
): NarrowedParticipationFilter | undefined {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (
    !GAME_ROOM_PARTICIPATION_FILTERS.includes(
      trimmed as GameRoomParticipationFilter,
    )
  ) {
    return undefined;
  }
  const filter = trimmed as GameRoomParticipationFilter;
  return filter === 'all' ? undefined : filter;
}
