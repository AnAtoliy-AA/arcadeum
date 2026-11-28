import type { FetchFn } from './api';

export type ConfigFetch =
  | { kind: 'modified'; body: unknown; etag: string | null }
  | { kind: 'not_modified' };

export interface ControlClient {
  fetchConfig(etag: string | null): Promise<ConfigFetch>;
  fetchCommands(): Promise<unknown>;
  ackCommand(
    id: string,
    result: 'done' | 'failed',
    message?: string,
  ): Promise<void>;
  postStatus(payload: Record<string, unknown>): Promise<void>;
}

export class ControlHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/**
 * HTTP client for the stream control plane (/stream/*). Authenticates with
 * STREAM_SERVICE_TOKEN when set, otherwise with the stream user's JWT
 * (refreshed once on 401/403). Never logs headers.
 */
export function createControlClient({
  baseUrl,
  serviceToken,
  getToken,
  fetchFn = fetch,
  timeoutMs = 10_000,
}: {
  baseUrl: string;
  serviceToken: string;
  getToken: (force?: boolean) => Promise<string>;
  fetchFn?: FetchFn;
  timeoutMs?: number;
}): ControlClient {
  async function request(
    method: string,
    path: string,
    opts: { body?: unknown; headers?: Record<string, string> } = {},
    retried = false,
  ): Promise<Response> {
    const token = serviceToken || (await getToken(retried));
    const res = await fetchFn(`${baseUrl}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        ...(opts.body ? { 'content-type': 'application/json' } : {}),
        ...opts.headers,
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (
      !serviceToken &&
      !retried &&
      (res.status === 401 || res.status === 403)
    ) {
      return request(method, path, opts, true);
    }
    return res;
  }

  const ensureOk = (res: Response, what: string): void => {
    if (!res.ok)
      throw new ControlHttpError(`${what} HTTP ${res.status}`, res.status);
  };

  return {
    async fetchConfig(etag) {
      const res = await request('GET', '/stream/config', {
        headers: etag ? { 'if-none-match': etag } : {},
      });
      if (res.status === 304) return { kind: 'not_modified' };
      ensureOk(res, 'config');
      return {
        kind: 'modified',
        body: await res.json(),
        etag: res.headers.get('etag'),
      };
    },
    async fetchCommands() {
      const res = await request('GET', '/stream/commands');
      ensureOk(res, 'commands');
      return (await res.json()) as unknown;
    },
    async ackCommand(id, result, message) {
      const res = await request(
        'POST',
        `/stream/commands/${encodeURIComponent(id)}/ack`,
        {
          body: {
            result,
            ...(message ? { message: message.slice(0, 300) } : {}),
          },
        },
      );
      ensureOk(res, 'ack');
    },
    async postStatus(payload) {
      const res = await request('POST', '/stream/status', { body: payload });
      ensureOk(res, 'status');
    },
  };
}
