import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletHistory } from './WalletHistory';
import type { PaginatedWalletTransactions } from '../server/wallet.types';

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
  it('renders a row for each transaction', () => {
    render(<WalletHistory page={singlePage} />);
    const rows = screen.getAllByTestId('transaction-row');
    expect(rows).toHaveLength(2);
  });

  it('shows empty state when there are no transactions', () => {
    render(<WalletHistory page={emptyPage} />);
    expect(screen.getByTestId('wallet-empty')).toBeTruthy();
    expect(screen.queryByTestId('transactions-table')).toBeNull();
  });

  it('shows Next link when nextCursor is present', () => {
    render(<WalletHistory page={pagedResult} />);
    const nextLink = screen.getByTestId('next-page');
    expect(nextLink).toBeTruthy();
    expect((nextLink as HTMLAnchorElement).href).toContain(
      'cursor=cursor-abc123',
    );
  });

  it('anchors Next link to the history section so the browser does not scroll to the top of the page', () => {
    render(<WalletHistory page={pagedResult} />);
    const nextLink = screen.getByTestId('next-page') as HTMLAnchorElement;
    expect(nextLink.href).toContain('#wallet-history');
  });

  it('does not show Next link when nextCursor is null', () => {
    render(<WalletHistory page={singlePage} />);
    expect(screen.queryByTestId('next-page')).toBeNull();
  });

  it('preserves currency filter in Next link', () => {
    render(<WalletHistory page={pagedResult} currency="coins" />);
    const nextLink = screen.getByTestId('next-page') as HTMLAnchorElement;
    expect(nextLink.href).toContain('currency=coins');
    expect(nextLink.href).toContain('cursor=cursor-abc123');
  });

  it('marks the "All" filter active when no currency is set', () => {
    render(<WalletHistory page={singlePage} />);
    const allLink = screen.getByTestId('filter-all') as HTMLAnchorElement;
    expect(allLink.href).toContain('/wallet');
    expect(allLink.href).not.toContain('currency=');
  });

  it('marks the coins filter active when currency=coins', () => {
    render(<WalletHistory page={singlePage} currency="coins" />);
    const coinsLink = screen.getByTestId('filter-coins') as HTMLAnchorElement;
    expect(coinsLink.href).toContain('currency=coins');
  });
});
