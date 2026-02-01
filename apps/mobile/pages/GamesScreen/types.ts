import type { GameRoomSummary } from './api/gamesApi';

export type InvitePromptState = {
  visible: boolean;
  room: GameRoomSummary | null;
  mode: 'room' | 'manual';
  loading: boolean;
  error: string | null;
};

export type StatusFilterValue = 'all' | 'lobby' | 'in_progress' | 'completed';
export type ParticipationFilterValue =
  | 'all'
  | 'hosting'
  | 'joined'
  | 'not_joined';

export type FilterOption<T> = {
  value: T;
  label: string;
};

export type ParticipationFilterOption =
  FilterOption<ParticipationFilterValue> & {
    requiresAuth: boolean;
  };
