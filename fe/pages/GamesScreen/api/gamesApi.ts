import { fetchWithRefresh, type FetchWithRefreshOptions } from '@/lib/fetchWithRefresh';
import { resolveApiBase } from '@/lib/apiBase';

export interface CreateGameRoomParams {
  gameId: string;
  name: string;
  visibility: 'public' | 'private';
  maxPlayers?: number;
  notes?: string;
}

export interface GameRoomSummary {
  id: string;
  gameId: string;
  name: string;
  hostId: string;
  visibility: 'public' | 'private';
  playerCount: number;
  maxPlayers: number;
  createdAt: string;
  status: 'lobby' | 'in_progress' | 'completed';
  inviteCode?: string;
}

export interface CreateGameRoomResponse {
  room: GameRoomSummary;
}

export interface ListGameRoomsResponse {
  rooms: GameRoomSummary[];
}

export interface JoinGameRoomParams {
  roomId?: string;
  inviteCode?: string;
}

export interface JoinGameRoomResponse {
  room: GameRoomSummary;
}

export interface GameSessionSummary {
  id: string;
  roomId: string;
  gameId: string;
  engine: string;
  status: 'waiting' | 'active' | 'completed';
  state: Record<string, any>;
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

export interface StartGameRoomParams {
  roomId: string;
  engine?: string;
}

export interface StartGameRoomResponse {
  room: GameRoomSummary;
  session: GameSessionSummary;
}

function apiBase(): string {
  return resolveApiBase();
}

function buildInit(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  return { ...init, headers }; 
}

export async function createGameRoom(params: CreateGameRoomParams, options?: FetchWithRefreshOptions): Promise<CreateGameRoomResponse> {
  const response = await fetchWithRefresh(`${apiBase()}/games/rooms`, buildInit({
    method: 'POST',
    body: JSON.stringify(params),
  }), options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to create game room');
  }
  return response.json() as Promise<CreateGameRoomResponse>;
}

export async function listGameRooms(gameId?: string, options?: FetchWithRefreshOptions): Promise<ListGameRoomsResponse> {
  const url = new URL(`${apiBase()}/games/rooms`);
  if (gameId) url.searchParams.set('gameId', gameId);
  const response = await fetchWithRefresh(url.toString(), buildInit(), options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to fetch game rooms');
  }
  return response.json() as Promise<ListGameRoomsResponse>;
}

export async function joinGameRoom(params: JoinGameRoomParams, options?: FetchWithRefreshOptions): Promise<JoinGameRoomResponse> {
  const response = await fetchWithRefresh(`${apiBase()}/games/rooms/join`, buildInit({
    method: 'POST',
    body: JSON.stringify(params),
  }), options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to join game room');
  }
  return response.json() as Promise<JoinGameRoomResponse>;
}

export async function leaveGameRoom(params: LeaveGameRoomParams, options?: FetchWithRefreshOptions): Promise<LeaveGameRoomResponse> {
  const response = await fetchWithRefresh(`${apiBase()}/games/rooms/leave`, buildInit({
    method: 'POST',
    body: JSON.stringify(params),
  }), options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to leave game room');
  }
  return response.json() as Promise<LeaveGameRoomResponse>;
}

export async function startGameRoom(params: StartGameRoomParams, options?: FetchWithRefreshOptions): Promise<StartGameRoomResponse> {
  const response = await fetchWithRefresh(`${apiBase()}/games/rooms/start`, buildInit({
    method: 'POST',
    body: JSON.stringify(params),
  }), options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to start game');
  }
  return response.json() as Promise<StartGameRoomResponse>;
}
