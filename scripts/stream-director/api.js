'use strict';

/**
 * Minimal Arcadeum BE client for the director. Logs in with the dedicated
 * stream user (email/password from env), re-logging in on 401.
 */
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function createApi({ be, fetchFn = globalThis.fetch, timeoutMs = 15000 }) {
  let token = null;

  async function raw(method, path, body, auth) {
    const res = await fetchFn(`${be.url}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        ...(auth && token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      /* empty body */
    }
    if (!res.ok)
      throw new ApiError(data?.message || `HTTP ${res.status}`, res.status);
    return data;
  }

  async function login() {
    if (!be.password) throw new Error('STREAM_BOT_PASSWORD is not set');
    const data = await raw(
      'POST',
      '/auth/login',
      { email: be.email, password: be.password },
      false,
    );
    token = data?.accessToken;
    if (!token) throw new Error('login returned no accessToken');
  }

  async function authed(method, path, body) {
    if (!token) await login();
    try {
      return await raw(method, path, body, true);
    } catch (err) {
      if (err.status !== 401) throw err;
      await login();
      return raw(method, path, body, true);
    }
  }

  return {
    login,
    /** Create + auto-start an AI-vs-AI room. Returns the room summary. */
    async createAiVsAi({ gameId, theme, moveDelayMs, personalities }) {
      const data = await authed('POST', '/games/ai-vs-ai', {
        gameId,
        theme,
        aiMoveDelayMs: moveDelayMs,
        ...(personalities
          ? {
              botPersonalityWhite: personalities[0],
              botPersonalityBlack: personalities[1],
            }
          : {}),
      });
      if (!data?.room?.id) throw new Error('create returned no room id');
      return data.room;
    },
    /** { room, session } for the stream user. */
    getRoomInfo(roomId) {
      return authed('POST', '/games/room-info', { roomId });
    },
    /** Best effort: remove the room so a stuck game stops. */
    async abandonRoom(roomId) {
      try {
        await authed('POST', '/games/rooms/delete', { roomId });
        return true;
      } catch {
        return false;
      }
    },
  };
}

module.exports = { createApi, ApiError };
