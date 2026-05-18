import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import {
  WalletUnauthorizedError,
  getWalletBalance,
  getWalletTransactions,
} from '@/features/wallet/server/wallet.server';
import { WalletPageView } from '@/features/wallet/ui/WalletPageView';
import type {
  PaginatedWalletTransactions,
  WalletBalance,
  WalletCurrency,
} from '@/features/wallet/server/wallet.types';
import { PendingGemPurchases } from '@/features/gems/ui/PendingGemPurchases';
import { GemStore } from '@/features/gems/ui/GemStore';
import { ConvertGemsForm } from '@/features/gems/ui/ConvertGemsForm';
import { getConversionRate } from '@/features/gems/server/gems.server';
import { DailyRewardCard } from '@/features/daily-rewards/ui/DailyRewardCard';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale } from '@/shared/i18n';

// <WalletLiveBridge /> is mounted once in apps/web/src/app/layout.tsx — no
// need to render it here.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? buildPageMetadata({ locale, page: 'wallet' }) : {};
}

interface SearchParams {
  currency?: string;
  cursor?: string;
}

function parseCurrency(input?: string): WalletCurrency | undefined {
  return input === 'coins' || input === 'gems' ? input : undefined;
}

const EMPTY_BALANCE: WalletBalance = { coins: 0, gems: 0 };
const EMPTY_PAGE: PaginatedWalletTransactions = { items: [], nextCursor: null };

export default async function WalletPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const currency = parseCurrency(sp.currency);
  const cursor = sp.cursor;

  // Fetch the conversion rate server-side (no auth needed — public endpoint).
  let conversionRate = 100;
  try {
    const rateData = await getConversionRate();
    conversionRate = rateData.rate;
  } catch {
    // Fallback to default if BE is unavailable
  }

  // Render an empty state for unauthenticated visitors so the route stays
  // crawlable and never 5xxs. The header chip is also gated on auth, so an
  // unauthenticated session shouldn't normally land here, but bots / direct
  // links can.
  const accessToken = await getServerAccessToken();
  if (!accessToken) {
    return (
      <div>
        <PageBreadcrumb locale={locale} page="wallet" />
        <WalletPageView
          balance={EMPTY_BALANCE}
          page={EMPTY_PAGE}
          currency={currency}
        />
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '0 16px 32px',
          }}
          data-testid="gem-sections"
        >
          {/* GemStore is always shown — no auth required for browsing */}
          <div id="gem-store" style={{ marginBottom: '32px' }}>
            <GemStore />
          </div>
        </div>
      </div>
    );
  }

  let balance = EMPTY_BALANCE;
  let page = EMPTY_PAGE;
  try {
    [balance, page] = await Promise.all([
      getWalletBalance(),
      getWalletTransactions({ currency, cursor, limit: 20 }),
    ]);
  } catch (err) {
    // A stale/invalid token (401) is expected — e.g. after logout, expiry, or
    // an e2e reload — so fall through to the empty state without logging.
    // Other failures (network, 5xx) are still worth surfacing.
    if (!(err instanceof WalletUnauthorizedError)) {
      console.error('Failed to load wallet during SSR:', err);
    }
  }

  const { gems: currentGems } = balance;

  return (
    <div>
      <PageBreadcrumb locale={locale} page="wallet" />
      {/* Daily reward CTA. Rendered above the wallet view so the claim flow is
          the first thing a returning player sees. The card self-suppresses
          (returns null) when the BE call fails — same defensive pattern as
          BalanceChip — so it never blocks the page from rendering. */}
      <DailyRewardCard />

      <WalletPageView balance={balance} page={page} currency={currency} />

      {/* Gem sections: pending purchases banner, gem store, and conversion form */}
      <div
        style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px 48px' }}
        data-testid="gem-sections"
      >
        {/* Pending purchases banner — renders nothing if no pending purchases */}
        <PendingGemPurchases />

        {/* Gem store — lists purchasable packages */}
        <div id="gem-store" style={{ marginBottom: '32px' }}>
          <GemStore />
        </div>

        {/* Convert gems to coins form */}
        <ConvertGemsForm rate={conversionRate} currentGems={currentGems} />
      </div>
    </div>
  );
}
