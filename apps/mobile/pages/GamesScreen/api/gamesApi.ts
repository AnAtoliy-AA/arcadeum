import {
  fetchWithRefresh,
  type FetchWithRefreshOptions,
} from '@/lib/fetchWithRefresh';
import { resolveApiBase } from '@/lib/apiBase';

export interface CreateGameRoomParams {
  gameId: string;
  name: string;
  visibility: 'public' | 'private';
  maxPlayers?: number;
  notes?: string;
}

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
  visibility: 'public' | 'private';
  playerCount: number;
  maxPlayers: number | null;
  createdAt: string;
  status: 'lobby' | 'in_progress' | 'completed';
  inviteCode?: string;
  host?: GameRoomMemberSummary;
  members?: GameRoomMemberSummary[];
  viewerRole?: 'host' | 'participant' | 'none';
  viewerHasJoined?: boolean;
  viewerIsHost?: boolean;
}

export interface CreateGameRoomResponse {
  room: GameRoomSummary;
}

export interface ListGameRoomsResponse {
  rooms: GameRoomSummary[];
}

export interface ListGameRoomsParams {
  gameId?: string;
  statuses?: ('lobby' | 'in_progress' | 'completed')[];
  visibility?: ('public' | 'private')[];
  participation?: 'all' | 'hosting' | 'joined' | 'not_joined';
}

export interface JoinGameRoomParams {
  roomId?: string;
  inviteCode?: string;
}

export interface JoinGameRoomResponse {
  room: GameRoomSummary;
}

export interface GetGameRoomResponse {
  room: GameRoomSummary;
}

export interface GameSessionSummary {
  id: string;
  roomId: string;
  gameId: string;
  engine: string;
  status: 'waiting' | 'active' | 'completed';
  state: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveGameRoomParams {
  roomId: string;
}

export interface LeaveGameRoomResponse {
  room: GameRoomSummary | null;
  session: GameSessionSummary | null;
  deleted: boolean;
  removedPlayerId: string;
}

export interface DeleteGameRoomParams {
  roomId: string;
}

export interface DeleteGameRoomResponse {
  roomId: string;
  deleted: boolean;
}

export interface StartGameRoomParams {
  roomId: string;
  engine?: string;
}

export interface StartGameRoomResponse {
  room: GameRoomSummary;
  session: GameSessionSummary;
}

export interface GetGameRoomSessionResponse {
  session: GameSessionSummary | null;
}

function apiBase(): string {
  return resolveApiBase();
}

function buildInit(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  return { ...init, headers };
}

export async function createGameRoom(
  params: CreateGameRoomParams,
  options?: FetchWithRefreshOptions,
): Promise<CreateGameRoomResponse> {
  const response = await fetchWithRefresh(
    `${apiBase()}/games/rooms`,
    buildInit({
      method: 'POST',
      body: JSON.stringify(params),
    }),
    options,
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to create game room');
  }
  return response.json() as Promise<CreateGameRoomResponse>;
}

export async function listGameRooms(
  params?: ListGameRoomsParams,
  options?: FetchWithRefreshOptions,
): Promise<ListGameRoomsResponse> {
  const url = new URL(`${apiBase()}/games/rooms`);
  if (params?.gameId) {
    url.searchParams.set('gameId', params.gameId);
  }
  if (params?.statuses?.length) {
    url.searchParams.set('status', params.statuses.join(','));
  }
  if (params?.visibility?.length) {
    url.searchParams.set('visibility', params.visibility.join(','));
  }
  if (params?.participation) {
    url.searchParams.set('participation', params.participation);
  }

  const response = await fetchWithRefresh(url.toString(), buildInit(), options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch game rooms');
  }
  return response.json() as Promise<ListGameRoomsResponse>;
}

export async function getGameRoom(
  roomId: string,
  options?: FetchWithRefreshOptions,
): Promise<GetGameRoomResponse> {
  const response = await fetchWithRefresh(
    `${apiBase()}/games/rooms/${encodeURIComponent(roomId)}`,
    buildInit(),
    options,
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to load game room');
  }
  return response.json() as Promise<GetGameRoomResponse>;
}

export async function joinGameRoom(
  params: JoinGameRoomParams,
  options?: FetchWithRefreshOptions,
): Promise<JoinGameRoomResponse> {
  const response = await fetchWithRefresh(
    `${apiBase()}/games/rooms/join`,
    buildInit({
      method: 'POST',
      body: JSON.stringify(params),
    }),
    options,
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to join game room');
  }
  return response.json() as Promise<JoinGameRoomResponse>;
}

export async function leaveGameRoom(
  params: LeaveGameRoomParams,
  options?: FetchWithRefreshOptions,
): Promise<LeaveGameRoomResponse> {
  const response = await fetchWithRefresh(
    `${apiBase()}/games/rooms/leave`,
    buildInit({
      method: 'POST',
      body: JSON.stringify(params),
    }),
    options,
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to leave game room');
  }
  return response.json() as Promise<LeaveGameRoomResponse>;
}

export async function startGameRoom(
  params: StartGameRoomParams,
  options?: FetchWithRefreshOptions,
): Promise<StartGameRoomResponse> {
  const response = await fetchWithRefresh(
    `${apiBase()}/games/rooms/start`,
    buildInit({
      method: 'POST',
      body: JSON.stringify(params),
    }),
    options,
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to start game');
  }
  return response.json() as Promise<StartGameRoomResponse>;
}

export async function getGameRoomSession(
  roomId: string,
  options?: FetchWithRefreshOptions,
): Promise<GetGameRoomSessionResponse> {
  const response = await fetchWithRefresh(
    `${apiBase()}/games/rooms/${encodeURIComponent(roomId)}/session`,
    buildInit(),
    options,
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to load game session');
  }
  return response.json() as Promise<GetGameRoomSessionResponse>;
}

export async function deleteGameRoom(
  params: DeleteGameRoomParams,
  options?: FetchWithRefreshOptions,
): Promise<DeleteGameRoomResponse> {
  const response = await fetchWithRefresh(
    `${apiBase()}/games/rooms/delete`,
    buildInit({
      method: 'POST',
      body: JSON.stringify(params),
    }),
    options,
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to delete game room');
  }
  return response.json() as Promise<DeleteGameRoomResponse>;
}
