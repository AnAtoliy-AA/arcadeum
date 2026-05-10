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

import {
  listAdminPackagesAction,
  createPackageAction,
  updatePackageAction,
  deletePackageAction,
} from './admin-gems.actions';
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

const samplePackage = {
  id: 'pkg-1',
  name: 'Starter Pack',
  gems: 100,
  bonusGems: 0,
  priceUsdCents: 999,
  displayOrder: 0,
  active: true,
  createdAt: '2026-05-10T00:00:00.000Z',
  updatedAt: '2026-05-10T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── listAdminPackagesAction ──────────────────────────────────────────────────

describe('listAdminPackagesAction', () => {
  it('returns packages on success', async () => {
    fetchMock.mockResolvedValue(makeOkResponse([samplePackage]));
    const result = await listAdminPackagesAction();
    expect(result).toEqual([samplePackage]);
  });

  it('returns empty array on error', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(500));
    const result = await listAdminPackagesAction();
    expect(result).toEqual([]);
  });
});

// ─── createPackageAction ──────────────────────────────────────────────────────

describe('createPackageAction', () => {
  it('returns validation error when name is empty', async () => {
    const result = await createPackageAction({
      name: '',
      gems: 100,
      priceUsdCents: 999,
    });
    expect(result).toMatchObject({ ok: false, error: 'validation' });
  });

  it('returns validation error when gems is invalid', async () => {
    const result = await createPackageAction({
      name: 'Pack',
      gems: -5,
      priceUsdCents: 999,
    });
    expect(result).toMatchObject({ ok: false, error: 'validation' });
  });

  it('returns validation error when priceUsdCents is invalid', async () => {
    const result = await createPackageAction({
      name: 'Pack',
      gems: 100,
      priceUsdCents: 0,
    });
    expect(result).toMatchObject({ ok: false, error: 'validation' });
  });

  it('calls correct endpoint and returns success data', async () => {
    fetchMock.mockResolvedValue(makeOkResponse(samplePackage));

    const result = await createPackageAction({
      name: 'Starter Pack',
      gems: 100,
      priceUsdCents: 999,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/admin/gem-packages',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toEqual({ ok: true, data: samplePackage });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/gem-packages');
  });

  it('returns validation error on 422', async () => {
    fetchMock.mockResolvedValue(
      makeErrorResponse(422, { message: 'validation error' }),
    );

    const result = await createPackageAction({
      name: 'Pack',
      gems: 100,
      priceUsdCents: 999,
    });
    expect(result).toMatchObject({ ok: false, error: 'validation' });
  });

  it('returns generic error on 500', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(500));

    const result = await createPackageAction({
      name: 'Pack',
      gems: 100,
      priceUsdCents: 999,
    });
    expect(result).toEqual({ ok: false, error: 'generic' });
  });
});

// ─── updatePackageAction ──────────────────────────────────────────────────────

describe('updatePackageAction', () => {
  it('returns validation error when id is empty', async () => {
    const result = await updatePackageAction({ id: '', name: 'New name' });
    expect(result).toMatchObject({ ok: false, error: 'validation' });
  });

  it('calls PATCH and returns updated data', async () => {
    const updated = { ...samplePackage, name: 'Updated Pack' };
    fetchMock.mockResolvedValue(makeOkResponse(updated));

    const result = await updatePackageAction({
      id: 'pkg-1',
      name: 'Updated Pack',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/admin/gem-packages/pkg-1',
      expect.objectContaining({ method: 'PATCH' }),
    );
    expect(result).toEqual({ ok: true, data: updated });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/gem-packages');
  });

  it('returns not_found error on 404', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(404));
    const result = await updatePackageAction({ id: 'missing', name: 'Pack' });
    expect(result).toEqual({ ok: false, error: 'not_found' });
  });

  it('returns generic error on 500', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(500));
    const result = await updatePackageAction({ id: 'pkg-1', active: false });
    expect(result).toEqual({ ok: false, error: 'generic' });
  });
});

// ─── deletePackageAction ──────────────────────────────────────────────────────

describe('deletePackageAction', () => {
  it('returns validation error when id is empty', async () => {
    const result = await deletePackageAction({ id: '' });
    expect(result).toMatchObject({ ok: false, error: 'validation' });
  });

  it('calls DELETE and returns deleted: true', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 204, json: vi.fn() });

    const result = await deletePackageAction({ id: 'pkg-1' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/admin/gem-packages/pkg-1',
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(result).toEqual({ ok: true, data: { deleted: true } });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/gem-packages');
  });

  it('returns not_found on 404', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(404));
    const result = await deletePackageAction({ id: 'missing' });
    expect(result).toEqual({ ok: false, error: 'not_found' });
  });

  it('returns conflict when package has pending purchases', async () => {
    fetchMock.mockResolvedValue(
      makeErrorResponse(400, { message: 'gems.packageHasPendingPurchases' }),
    );
    const result = await deletePackageAction({ id: 'pkg-1' });
    expect(result).toMatchObject({ ok: false, error: 'conflict' });
  });

  it('returns generic error on 500', async () => {
    fetchMock.mockResolvedValue(makeErrorResponse(500));
    const result = await deletePackageAction({ id: 'pkg-1' });
    expect(result).toEqual({ ok: false, error: 'generic' });
  });
});
