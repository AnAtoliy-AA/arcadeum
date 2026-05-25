import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { getTranslations } from '@/shared/i18n/server';
import { getWalletBalance } from '@/features/wallet/server/wallet.server';
import {
  getActivePackages,
  getConversionRate,
} from '@/features/gems/server/gems.server';
import { getCatalog, getInventory } from '@/features/shop/server/shop.server';
import { InventoryPageView } from '@/features/shop/ui/InventoryPageView';
import { pickNextGemPack } from '@/features/shop/lib/nextGemPack';
import { shopEn } from '@/shared/i18n/messages/pages/shop/en';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { buildBreadcrumbJsonLd } from '@/shared/seo/breadcrumbJsonLd';
import { buildRoutes } from '@/shared/config/routes';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';
import { JsonLd } from '@/shared/ui/JsonLd';
import {
  EMPTY_INVENTORY,
  type InventoryView,
  type WalletBalanceView,
} from '@/features/shop/server/shop.types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // Shop metadata is reused here — there is no dedicated `inventory` SEO
  // page entry yet, and the route is gated behind auth so it never serves
  // anonymous crawlers anyway.
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'shop' }) : {};
}

const EMPTY_BALANCE: WalletBalanceView = { coins: 0, gems: 0 };

export default async function ShopInventoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
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

  const messages = await getTranslations(locale);
  const labels = (messages.pages?.shop ?? shopEn) as typeof shopEn;
  const routes = buildRoutes(locale);

  // Reuse the shop breadcrumb crumbs and append Inventory as the leaf so
  // crawlers see /shop → /shop/inventory rather than a flat single entry.
  const breadcrumb = buildBreadcrumbJsonLd({
    locale,
    homeLabel: messages.navigation?.homeTab ?? 'Home',
    trail: [
      {
        name: messages.navigation?.shopTab ?? 'Shop',
        url: routes.shop,
      },
      {
        name: labels.inventory.title,
        url: routes.shopInventory,
      },
    ],
  });

  return (
    <>
      <JsonLd id={`json-ld-shop-inventory-${locale}`} data={[breadcrumb]} />
      <InventoryPageView
        catalog={catalog}
        inventory={inventory}
        balance={balance}
        nextGemPack={nextGemPack}
        gemToCoinRate={gemToCoinRate}
        isAuthenticated={Boolean(accessToken)}
        labels={labels}
      />
    </>
  );
}
