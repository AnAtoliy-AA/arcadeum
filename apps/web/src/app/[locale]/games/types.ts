import { GetRoomsResponse } from '@/features/games/api';

export interface GamesClientProps {
  initialData: GetRoomsResponse | null;
  // When set, the lounge is scoped to a single game (e.g. /games/sea_battle_v1)
  // — it hides nothing visually but every API call carries this filter and
  // the page title swaps to the game-specific label.
  gameId?: string;
  pageTitle?: string;
}

export type GamesStatusValue = 'lobby' | 'in_progress' | 'completed';
export type GamesStatusFilter = GamesStatusValue[];

export const STATUS_VALUES: GamesStatusValue[] = [
  'lobby',
  'in_progress',
  'completed',
];

export const ALL_STATUS_VALUES = ['all', ...STATUS_VALUES] as const;

export function parseStatusFilterFromUrl(
  raw: string | null,
): GamesStatusFilter {
  if (!raw || raw === 'all') return [];
  return raw
    .split(',')
    .filter((s): s is GamesStatusValue =>
      STATUS_VALUES.includes(s as GamesStatusValue),
    );
}

export function serializeStatusFilterToUrl(
  statuses: GamesStatusFilter,
): string | undefined {
  if (statuses.length === 0 || statuses.length === STATUS_VALUES.length)
    return undefined;
  return statuses.join(',');
}

export type GamesParticipationFilter =
  | 'all'
  | 'hosting'
  | 'joined'
  | 'not_joined';

export type GamesViewMode = 'grid' | 'list';
