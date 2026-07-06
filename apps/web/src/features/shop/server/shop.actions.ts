'use server';

import { revalidatePath } from 'next/cache';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
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

/**
 * Every shop mutation invalidates the /shop route + the root layout cache.
 * /shop because that's where inventory + equipped state renders directly;
 * the layout because the header BalanceChip + ProfileMenu avatar (Server-
 * Component data) should also refresh. Pair with router.refresh() on the
 * client to get an immediate visible update without a manual reload.
 */
function revalidateShopSurfaces(): void {
  revalidatePath('/shop');
  revalidatePath('/', 'layout');
}

export async function purchaseItemAction(
  itemId: string,
  purchaseId: string,
): Promise<ShopActionResult<PurchaseResult>> {
  const res = await serverAuthFetch('/shop/purchase', {
    method: 'POST',
    body: JSON.stringify({ itemId, purchaseId }),
  });
  if (!res.ok) {
    return { ok: false, error: classifyError(res.status, await res.text()) };
  }
  const data = (await res.json()) as PurchaseResult;
  revalidateShopSurfaces();
  return { ok: true, data };
}

export async function sellItemAction(
  purchaseId: string,
): Promise<ShopActionResult<SellResult>> {
  const res = await serverAuthFetch('/shop/sell', {
    method: 'POST',
    body: JSON.stringify({ purchaseId }),
  });
  if (!res.ok) {
    return { ok: false, error: classifyError(res.status, await res.text()) };
  }
  const data = (await res.json()) as SellResult;
  revalidateShopSurfaces();
  return { ok: true, data };
}

// BE InventoryService.equip / unequip return the EquippedView directly
// (not wrapped in `{ equipped: ... }`). The action result mirrors that.
export async function equipItemAction(
  itemId: string,
): Promise<ShopActionResult<EquippedView>> {
  const res = await serverAuthFetch('/shop/equip', {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  });
  if (!res.ok) {
    return { ok: false, error: classifyError(res.status, await res.text()) };
  }
  const data = (await res.json()) as EquippedView;
  revalidateShopSurfaces();
  return { ok: true, data };
}

export async function unequipItemAction(
  category: ShopCategory,
): Promise<ShopActionResult<EquippedView>> {
  const res = await serverAuthFetch('/shop/unequip', {
    method: 'POST',
    body: JSON.stringify({ category }),
  });
  if (!res.ok) {
    return { ok: false, error: classifyError(res.status, await res.text()) };
  }
  const data = (await res.json()) as EquippedView;
  revalidateShopSurfaces();
  return { ok: true, data };
}
