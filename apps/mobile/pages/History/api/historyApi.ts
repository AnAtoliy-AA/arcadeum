import {
  fetchWithRefresh,
  type FetchWithRefreshOptions,
} from '@/lib/fetchWithRefresh';
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
  total?: number;
  page?: number;
  limit?: number;
  hasMore?: boolean;
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

export interface FetchHistoryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: HistoryStatus;
}

export interface PaginatedHistoryResponse {
  entries: HistorySummary[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function fetchHistory(
  accessToken: string,
  params?: FetchHistoryParams,
  options?: FetchWithRefreshOptions,
): Promise<PaginatedHistoryResponse> {
  if (!accessToken) {
    return { entries: [], total: 0, page: 1, limit: 20, hasMore: false };
  }

  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);

  const path = `/games/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const data = await authorizedJson<HistoryListResponse>(
    path,
    accessToken,
    undefined,
    options,
  );

  const entries = Array.isArray(data?.entries) ? data.entries : [];
  const total =
    typeof data?.total === 'number' && Number.isFinite(data.total)
      ? data.total
      : entries.length;
  const page =
    typeof data?.page === 'number' && data.page > 0
      ? data.page
      : params?.page && params.page > 0
        ? params.page
        : 1;
  const limit =
    typeof data?.limit === 'number' && data.limit > 0
      ? data.limit
      : params?.limit && params.limit > 0
        ? params.limit
        : 20;
  const hasMore =
    typeof data?.hasMore === 'boolean' ? data.hasMore : page * limit < total;

  return { entries, total, page, limit, hasMore };
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
