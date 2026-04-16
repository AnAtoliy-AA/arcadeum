import { GetRoomsResponse } from '@/features/games/api';

export interface GamesClientProps {
  initialData: GetRoomsResponse | null;
}

export type GamesStatusFilter = 'all' | 'lobby' | 'in_progress' | 'completed';

export type GamesParticipationFilter =
  | 'all'
  | 'hosting'
  | 'joined'
  | 'not_joined';

export type GamesViewMode = 'grid' | 'list';
