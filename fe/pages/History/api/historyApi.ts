import { fetchWithRefresh, type FetchWithRefreshOptions } from '@/lib/fetchWithRefresh';
import { resolveApiBase } from '@/lib/apiBase';
import type { GameRoomSummary } from '@/pages/GamesScreen/api/gamesApi';

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export type HistoryStatus =
  | 'lobby'
  | 'in_progress'
  | 'completed'
  | 'waiting'
  | 'active';

export interface HistoryParticipant {
  id: string;
  username: string;
  email: string | null;
  isHost: boolean;
}

export interface HistorySummary {
  roomId: string;
  sessionId: string | null;
  gameId: string;
  roomName: string;
  status: HistoryStatus;
  startedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string;
  host: HistoryParticipant;
  participants: HistoryParticipant[];
}

export interface HistoryLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  scope?: 'all' | 'players';
  sender?: HistoryParticipant;
}

export interface HistoryDetail {
  summary: HistorySummary;
  logs: HistoryLogEntry[];
}

export interface RematchPayload {
  participantIds?: string[];
  gameId?: string;
  name?: string;
  visibility?: 'public' | 'private';
}

interface HistoryListResponse {
  entries?: HistorySummary[];
}

async function authorizedJson<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
  options?: FetchWithRefreshOptions,
): Promise<T> {
  const url = `${resolveApiBase()}${path}`;
  const method = init.method?.toUpperCase() ?? 'GET';
  const headers = new Headers(init.headers);
  if (method !== 'GET' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetchWithRefresh(
    url,
    { ...init, method, headers },
    {
      accessToken,
      refreshTokens: options?.refreshTokens,
    },
  );

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    let parsedBody: unknown = undefined;
    let fallbackText = '';

    if (contentType.includes('application/json')) {
      try {
        parsedBody = await response.json();
      } catch (err) {
        fallbackText = err instanceof Error ? err.message : '';
      }
    }

    if (typeof parsedBody === 'undefined') {
      fallbackText = await response.text();
    }

    const body = typeof parsedBody === 'undefined' ? fallbackText : parsedBody;
    const messageFromBody =
      typeof body === 'object' && body !== null && 'message' in body
        ? (body as { message?: unknown }).message
        : undefined;
    const message =
      typeof messageFromBody === 'string' && messageFromBody.trim().length > 0
        ? messageFromBody
        : fallbackText || `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchHistory(
  accessToken: string,
  options?: FetchWithRefreshOptions,
): Promise<HistorySummary[]> {
  if (!accessToken) {
    return [];
  }

  const data = await authorizedJson<HistoryListResponse>(
    '/games/history',
    accessToken,
    undefined,
    options,
  );

  return Array.isArray(data?.entries) ? data.entries : [];
}

export async function fetchHistoryDetail(
  roomId: string,
  accessToken: string,
  options?: FetchWithRefreshOptions,
): Promise<HistoryDetail> {
  if (!roomId || !accessToken) {
    throw new Error('Room identifier and access token are required.');
  }

  return authorizedJson<HistoryDetail>(
    `/games/history/${encodeURIComponent(roomId)}`,
    accessToken,
    undefined,
    options,
  );
}

export async function requestRematch(
  roomId: string,
  payload: RematchPayload,
  accessToken: string,
  options?: FetchWithRefreshOptions,
): Promise<{ room: GameRoomSummary }> {
  if (!roomId || !accessToken) {
    throw new Error('Room identifier and access token are required.');
  }

  return authorizedJson<{ room: GameRoomSummary }>(
    `/games/history/${encodeURIComponent(roomId)}/rematch`,
    accessToken,
    {
      method: 'POST',
      body: JSON.stringify(payload ?? {}),
    },
    options,
  );
}

export async function removeHistoryEntry(
  roomId: string,
  accessToken: string,
  options?: FetchWithRefreshOptions,
): Promise<void> {
  if (!roomId || !accessToken) {
    throw new Error('Room identifier and access token are required.');
  }

  await authorizedJson<void>(
    `/games/history/${encodeURIComponent(roomId)}`,
    accessToken,
    {
      method: 'DELETE',
    },
    options,
  );
}
