'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type {
  PaginatedWalletTransactions,
  WalletBalance,
  WalletTransactionView,
} from '@/features/wallet/server/wallet.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WalletCurrencyInput = 'coins' | 'gems';

export interface WalletGrantDeductInput {
  userId: string;
  currency: WalletCurrencyInput;
  amount: number;
  note?: string;
}

export type WalletActionResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: 'insufficient' | 'validation' | 'generic';
      details?: unknown;
    };

// ─── Internal validation (no zod in web deps — hand-rolled) ───────────────────

interface ValidationResult {
  ok: boolean;
  errors: string[];
}

function validateGrantDeductInput(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    return { ok: false, errors: ['Input must be an object'] };
  }

  const obj = input as Record<string, unknown>;

  if (typeof obj.userId !== 'string' || obj.userId.trim().length === 0) {
    errors.push('userId must be a non-empty string');
  }

  if (obj.currency !== 'coins' && obj.currency !== 'gems') {
    errors.push('currency must be "coins" or "gems"');
  }

  if (
    typeof obj.amount !== 'number' ||
    !Number.isInteger(obj.amount) ||
    obj.amount <= 0 ||
    obj.amount > 1_000_000
  ) {
    errors.push('amount must be a positive integer no greater than 1,000,000');
  }

  if (obj.note !== undefined) {
    if (typeof obj.note !== 'string') {
      errors.push('note must be a string');
    } else if (obj.note.length > 500) {
      errors.push('note must be at most 500 characters');
    }
  }

  return { ok: errors.length === 0, errors };
}

// ─── Shared fetch helper ───────────────────────────────────────────────────────

async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieJar = await cookies();
  const token = cookieJar.get('web_access_token')?.value;
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

export async function grantWalletAction(
  input: unknown,
): Promise<WalletActionResult<WalletTransactionView>> {
  const validation = validateGrantDeductInput(input);
  if (!validation.ok) {
    return { ok: false, error: 'validation', details: validation.errors };
  }

  const { userId, currency, amount, note } = input as WalletGrantDeductInput;

  const res = await adminFetch(
    `/admin/wallet/users/${encodeURIComponent(userId)}/grant`,
    {
      method: 'POST',
      body: JSON.stringify({ currency, amount, ...(note ? { note } : {}) }),
    },
  );

  if (res.status === 422) return { ok: false, error: 'insufficient' };
  if (!res.ok) return { ok: false, error: 'generic' };

  revalidatePath('/admin/users');
  return { ok: true, data: (await res.json()) as WalletTransactionView };
}

export async function deductWalletAction(
  input: unknown,
): Promise<WalletActionResult<WalletTransactionView>> {
  const validation = validateGrantDeductInput(input);
  if (!validation.ok) {
    return { ok: false, error: 'validation', details: validation.errors };
  }

  const { userId, currency, amount, note } = input as WalletGrantDeductInput;

  const res = await adminFetch(
    `/admin/wallet/users/${encodeURIComponent(userId)}/deduct`,
    {
      method: 'POST',
      body: JSON.stringify({ currency, amount, ...(note ? { note } : {}) }),
    },
  );

  if (res.status === 422) return { ok: false, error: 'insufficient' };
  if (!res.ok) return { ok: false, error: 'generic' };

  revalidatePath('/admin/users');
  return { ok: true, data: (await res.json()) as WalletTransactionView };
}

export async function loadAdminWalletAction(userId: string): Promise<
  WalletActionResult<{
    balance: WalletBalance;
    recent: PaginatedWalletTransactions;
  }>
> {
  if (typeof userId !== 'string' || userId.trim().length === 0) {
    return {
      ok: false,
      error: 'validation',
      details: ['userId must be a non-empty string'],
    };
  }

  const encoded = encodeURIComponent(userId);
  const [balanceRes, recentRes] = await Promise.all([
    adminFetch(`/admin/wallet/users/${encoded}/balance`),
    adminFetch(`/admin/wallet/users/${encoded}/transactions?limit=20`),
  ]);

  if (!balanceRes.ok || !recentRes.ok) return { ok: false, error: 'generic' };

  return {
    ok: true,
    data: {
      balance: (await balanceRes.json()) as WalletBalance,
      recent: (await recentRes.json()) as PaginatedWalletTransactions,
    },
  };
}
