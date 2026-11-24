import { createControlClient } from './controlClient';

const res = (
  status: number,
  body?: unknown,
  headers: Record<string, string> = {},
) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
    json: () => Promise.resolve(body),
  }) as unknown as Response;

describe('createControlClient', () => {
  it('sends If-None-Match and the service token, returns not_modified on 304', async () => {
    const fetchFn = jest.fn(() => Promise.resolve(res(304)));
    const c = createControlClient({
      baseUrl: 'http://be',
      serviceToken: 'svc-token',
      getToken: jest.fn(),
      fetchFn: fetchFn,
    });
    expect(await c.fetchConfig('"stream-v1"')).toEqual({
      kind: 'not_modified',
    });
    const [url, init] = fetchFn.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('http://be/stream/config');
    const h = init.headers as Record<string, string>;
    expect(h.authorization).toBe('Bearer svc-token');
    expect(h['if-none-match']).toBe('"stream-v1"');
  });

  it('returns body and etag on 200', async () => {
    const c = createControlClient({
      baseUrl: 'http://be',
      serviceToken: 't',
      getToken: jest.fn(),
      fetchFn: () =>
        Promise.resolve(res(200, { version: 2 }, { etag: '"stream-v2"' })),
    });
    expect(await c.fetchConfig(null)).toEqual({
      kind: 'modified',
      body: { version: 2 },
      etag: '"stream-v2"',
    });
  });

  it('falls back to the stream user JWT and refreshes it once on 401', async () => {
    const getToken = jest.fn((force?: boolean) =>
      Promise.resolve(force ? 'new' : 'old'),
    );
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce(res(401))
      .mockResolvedValueOnce(res(200, []));
    const c = createControlClient({
      baseUrl: 'http://be',
      serviceToken: '',
      getToken,
      fetchFn: fetchFn,
    });
    await c.fetchCommands();
    expect(getToken).toHaveBeenCalledWith(true);
    const second = fetchFn.mock.calls[1] as unknown as [string, RequestInit];
    expect((second[1].headers as Record<string, string>).authorization).toBe(
      'Bearer new',
    );
  });

  it('throws on server errors so the loop can keep the last config', async () => {
    const c = createControlClient({
      baseUrl: 'http://be',
      serviceToken: 't',
      getToken: jest.fn(),
      fetchFn: () => Promise.resolve(res(503)),
    });
    await expect(c.fetchConfig(null)).rejects.toThrow('config HTTP 503');
    await expect(c.postStatus({})).rejects.toThrow('status HTTP 503');
  });
});
