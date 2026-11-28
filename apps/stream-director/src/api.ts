import type {
  CreateAiVsAiRequest,
  CreateAiVsAiResponse,
  DirectorApi,
  LoginResponse,
  RoomInfoResponse,
  RoomSummary,
} from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export type FetchFn = typeof fetch;

export interface BeApi extends DirectorApi {
  login(): Promise<void>;
  /** Bearer token of the stream user (logs in on first use). */
  getToken(force?: boolean): Promise<string>;
}

interface ErrorBody {
  message?: string;
}

/**
 * Minimal Arcadeum BE client for the director. Logs in with the dedicated
 * stream user (email/password from env), re-logging in on 401.
 */
export function createApi({
  be,
  fetchFn = fetch,
  timeoutMs = 15000,
}: {
  be: { url: string; email: string; password: string };
  fetchFn?: FetchFn;
  timeoutMs?: number;
}): BeApi {
  let token: string | null = null;

  async function raw<T>(
    method: string,
    path: string,
    body: unknown,
    auth: boolean,
  ): Promise<T> {
    const res = await fetchFn(`${be.url}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(auth && token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      /* empty body */
    }
    if (!res.ok) {
      throw new ApiError(
        (data as ErrorBody | null)?.message ?? `HTTP ${res.status}`,
        res.status,
      );
    }
    return data as T;
  }

  async function login(): Promise<void> {
    if (!be.password) throw new Error('STREAM_BOT_PASSWORD is not set');
    const data = await raw<LoginResponse>(
      'POST',
      '/auth/login',
      { email: be.email, password: be.password },
      false,
    );
    token = data?.accessToken ?? null;
    if (!token) throw new Error('login returned no accessToken');
  }

  async function authed<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    if (!token) await login();
    try {
      return await raw<T>(method, path, body, true);
    } catch (err) {
      if (!(err instanceof ApiError) || err.status !== 401) throw err;
      await login();
      return raw<T>(method, path, body, true);
    }
  }

  return {
    login,
    async getToken(force = false): Promise<string> {
      if (!token || force) await login();
      return token ?? '';
    },
    /** Create + auto-start an AI-vs-AI room. Returns the room summary. */
    async createAiVsAi({
      gameId,
      theme,
      moveDelayMs,
      botDifficulty,
      personalities,
    }): Promise<RoomSummary> {
      const req: CreateAiVsAiRequest = {
        gameId,
        theme,
        aiMoveDelayMs: moveDelayMs,
        ...(botDifficulty ? { botDifficulty } : {}),
        ...(personalities
          ? {
              botPersonalityWhite: personalities[0],
              botPersonalityBlack: personalities[1],
            }
          : {}),
      };
      const data = await authed<CreateAiVsAiResponse>(
        'POST',
        '/games/ai-vs-ai',
        req,
      );
      if (!data?.room?.id) throw new Error('create returned no room id');
      return data.room;
    },
    /** { room, session } for the stream user. */
    getRoomInfo(roomId: string): Promise<RoomInfoResponse> {
      return authed<RoomInfoResponse>('POST', '/games/room-info', { roomId });
    },
    /** Best effort: remove the room so a stuck game stops. */
    async abandonRoom(roomId: string): Promise<boolean> {
      try {
        await authed('POST', '/games/rooms/delete', { roomId });
        return true;
      } catch {
        return false;
      }
    },
  };
}
