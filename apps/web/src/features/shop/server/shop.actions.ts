'use server';

import { cookies } from 'next/headers';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type {
  EquippedView,
  PurchaseResult,
  SellResult,
  ShopCategory,
} from './shop.types';

export type ShopActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ShopActionError };

export type ShopActionError =
  | 'insufficient_funds'
  | 'unavailable'
  | 'unknown_item'
  | 'already_sold'
  | 'starter_not_sellable'
  | 'unequip_first'
  | 'not_owned'
  | 'category_mismatch'
  | 'unauthorized'
  | 'generic';

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

function classifyError(status: number, body: string): ShopActionError {
  if (status === 401) return 'unauthorized';
  if (status === 422) return 'insufficient_funds';
  const lower = body.toLowerCase();
  if (lower.includes('shop.unavailable')) return 'unavailable';
  if (lower.includes('shop.unknownitem')) return 'unknown_item';
  if (lower.includes('shop.alreadysold')) return 'already_sold';
  if (lower.includes('shop.starternotsellable')) return 'starter_not_sellable';
  if (lower.includes('shop.unequipfirst')) return 'unequip_first';
  if (lower.includes('shop.notowned')) return 'not_owned';
  if (lower.includes('shop.categorymismatch')) return 'category_mismatch';
  return 'generic';
}

export async function purchaseItemAction(
  itemId: string,
  purchaseId: string,
): Promise<ShopActionResult<PurchaseResult>> {
  const res = await authFetch('/shop/purchase', {
    method: 'POST',
    body: JSON.stringify({ itemId, purchaseId }),
  });
  if (!res.ok) {
    return { ok: false, error: classifyError(res.status, await res.text()) };
  }
  return { ok: true, data: (await res.json()) as PurchaseResult };
}

export async function sellItemAction(
  purchaseId: string,
): Promise<ShopActionResult<SellResult>> {
  const res = await authFetch('/shop/sell', {
    method: 'POST',
    body: JSON.stringify({ purchaseId }),
  });
  if (!res.ok) {
    return { ok: false, error: classifyError(res.status, await res.text()) };
  }
  return { ok: true, data: (await res.json()) as SellResult };
}

export async function equipItemAction(
  itemId: string,
): Promise<ShopActionResult<{ equipped: EquippedView }>> {
  const res = await authFetch('/shop/equip', {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  });
  if (!res.ok) {
    return { ok: false, error: classifyError(res.status, await res.text()) };
  }
  return { ok: true, data: (await res.json()) as { equipped: EquippedView } };
}

export async function unequipItemAction(
  category: ShopCategory,
): Promise<ShopActionResult<{ equipped: EquippedView }>> {
  const res = await authFetch('/shop/unequip', {
    method: 'POST',
    body: JSON.stringify({ category }),
  });
  if (!res.ok) {
    return { ok: false, error: classifyError(res.status, await res.text()) };
  }
  return { ok: true, data: (await res.json()) as { equipped: EquippedView } };
}
