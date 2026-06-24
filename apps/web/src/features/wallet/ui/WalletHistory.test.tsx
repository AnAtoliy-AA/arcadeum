import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletHistory } from './WalletHistory';
import type { PaginatedWalletTransactions } from '../server/wallet.types';

vi.mock('@/shared/i18n/server', () => ({
  getTranslations: vi.fn().mockResolvedValue({
    wallet: {
      history: {
        filterAll: 'All',
        filterCoins: 'Coins',
        filterGems: 'Gems',
        emptyTitle: 'No transactions yet',
        emptyDescription: 'Your wallet activity will appear here.',
        colReason: 'Reason',
        colChange: 'Change',
        colBalanceAfter: 'Balance after',
        colWhen: 'When',
        nextPage: 'Next',
      },
    },
  }),
}));

const singlePage: PaginatedWalletTransactions = {
  items: [
    {
      id: 'tx-1',
      currency: 'coins',
      delta: 100,
      balanceAfter: 1_250,
      reason: 'admin_grant',
      createdAt: new Date('2026-05-09T10:00:00Z').toISOString(),
    },
    {
      id: 'tx-2',
      currency: 'gems',
      delta: -5,
      balanceAfter: 30,
      reason: 'admin_deduct',
      createdAt: new Date('2026-05-08T10:00:00Z').toISOString(),
    },
  ],
  nextCursor: null,
};

const emptyPage: PaginatedWalletTransactions = { items: [], nextCursor: null };

const pagedResult: PaginatedWalletTransactions = {
  items: singlePage.items,
  nextCursor: 'cursor-abc123',
};

describe('WalletHistory', () => {
  it('renders a row for each transaction', async () => {
    render(await WalletHistory({ page: singlePage }));
    const rows = screen.getAllByTestId('transaction-row');
    expect(rows).toHaveLength(2);
  });

  it('shows empty state when there are no transactions', async () => {
    render(await WalletHistory({ page: emptyPage }));
    expect(screen.getByTestId('wallet-empty')).toBeTruthy();
    expect(screen.queryByTestId('transactions-table')).toBeNull();
  });

  it('shows Next link when nextCursor is present', async () => {
    render(await WalletHistory({ page: pagedResult }));
    const nextLink = screen.getByTestId('next-page');
    expect(nextLink).toBeTruthy();
    expect((nextLink as HTMLAnchorElement).href).toContain(
      'cursor=cursor-abc123',
    );
  });

  it('anchors Next link to the history section so the browser does not scroll to the top of the page', async () => {
    render(await WalletHistory({ page: pagedResult }));
    const nextLink = screen.getByTestId('next-page') as HTMLAnchorElement;
    expect(nextLink.href).toContain('#wallet-history');
  });

  it('does not show Next link when nextCursor is null', async () => {
    render(await WalletHistory({ page: singlePage }));
    expect(screen.queryByTestId('next-page')).toBeNull();
  });

  it('preserves currency filter in Next link', async () => {
    render(await WalletHistory({ page: pagedResult, currency: 'coins' }));
    const nextLink = screen.getByTestId('next-page') as HTMLAnchorElement;
    expect(nextLink.href).toContain('currency=coins');
    expect(nextLink.href).toContain('cursor=cursor-abc123');
  });

  it('marks the "All" filter active when no currency is set', async () => {
    render(await WalletHistory({ page: singlePage }));
    const allLink = screen.getByTestId('filter-all') as HTMLAnchorElement;
    expect(allLink.href).toContain('/wallet');
    expect(allLink.href).not.toContain('currency=');
  });

  it('marks the coins filter active when currency=coins', async () => {
    render(await WalletHistory({ page: singlePage, currency: 'coins' }));
    const coinsLink = screen.getByTestId('filter-coins') as HTMLAnchorElement;
    expect(coinsLink.href).toContain('currency=coins');
  });
});
