import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: () => ({ value: 'test-token' }) }),
}));
vi.mock('@/shared/lib/api-base', () => ({
  resolveApiUrl: (path: string) => `http://localhost:4000${path}`,
}));

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import { markCompleteAction } from './tournament.actions';
import { revalidatePath } from 'next/cache';

function makeOkResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function makeErrorResponse(status: number, body: unknown = {}): Response {
  return {
    ok: false,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

const sampleTournament = {
  id: 'tour-1',
  status: 'completed',
  winnerUserId: 'user-1',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('markCompleteAction', () => {
  it('returns validation error when input is missing', async () => {
    const result = await markCompleteAction(null);
    expect(result).toEqual({ ok: false, error: 'validation' });
  });

  it('returns validation error when tournamentId is empty', async () => {
    const result = await markCompleteAction({
      tournamentId: '',
      winnerUserId: 'u1',
    });
    expect(result).toEqual({ ok: false, error: 'validation' });
  });

  it('returns validation error when winnerUserId is empty', async () => {
    const result = await markCompleteAction({
      tournamentId: 't1',
      winnerUserId: '',
    });
    expect(result).toEqual({ ok: false, error: 'validation' });
  });

  it('calls correct endpoint and returns success data', async () => {
    fetchMock.mockResolvedValue(makeOkResponse(sampleTournament));

    const result = await markCompleteAction({
      tournamentId: 'tour-1',
      winnerUserId: 'user-1',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/admin/tournaments/tour-1/complete',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ winnerUserId: 'user-1' }),
      }),
    );
    expect(result).toEqual({ ok: true, data: sampleTournament });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/tournaments');
  });

  it('returns not_registered error on 422', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(422));
    const result = await markCompleteAction({
      tournamentId: 'tour-1',
      winnerUserId: 'user-2',
    });
    expect(result).toEqual({ ok: false, error: 'not_registered' });
  });

  it('returns generic error on 500', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(500));
    const result = await markCompleteAction({
      tournamentId: 'tour-1',
      winnerUserId: 'user-1',
    });
    expect(result).toEqual({ ok: false, error: 'generic' });
  });
});
