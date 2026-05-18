import { GetRoomsResponse } from '@/features/games/api';

export interface GamesClientProps {
  initialData: GetRoomsResponse | null;
  // When set, the lounge is scoped to a single game (e.g. /games/sea_battle_v1)
  // — it hides nothing visually but every API call carries this filter and
  // the page title swaps to the game-specific label.
  gameId?: string;
  pageTitle?: string;
}

export type GamesStatusFilter = 'all' | 'lobby' | 'in_progress' | 'completed';

export type GamesParticipationFilter =
  | 'all'
  | 'hosting'
  | 'joined'
  | 'not_joined';

export type GamesViewMode = 'grid' | 'list';
