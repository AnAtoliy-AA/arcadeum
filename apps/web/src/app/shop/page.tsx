import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { getTranslations } from '@/shared/i18n/server';
import { getWalletBalance } from '@/features/wallet/server/wallet.server';
import {
  getActivePackages,
  getConversionRate,
} from '@/features/gems/server/gems.server';
import { getCatalog, getInventory } from '@/features/shop/server/shop.server';
import { ShopPageView } from '@/features/shop/ui/ShopPageView';
import { pickNextGemPack } from '@/features/shop/lib/nextGemPack';
import { pickFeaturedDrop } from '@/features/shop/lib/featuredDrop';
import { shopEn } from '@/shared/i18n/messages/pages/shop/en';
import {
  EMPTY_INVENTORY,
  type InventoryView,
  type WalletBalanceView,
} from '@/features/shop/server/shop.types';

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getTranslations();
  const t = messages.pages?.shop;
  return {
    title: t?.meta?.title ?? 'Shop · Arcadeum',
    description:
      t?.meta?.description ?? 'Avatars, badges, name colors and game skins.',
    alternates: { canonical: '/shop' },
  };
}

const EMPTY_BALANCE: WalletBalanceView = { coins: 0, gems: 0 };

export default async function ShopPage() {
  const accessToken = await getServerAccessToken();

  const catalog = await getCatalog().catch(() => []);

  let inventory: InventoryView = EMPTY_INVENTORY;
  let balance: WalletBalanceView = EMPTY_BALANCE;
  let gemToCoinRate = 100;

  if (accessToken) {
    [inventory, balance] = await Promise.all([
      getInventory().catch(() => EMPTY_INVENTORY),
      getWalletBalance().catch(() => EMPTY_BALANCE),
    ]);
  }
  try {
    const rate = await getConversionRate();
    gemToCoinRate = rate.rate;
  } catch {
    // fall back to the default rate
  }

  const gemPacks = await getActivePackages().catch(() => []);
  const { gems: balanceGems } = balance;
  const nextGemPack = pickNextGemPack(balanceGems, gemPacks);
  const featuredDrop = pickFeaturedDrop(catalog, gemToCoinRate);

  const messages = await getTranslations();
  const labels = (messages.pages?.shop ?? shopEn) as typeof shopEn;

  return (
    <ShopPageView
      catalog={catalog}
      inventory={inventory}
      balance={balance}
      nextGemPack={nextGemPack}
      featuredDrop={featuredDrop}
      gemToCoinRate={gemToCoinRate}
      isAuthenticated={Boolean(accessToken)}
      labels={labels}
    />
  );
}
