import type { Metadata } from 'next';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { getTranslations } from '@/shared/i18n/server';
import {
  getWalletBalance,
  getWalletTransactions,
} from '@/features/wallet/server/wallet.server';
import { WalletPageView } from '@/features/wallet/ui/WalletPageView';
import type {
  PaginatedWalletTransactions,
  WalletBalance,
  WalletCurrency,
} from '@/features/wallet/server/wallet.types';

// <WalletLiveBridge /> is mounted once in apps/web/src/app/layout.tsx — no
// need to render it here.

export async function generateMetadata(): Promise<Metadata> {
  const messages = await getTranslations();
  const t = messages.pages?.wallet;
  return {
    title: t?.meta?.title ?? 'Wallet · Arcadeum',
    description:
      t?.meta?.description ?? 'View your coins, gems, and transaction history.',
    alternates: { canonical: '/wallet' },
  };
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
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const currency = parseCurrency(sp.currency);
  const cursor = sp.cursor;

  // Render an empty state for unauthenticated visitors so the route stays
  // crawlable and never 5xxs. The header chip is also gated on auth, so an
  // unauthenticated session shouldn't normally land here, but bots / direct
  // links can.
  const accessToken = await getServerAccessToken();
  if (!accessToken) {
    return (
      <WalletPageView
        balance={EMPTY_BALANCE}
        page={EMPTY_PAGE}
        currency={currency}
      />
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
    // If the BE call fails (auth expired, transient network, etc.), keep the
    // page renderable in a safe empty state rather than throwing a 500.
    console.error('Failed to load wallet during SSR:', err);
  }

  return <WalletPageView balance={balance} page={page} currency={currency} />;
}
