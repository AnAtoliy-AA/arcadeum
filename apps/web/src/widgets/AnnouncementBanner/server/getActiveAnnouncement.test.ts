import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock next/* and server fetch before importing the module ────────────────
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn().mockReturnValue(null) }),
}));

const serverAuthFetchMock = vi.fn();
vi.mock('@/shared/lib/server-auth-fetch', () => ({
  serverAuthFetch: (path: string, init?: RequestInit) =>
    serverAuthFetchMock(path, init),
}));

import { getActiveAnnouncement } from './getActiveAnnouncement';
import { cookies } from 'next/headers';

type CookiesJar = Awaited<ReturnType<typeof cookies>>;

function makeOkResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function makeErrorResponse(status: number): Response {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ message: 'error' }),
  } as unknown as Response;
}

const baseAnnouncement = {
  id: 'a1',
  severity: 'info',
  updatedAt: '2026-05-09T00:00:00Z',
  title: 'Tournament Friday',
};

function jarWith(value: string | null): CookiesJar {
  return {
    get: vi.fn().mockReturnValue(value ? { value } : null),
  } as unknown as CookiesJar;
}

beforeEach(() => {
  serverAuthFetchMock.mockReset();
  vi.mocked(cookies).mockResolvedValue(jarWith(null));
});

describe('getActiveAnnouncement', () => {
  it('returns the announcement when the API responds', async () => {
    serverAuthFetchMock.mockResolvedValueOnce(
      makeOkResponse({ announcement: baseAnnouncement, messageCode: 0 }),
    );

    const result = await getActiveAnnouncement('en');

    expect(result).toEqual(baseAnnouncement);
    expect(serverAuthFetchMock).toHaveBeenCalledWith(
      '/announcements/active?locale=en',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('returns null when there is no active announcement', async () => {
    serverAuthFetchMock.mockResolvedValueOnce(
      makeOkResponse({ announcement: null, messageCode: 0 }),
    );

    expect(await getActiveAnnouncement('en')).toBeNull();
  });

  it('returns null when the API errors', async () => {
    serverAuthFetchMock.mockResolvedValueOnce(makeErrorResponse(500));

    expect(await getActiveAnnouncement('en')).toBeNull();
  });

  it('returns null when the fetch rejects (backend down)', async () => {
    serverAuthFetchMock.mockRejectedValueOnce(new Error('boom'));

    expect(await getActiveAnnouncement('en')).toBeNull();
  });

  it('returns null when the announcement was dismissed via cookie', async () => {
    serverAuthFetchMock.mockResolvedValueOnce(
      makeOkResponse({ announcement: baseAnnouncement, messageCode: 0 }),
    );
    vi.mocked(cookies).mockResolvedValue(
      jarWith('a1|2026-05-09T00%3A00%3A00Z'),
    );

    expect(await getActiveAnnouncement('en')).toBeNull();
  });

  it('keeps critical announcements even when dismissed via cookie', async () => {
    serverAuthFetchMock.mockResolvedValueOnce(
      makeOkResponse({
        announcement: { ...baseAnnouncement, severity: 'critical' },
        messageCode: 0,
      }),
    );
    vi.mocked(cookies).mockResolvedValue(
      jarWith('a1|2026-05-09T00%3A00%3A00Z'),
    );

    const result = await getActiveAnnouncement('en');

    expect(result?.severity).toBe('critical');
    expect(result?.id).toBe('a1');
  });

  it('shows a re-published announcement (updatedAt changed)', async () => {
    serverAuthFetchMock.mockResolvedValueOnce(
      makeOkResponse({
        announcement: {
          ...baseAnnouncement,
          updatedAt: '2026-05-10T00:00:00Z',
        },
        messageCode: 0,
      }),
    );
    vi.mocked(cookies).mockResolvedValue(
      jarWith('a1|2026-05-09T00%3A00%3A00Z'),
    );

    expect(await getActiveAnnouncement('en')).not.toBeNull();
  });
});
