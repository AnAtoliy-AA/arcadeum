import 'server-only';
import { serverAuthFetch } from '@/shared/lib/server-auth-fetch';
import type {
  AdminUserInventoryView,
  EffectiveShopItem,
  ShopItemOverrideView,
} from './admin-shop.types';

async function adminFetch<T>(path: string): Promise<T> {
  const res = await serverAuthFetch(path);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Admin shop fetch failed: ${res.status} ${body}`);
  }
  return (await res.json()) as T;
}

export async function getAdminCatalog(): Promise<EffectiveShopItem[]> {
  return adminFetch<EffectiveShopItem[]>('/admin/shop/catalog');
}

export async function getUserInventory(
  userId: string,
): Promise<AdminUserInventoryView> {
  return adminFetch<AdminUserInventoryView>(
    `/admin/shop/users/${encodeURIComponent(userId)}/inventory`,
  );
}

export async function listOverrides(): Promise<ShopItemOverrideView[]> {
  // Overrides are exposed via the catalog endpoint (each item has overridden
  // + priceAmount/priceCurrency). For the audit/admin view we filter on the
  // client; no dedicated /overrides route is needed for v1.
  const catalog = await getAdminCatalog();
  return catalog
    .filter((item) => item.overridden)
    .map((item) => ({
      itemId: item.id,
      available: item.available,
      priceAmount: item.priceAmount,
      priceCurrency: item.priceCurrency,
      updatedAt: null,
    }));
}
