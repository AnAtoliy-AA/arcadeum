import type { Metadata } from 'next';
import { getTranslations } from '@/shared/i18n/server';
import {
  getWalletBalance,
  getWalletTransactions,
} from '@/features/wallet/server/wallet.server';
import { WalletPageView } from '@/features/wallet/ui/WalletPageView';
import type { WalletCurrency } from '@/features/wallet/server/wallet.types';

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

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const currency = parseCurrency(sp.currency);
  const cursor = sp.cursor;

  const [balance, page] = await Promise.all([
    getWalletBalance(),
    getWalletTransactions({ currency, cursor, limit: 20 }),
  ]);

  return <WalletPageView balance={balance} page={page} currency={currency} />;
}
