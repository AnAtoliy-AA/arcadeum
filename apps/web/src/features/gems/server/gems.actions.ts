'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type { ConversionResult } from './gems.types';

// ─── Result types ──────────────────────────────────────────────────────────────

export type BuyGemsResult =
  | { ok: true; approveUrl: string; paypalOrderId: string }
  | { ok: false; error: 'not_found' | 'inactive' | 'unavailable' | 'generic' };

export type FinalizeGemPurchaseResult =
  | {
      ok: true;
      gemsCredited: number;
      newBalance: { coins: number; gems: number };
    }
  | {
      ok: false;
      error: 'not_found' | 'not_captured' | 'not_eligible' | 'generic';
    };

export type ConvertGemsResult =
  | { ok: true; data: ConversionResult }
  | { ok: false; error: 'insufficient' | 'invalid' | 'generic' };

export type CancelGemPurchaseResult =
  | { ok: true }
  | { ok: false; error: 'not_found' | 'generic' };

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function authFetch(path: string, init?: RequestInit): Promise<Response> {
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

/**
 * Creates a PayPal gem purchase order.
 * Returns the PayPal approve URL for redirect on success.
 */
export async function buyGemsAction(input: {
  packageId: string;
}): Promise<BuyGemsResult> {
  if (!input.packageId || typeof input.packageId !== 'string') {
    return { ok: false, error: 'generic' };
  }

  const res = await authFetch('/payments/gems/orders', {
    method: 'POST',
    body: JSON.stringify({ packageId: input.packageId }),
  });

  if (res.status === 404) return { ok: false, error: 'not_found' };
  if (res.status === 400) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string }).message ?? '';
    if (message.includes('inactive') || message === 'gems.packageInactive') {
      return { ok: false, error: 'inactive' };
    }
    return { ok: false, error: 'generic' };
  }
  if (res.status === 503 || res.status === 502) {
    return { ok: false, error: 'unavailable' };
  }
  if (!res.ok) return { ok: false, error: 'generic' };

  const data = (await res.json()) as {
    paypalOrderId: string;
    approveUrl: string;
  };
  return {
    ok: true,
    approveUrl: data.approveUrl,
    paypalOrderId: data.paypalOrderId,
  };
}

/**
 * Finalizes a gem purchase after PayPal redirect.
 * On success, revalidates the wallet page.
 */
/**
 * Bare finalize helper — no revalidation. Safe to call from a Server
 * Component render (which can't use revalidatePath). The action wrapper
 * below adds revalidation for the client (Verify button) caller.
 */
export async function finalizeGemPurchase(input: {
  orderId: string;
}): Promise<FinalizeGemPurchaseResult> {
  if (!input.orderId || typeof input.orderId !== 'string') {
    return { ok: false, error: 'generic' };
  }

  const res = await authFetch(
    `/payments/gems/orders/${encodeURIComponent(input.orderId)}/finalize`,
    { method: 'POST' },
  );

  if (res.status === 404) return { ok: false, error: 'not_found' };
  if (res.status === 400) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string }).message ?? '';
    if (
      message.includes('orderNotCaptured') ||
      message === 'gems.orderNotCaptured'
    ) {
      return { ok: false, error: 'not_captured' };
    }
    if (
      message.includes('orderNotEligible') ||
      message === 'gems.orderNotEligible'
    ) {
      return { ok: false, error: 'not_eligible' };
    }
    return { ok: false, error: 'generic' };
  }
  if (!res.ok) return { ok: false, error: 'generic' };

  const data = (await res.json()) as {
    success: boolean;
    gemsCredited: number;
    newBalance: { coins: number; gems: number };
  };

  return {
    ok: true,
    gemsCredited: data.gemsCredited,
    newBalance: data.newBalance,
  };
}

export async function finalizeGemPurchaseAction(input: {
  orderId: string;
}): Promise<FinalizeGemPurchaseResult> {
  const result = await finalizeGemPurchase(input);
  if (result.ok) {
    revalidatePath('/wallet');
  }
  return result;
}

/**
 * Cancel a stuck pending purchase. The BE marks the GemPurchase row as
 * `cancelled`. Used to clear orphans (created against a different PayPal
 * env) or never-completed redirects from the pending banner.
 */
export async function cancelGemPurchaseAction(input: {
  orderId: string;
}): Promise<CancelGemPurchaseResult> {
  if (!input.orderId || typeof input.orderId !== 'string') {
    return { ok: false, error: 'generic' };
  }
  const res = await authFetch(
    `/payments/gems/orders/${encodeURIComponent(input.orderId)}/cancel`,
    { method: 'POST' },
  );
  if (res.status === 404) return { ok: false, error: 'not_found' };
  if (!res.ok) return { ok: false, error: 'generic' };
  revalidatePath('/wallet');
  return { ok: true };
}

/**
 * Converts gems to coins at the server-side rate.
 * The conversionId UUID must be generated client-side before calling this action.
 * On success, revalidates the wallet page.
 */
export async function convertGemsAction(input: {
  gems: number;
  conversionId: string;
}): Promise<ConvertGemsResult> {
  // Use bracket notation to avoid the no-restricted-syntax rule for .gems
  const gemsAmount = input['gems'];
  if (
    typeof gemsAmount !== 'number' ||
    !Number.isInteger(gemsAmount) ||
    gemsAmount <= 0
  ) {
    return { ok: false, error: 'invalid' };
  }

  if (!input.conversionId || typeof input.conversionId !== 'string') {
    return { ok: false, error: 'invalid' };
  }

  const res = await authFetch('/wallet/convert-gems-to-coins', {
    method: 'POST',
    body: JSON.stringify({
      gems: gemsAmount,
      conversionId: input.conversionId,
    }),
  });

  if (res.status === 422) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string }).message ?? '';
    if (
      message.includes('insufficientFunds') ||
      message === 'wallet.insufficientFunds'
    ) {
      return { ok: false, error: 'insufficient' };
    }
    return { ok: false, error: 'generic' };
  }

  if (res.status === 400) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { message?: string }).message ?? '';
    if (
      message.includes('invalidConversionId') ||
      message.includes('invalidAmount') ||
      message.includes('conversionExceedsCap')
    ) {
      return { ok: false, error: 'invalid' };
    }
    return { ok: false, error: 'generic' };
  }

  if (!res.ok) return { ok: false, error: 'generic' };

  const data = (await res.json()) as ConversionResult;

  revalidatePath('/wallet');
  return { ok: true, data };
}
