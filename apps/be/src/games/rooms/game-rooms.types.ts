import { GameRoom, type GameRoomStatus } from '../schemas/game-room.schema';

export interface GameRoomMemberSummary {
  id: string;
  displayName: string;
  username?: string | null;
  email?: string | null;
  isHost: boolean;
}

export interface GameRoomSummary {
  id: string;
  gameId: string;
  name: string;
  hostId: string;
  visibility: GameRoom['visibility'];
  playerCount: number;
  maxPlayers: number | null;
  createdAt: string;
  status: GameRoomStatus;
  inviteCode?: string;
  gameOptions?: Record<string, unknown>;
  host?: GameRoomMemberSummary;
  members?: GameRoomMemberSummary[];
  viewerRole?: 'host' | 'participant' | 'none';
  viewerHasJoined?: boolean;
  viewerIsHost?: boolean;
}

export interface ListRoomsFilters {
  gameId?: string;
  status?: GameRoomStatus;
  statuses?: GameRoomStatus[];
  visibility?:
    | 'public'
    | 'private'
    | 'friends'
    | ('public' | 'private' | 'friends')[];
  userId?: string;
  participation?:
    | 'host'
    | 'participant'
    | 'any'
    | 'hosting'
    | 'joined'
    | 'not_joined';
}

export interface LeaveGameRoomResult {
  room: GameRoomSummary | null;
  deleted: boolean;
  removedPlayerId: string;
}

export interface DeleteGameRoomResult {
  roomId: string;
  deleted: boolean;
}
