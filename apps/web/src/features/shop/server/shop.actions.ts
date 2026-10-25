'use server';

import { revalidatePath } from 'next/cache';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type {
  EquippedView,
  GiftResult,
  PurchaseResult,
  SellResult,
  ShopCategory,
} from './shop.types';

export type ShopActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ShopActionError; message?: string };

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
  | 'not_friends'
  | 'cannot_gift_self'
  | 'starter_not_gift'
  | 'generic';

function classifyError(status: number, body: string): ShopActionError {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'not_friends';
  if (status === 422) return 'insufficient_funds';
  const lower = body.toLowerCase();
  if (lower.includes('shop.unavailable')) return 'unavailable';
  if (lower.includes('shop.unknownitem')) return 'unknown_item';
  if (lower.includes('shop.alreadysold')) return 'already_sold';
  if (lower.includes('shop.starternotsellable')) return 'starter_not_sellable';
  if (lower.includes('shop.unequipfirst')) return 'unequip_first';
  if (lower.includes('shop.notowned')) return 'not_owned';
  if (lower.includes('shop.categorymismatch')) return 'category_mismatch';
  if (lower.includes('shop.notfriends')) return 'not_friends';
  if (lower.includes('shop.cannotgiftself')) return 'cannot_gift_self';
  if (lower.includes('shop.staternotgift')) return 'starter_not_gift';
  if (lower.includes('shop.badgenotpurchasable')) return 'unavailable';
  if (lower.includes('shop.unknownpurchase')) return 'not_owned';
  if (lower.includes('shop.norefunddue')) return 'not_owned';
  if (lower.includes('shop.signaturealreadyused')) return 'unavailable';
  if (lower.includes('shop.walletpaymentonlyforarc')) return 'unavailable';
  if (lower.includes('shop.invalidtransaction')) return 'unavailable';
  if (status >= 500) return 'unavailable';
  return 'generic';
}

async function extractActionError(
  res: Response,
): Promise<{ error: ShopActionError; message?: string }> {
  const raw = await res.text();
  let message: string | undefined;
  try {
    const parsed = JSON.parse(raw) as {
      message?: string | string[];
      error?: string;
    };
    if (typeof parsed.message === 'string') {
      message = parsed.message;
    } else if (Array.isArray(parsed.message)) {
      message = parsed.message.join(', ');
    } else if (typeof parsed.error === 'string') {
      message = parsed.error;
    }
  } catch {
    message = raw || undefined;
  }
  return {
    error: classifyError(res.status, raw),
    message,
  };
}

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
    const err = await extractActionError(res);
    return { ok: false, error: err.error, message: err.message };
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
    const err = await extractActionError(res);
    return { ok: false, error: err.error, message: err.message };
  }
  const data = (await res.json()) as SellResult;
  revalidateShopSurfaces();
  return { ok: true, data };
}

export async function equipItemAction(
  itemId: string,
): Promise<ShopActionResult<EquippedView>> {
  const res = await serverAuthFetch('/shop/equip', {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  });
  if (!res.ok) {
    const err = await extractActionError(res);
    return { ok: false, error: err.error, message: err.message };
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
    const err = await extractActionError(res);
    return { ok: false, error: err.error, message: err.message };
  }
  const data = (await res.json()) as EquippedView;
  revalidateShopSurfaces();
  return { ok: true, data };
}

export async function sendGiftAction(input: {
  recipientId: string;
  itemId: string;
  message: string;
}): Promise<ShopActionResult<GiftResult>> {
  const res = await serverAuthFetch('/shop/gift', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await extractActionError(res);
    return { ok: false, error: err.error, message: err.message };
  }
  const data = (await res.json()) as GiftResult;
  revalidateShopSurfaces();
  return { ok: true, data };
}
