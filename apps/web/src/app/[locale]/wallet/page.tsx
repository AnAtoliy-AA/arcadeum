import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import {
  WalletUnauthorizedError,
  getWalletBalance,
  getWalletTransactions,
} from '@/features/wallet/server/wallet.server';
import { WalletBalanceSummary } from '@/features/wallet/ui/WalletBalanceSummary';
import { WalletHistory } from '@/features/wallet/ui/WalletHistory';
import type {
  PaginatedWalletTransactions,
  WalletBalance,
  WalletCurrency,
} from '@/features/wallet/server/wallet.types';
import { PendingGemPurchases } from '@/features/gems/ui/PendingGemPurchases';
import { GemStore } from '@/features/gems/ui/GemStore';
import { ConvertGemsForm } from '@/features/gems/ui/ConvertGemsForm';
import { getConversionRate } from '@/features/gems/server/gems.server';
import { WithdrawToWallet } from '@/features/withdraw/ui/WithdrawToWallet';
import { DailyRewardCard } from '@/features/daily-rewards/ui/DailyRewardCard';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { PageBreadcrumb } from '@/shared/seo/PageBreadcrumb';
import { isLocale, type Locale } from '@/shared/i18n';
import { getTranslations } from '@/shared/i18n/server';
import type { WalletReason } from '@/features/wallet/server/wallet.types';

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
  return input === 'coins' || input === 'gems' || input === 'arcadeum'
    ? input
    : undefined;
}

const EMPTY_BALANCE: WalletBalance = { coins: 0, gems: 0, arcadeum: 0 };
const EMPTY_PAGE: PaginatedWalletTransactions = { items: [], nextCursor: null };

const GEM_SECTIONS_STYLE: React.CSSProperties = {
  maxWidth: '900px',
  margin: '0 auto',
  padding: '0 16px 32px',
};

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
  const typedLocale: Locale | undefined = isLocale(locale) ? locale : undefined;

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
        <WalletBalanceSummary balance={EMPTY_BALANCE} locale={typedLocale} />
        <div style={GEM_SECTIONS_STYLE} data-testid="gem-sections">
          <div id="gem-store" style={{ marginTop: '32px' }}>
            <GemStore />
          </div>
        </div>
        <WalletHistory
          page={EMPTY_PAGE}
          currency={currency}
          locale={typedLocale}
        />
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

  let reasonLabels: Partial<Record<WalletReason, string>> = {};
  try {
    const messages = await getTranslations(typedLocale);
    reasonLabels = messages.wallet?.reasons ?? {};
  } catch {
    // Fallback to default English labels
  }

  return (
    <div>
      <PageBreadcrumb locale={locale} page="wallet" />
      {/* Daily reward CTA. Rendered above the wallet view so the claim flow is
          the first thing a returning player sees. The card self-suppresses
          (returns null) when the BE call fails — same defensive pattern as
          BalanceChip — so it never blocks the page from rendering. */}
      <DailyRewardCard />

      <WalletBalanceSummary balance={balance} locale={typedLocale} />

      {/* Gem sections: pending purchases banner, gem store, and conversion form */}
      <div style={GEM_SECTIONS_STYLE} data-testid="gem-sections">
        <PendingGemPurchases />

        <div id="gem-store" style={{ marginTop: '32px', marginBottom: '32px' }}>
          <GemStore />
        </div>

        <ConvertGemsForm rate={conversionRate} currentGems={currentGems} />
      </div>

      <div style={GEM_SECTIONS_STYLE} data-testid="withdraw-section">
        <WithdrawToWallet
          arcadeumBalance={balance.arcadeum ?? 0}
          locale={typedLocale}
        />
      </div>

      <WalletHistory
        page={page}
        currency={currency}
        locale={typedLocale}
        reasonLabels={reasonLabels}
      />
    </div>
  );
}
