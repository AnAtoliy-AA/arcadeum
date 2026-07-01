import type { GameId } from './themes';

export type Visibility = 'public' | 'unlisted' | 'private';
export type PresetId = 'ranked' | 'friends' | 'party' | 'custom';
export type MaxPlayers = number | 'auto';

export interface CreateRoomForm {
  gameId: GameId;
  themeId: string;
  expansionPackIds: string[];
  maxPlayers: MaxPlayers;
  visibility: Visibility;
  roomName: string;
  notes: string;
  rules: {
    combos: boolean;
    idle: boolean;
    teams: boolean;
    spectators: boolean;
  };
  preset: PresetId;
}

export const ROOM_NAME_MAX = 40;
export const NOTES_MAX = 240;
