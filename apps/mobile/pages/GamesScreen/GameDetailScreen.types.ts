import type { GameRoomSummary } from './api/gamesApi';

export type InvitePromptState = {
  visible: boolean;
  room: GameRoomSummary | null;
  mode: 'room' | 'manual';
  loading: boolean;
  error: string | null;
};
