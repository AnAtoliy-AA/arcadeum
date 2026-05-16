'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { resolveApiUrl } from '@/shared/lib/api-base';
import type {
  EffectiveShopItem,
  InventoryItemView,
  ShopPriceCurrency,
} from '@/features/shop/server/shop.types';

export type AdminShopActionError =
  | 'validation'
  | 'not_found'
  | 'forbidden'
  | 'already_sold'
  | 'generic';

export type AdminShopActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AdminShopActionError };

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

function classify(status: number): AdminShopActionError {
  if (status === 400) return 'validation';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  return 'generic';
}

export async function setShopOverrideAction(input: {
  itemId: string;
  available?: boolean | null;
  priceAmount?: number | null;
  priceCurrency?: ShopPriceCurrency | null;
}): Promise<AdminShopActionResult<EffectiveShopItem>> {
  const { itemId, ...patch } = input;
  if (!itemId.trim()) return { ok: false, error: 'validation' };
  if (
    patch.priceAmount !== undefined &&
    patch.priceAmount !== null &&
    (!Number.isInteger(patch.priceAmount) ||
      patch.priceAmount < 0 ||
      patch.priceAmount > 1_000_000)
  ) {
    return { ok: false, error: 'validation' };
  }

  const res = await adminFetch(
    `/admin/shop/overrides/${encodeURIComponent(itemId)}`,
    { method: 'PATCH', body: JSON.stringify(patch) },
  );
  if (!res.ok) return { ok: false, error: classify(res.status) };
  revalidatePath('/admin/shop');
  return { ok: true, data: (await res.json()) as EffectiveShopItem };
}

export async function grantShopItemAction(input: {
  userId: string;
  itemId: string;
  reason: string;
  nonce: string;
}): Promise<AdminShopActionResult<InventoryItemView>> {
  if (
    !input.userId.trim() ||
    !input.itemId.trim() ||
    !input.nonce.trim() ||
    !input.reason.trim()
  ) {
    return { ok: false, error: 'validation' };
  }

  const res = await adminFetch('/admin/shop/grant', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) return { ok: false, error: classify(res.status) };
  revalidatePath('/admin/shop');
  return { ok: true, data: (await res.json()) as InventoryItemView };
}

export async function revokeInventoryAction(input: {
  rowId: string;
  reason: string;
}): Promise<AdminShopActionResult<InventoryItemView>> {
  if (!input.rowId.trim() || !input.reason.trim()) {
    return { ok: false, error: 'validation' };
  }
  const res = await adminFetch(
    `/admin/shop/inventory/${encodeURIComponent(input.rowId)}/revoke`,
    { method: 'POST', body: JSON.stringify({ reason: input.reason }) },
  );
  if (res.status === 400) {
    const body = await res.text();
    if (body.toLowerCase().includes('alreadysold')) {
      return { ok: false, error: 'already_sold' };
    }
    return { ok: false, error: 'validation' };
  }
  if (!res.ok) return { ok: false, error: classify(res.status) };
  return { ok: true, data: (await res.json()) as InventoryItemView };
}
