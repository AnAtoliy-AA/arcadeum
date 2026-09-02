import { GameRoom, type GameRoomStatus } from '../schemas/game-room.schema';

export interface GameRoomMemberSummary {
  id: string;
  displayName: string;
  username?: string | null;
  email?: string | null;
  isHost: boolean;
  equippedAvatarId?: string | null;
  equippedBadgeId?: string | null;
  equippedNameColorId?: string | null;
  equippedFrameId?: string | null;
  equippedAuraId?: string | null;
  equippedBannerId?: string | null;
  equippedBackgroundId?: string | null;
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
  notes?: string | null;
  gameOptions?: Record<string, unknown>;
  hasPassword?: boolean;
  rematchInvitedUsers?: GameRoomMemberSummary[];
  rematchDeclinedUsers?: GameRoomMemberSummary[];
  invitationTimeout?: number;
  host?: GameRoomMemberSummary;
  members?: GameRoomMemberSummary[];
  viewerRole?: 'host' | 'participant' | 'none';
  viewerHasJoined?: boolean;
  viewerIsHost?: boolean;
  chatLogs?: Array<{
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    scope: string;
    createdAt: string;
  }>;
}

export interface ListRoomsFilters {
  gameId?: string;
  search?: string;
  status?: string;
  statuses?: GameRoomStatus[];
  visibility?:
    'public' | 'private' | 'friends' | ('public' | 'private' | 'friends')[];
  userId?: string;
  participation?:
    'host' | 'participant' | 'any' | 'hosting' | 'joined' | 'not_joined';
  aiVsAi?: boolean;
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface ListRoomsResult {
  rooms: GameRoomSummary[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface LeaveGameRoomResult {
  room: GameRoomSummary | null;
  deleted: boolean;
  removedPlayerId: string;
  kicked: boolean;
}

export interface DeleteGameRoomResult {
  roomId: string;
  deleted: boolean;
}

export interface JoinGameRoomResult {
  room: GameRoomSummary;
  added: boolean;
}
