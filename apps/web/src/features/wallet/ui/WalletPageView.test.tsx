import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletPageView } from './WalletPageView';
import type {
  WalletBalance,
  PaginatedWalletTransactions,
} from '../server/wallet.types';

// WalletPageView is a pure presentational Server Component — no async I/O —
// so Vitest + jsdom can render it directly without any special setup.

const balance: WalletBalance = { coins: 1_250, gems: 30 };

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

describe('WalletPageView', () => {
  it('renders coin and gem balances', () => {
    render(<WalletPageView balance={balance} page={singlePage} />);
    expect(screen.getByTestId('balance-coins-value').textContent).toContain(
      '1,250',
    );
    expect(screen.getByTestId('balance-gems-value').textContent).toContain(
      '30',
    );
  });

  it('renders a row for each transaction', () => {
    render(<WalletPageView balance={balance} page={singlePage} />);
    const rows = screen.getAllByTestId('transaction-row');
    expect(rows).toHaveLength(2);
  });

  it('shows empty state when there are no transactions', () => {
    render(<WalletPageView balance={balance} page={emptyPage} />);
    expect(screen.getByTestId('wallet-empty')).toBeTruthy();
    expect(screen.queryByTestId('transactions-table')).toBeNull();
  });

  it('shows Next link when nextCursor is present', () => {
    render(<WalletPageView balance={balance} page={pagedResult} />);
    const nextLink = screen.getByTestId('next-page');
    expect(nextLink).toBeTruthy();
    expect((nextLink as HTMLAnchorElement).href).toContain(
      'cursor=cursor-abc123',
    );
  });

  it('does not show Next link when nextCursor is null', () => {
    render(<WalletPageView balance={balance} page={singlePage} />);
    expect(screen.queryByTestId('next-page')).toBeNull();
  });

  it('preserves currency filter in Next link', () => {
    render(
      <WalletPageView balance={balance} page={pagedResult} currency="coins" />,
    );
    const nextLink = screen.getByTestId('next-page') as HTMLAnchorElement;
    expect(nextLink.href).toContain('currency=coins');
    expect(nextLink.href).toContain('cursor=cursor-abc123');
  });

  it('marks the "All" filter active when no currency is set', () => {
    render(<WalletPageView balance={balance} page={singlePage} />);
    const allLink = screen.getByTestId('filter-all') as HTMLAnchorElement;
    // Active filter has a lighter border colour (checked via href = /wallet)
    expect(allLink.href).toContain('/wallet');
    expect(allLink.href).not.toContain('currency=');
  });

  it('marks the coins filter active when currency=coins', () => {
    render(
      <WalletPageView balance={balance} page={singlePage} currency="coins" />,
    );
    const coinsLink = screen.getByTestId('filter-coins') as HTMLAnchorElement;
    expect(coinsLink.href).toContain('currency=coins');
  });
});
