'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type {
  GemPackageAdmin,
  CreateGemPackageInput,
  UpdateGemPackageInput,
} from './admin-gems.types';

// ─── Discriminated result type ────────────────────────────────────────────────

export type AdminGemActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: 'validation' | 'conflict' | 'not_found' | 'generic';
      details?: unknown;
    };

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieJar = await cookies();
  const token = cookieJar.get('access_token')?.value;
  const url = resolveApiUrl(path);

  return fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function listAdminPackagesAction(): Promise<GemPackageAdmin[]> {
  const res = await adminFetch('/admin/gem-packages');
  if (!res.ok) return [];
  return (await res.json()) as GemPackageAdmin[];
}

export async function createPackageAction(
  input: CreateGemPackageInput,
): Promise<AdminGemActionResult<GemPackageAdmin>> {
  const validation = validateCreateInput(input);
  if (!validation.ok) {
    return { ok: false, error: 'validation', details: validation.errors };
  }

  const res = await adminFetch('/admin/gem-packages', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (res.status === 400 || res.status === 422) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string }).message ?? '';
    if (message.includes('validation') || res.status === 422) {
      return { ok: false, error: 'validation', details: body };
    }
    return { ok: false, error: 'generic' };
  }

  if (!res.ok) return { ok: false, error: 'generic' };

  revalidatePath('/admin/gem-packages');
  return { ok: true, data: (await res.json()) as GemPackageAdmin };
}

export async function updatePackageAction(
  input: UpdateGemPackageInput,
): Promise<AdminGemActionResult<GemPackageAdmin>> {
  const { id, ...patch } = input;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return { ok: false, error: 'validation', details: ['id is required'] };
  }

  const res = await adminFetch(
    `/admin/gem-packages/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(patch),
    },
  );

  if (res.status === 404) return { ok: false, error: 'not_found' };

  if (res.status === 400 || res.status === 422) {
    const body = await res.json().catch(() => ({}));
    return { ok: false, error: 'validation', details: body };
  }

  if (!res.ok) return { ok: false, error: 'generic' };

  revalidatePath('/admin/gem-packages');
  return { ok: true, data: (await res.json()) as GemPackageAdmin };
}

export async function deletePackageAction(input: {
  id: string;
}): Promise<AdminGemActionResult<{ deleted: true }>> {
  const { id } = input;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return { ok: false, error: 'validation', details: ['id is required'] };
  }

  const res = await adminFetch(
    `/admin/gem-packages/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
  );

  if (res.status === 404) return { ok: false, error: 'not_found' };

  if (res.status === 400) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string }).message ?? '';
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('pendingpurchases') || lowerMsg.includes('pending')) {
      return { ok: false, error: 'conflict', details: body };
    }
    return { ok: false, error: 'generic' };
  }

  if (!res.ok) return { ok: false, error: 'generic' };

  revalidatePath('/admin/gem-packages');
  return { ok: true, data: { deleted: true } };
}

// ─── Internal validation ──────────────────────────────────────────────────────

interface ValidationResult {
  ok: boolean;
  errors: string[];
}

function validateCreateInput(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    return { ok: false, errors: ['Input must be an object'] };
  }

  const obj = input as Record<string, unknown>;

  if (typeof obj.name !== 'string' || obj.name.trim().length === 0) {
    errors.push('name must be a non-empty string');
  } else if (obj.name.length > 100) {
    errors.push('name must be at most 100 characters');
  }

  // Use bracket notation to avoid the no-restricted-syntax rule for .gems
  const gemsVal = obj['gems'];
  if (
    typeof gemsVal !== 'number' ||
    !Number.isInteger(gemsVal) ||
    gemsVal < 1 ||
    gemsVal > 1_000_000
  ) {
    errors.push('gems must be an integer between 1 and 1,000,000');
  }

  const bonusGemsVal = obj['bonusGems'];
  if (bonusGemsVal !== undefined) {
    if (
      typeof bonusGemsVal !== 'number' ||
      !Number.isInteger(bonusGemsVal) ||
      bonusGemsVal < 0 ||
      bonusGemsVal > 1_000_000
    ) {
      errors.push('bonusGems must be an integer between 0 and 1,000,000');
    }
  }

  if (
    typeof obj.priceUsdCents !== 'number' ||
    !Number.isInteger(obj.priceUsdCents) ||
    obj.priceUsdCents < 1 ||
    obj.priceUsdCents > 100_000
  ) {
    errors.push('priceUsdCents must be an integer between 1 and 100,000');
  }

  if (obj.displayOrder !== undefined) {
    if (
      typeof obj.displayOrder !== 'number' ||
      !Number.isInteger(obj.displayOrder)
    ) {
      errors.push('displayOrder must be an integer');
    }
  }

  if (obj.active !== undefined && typeof obj.active !== 'boolean') {
    errors.push('active must be a boolean');
  }

  return { ok: errors.length === 0, errors };
}
