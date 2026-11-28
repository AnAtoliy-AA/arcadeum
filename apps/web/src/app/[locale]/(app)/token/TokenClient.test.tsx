import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { en } from '@/shared/i18n/messages/wallet';

const fetchTokenMetadata = vi.fn();
const getArcConfig = vi.fn();

vi.mock('@/shared/api/tokenMetadata', () => ({
  fetchTokenMetadata: () => fetchTokenMetadata(),
}));
vi.mock('@/shared/api/arc-config', () => ({
  getArcConfig: () => getArcConfig(),
}));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      let v: unknown = en;
      for (const p of key.replace('wallet.', '').split('.')) {
        v = (v as Record<string, unknown>)?.[p];
      }
      return typeof v === 'string' ? v : key;
    },
  }),
}));
vi.mock('next/dynamic', () => ({
  default: () => (p: { poolAddress?: string }) => (
    <div data-testid="sparkline" data-pool={p.poolAddress ?? ''} />
  ),
}));
vi.mock('next/image', () => ({
  default: (p: { alt: string }) => <span role="img" aria-label={p.alt} />,
}));
vi.mock('next/link', () => ({
  default: (p: { href: string; children: React.ReactNode }) => (
    <a href={p.href}>{p.children}</a>
  ),
}));

import TokenClient from './TokenClient';

const GOOD = {
  name: 'Arcadeum Games',
  symbol: 'ARC',
  description: '',
  image: null,
  pumpfunUrl: null,
  marketCapUsd: 4500,
  totalSupply: '1000000000',
  createdAt: null,
  twitter: null,
  website: null,
  treasuryBalance: null,
};

beforeEach(() => {
  fetchTokenMetadata.mockReset();
  getArcConfig.mockReset();
  getArcConfig.mockResolvedValue({ mintAddress: 'MINT', poolAddress: 'POOL' });
});

describe('TokenClient resilience', () => {
  it('server had no metadata: fetches on the client and fills the page', async () => {
    fetchTokenMetadata.mockResolvedValue(GOOD);
    render(<TokenClient mintAddress="M" initialMetadata={null} />);
    await waitFor(() => expect(fetchTokenMetadata).toHaveBeenCalledTimes(1));
    expect(screen.queryByTestId('token-load-error')).toBeNull();
  });

  it('shows a friendly error state with retry when the API stays down', async () => {
    fetchTokenMetadata.mockResolvedValue(null);
    render(<TokenClient mintAddress="M" initialMetadata={null} />);
    const box = await screen.findByTestId('token-load-error');
    expect(box.textContent).toContain(en.tokenPage.loadError);

    fetchTokenMetadata.mockResolvedValue(GOOD);
    fireEvent.click(screen.getByText(en.tokenPage.retry));
    await waitFor(() =>
      expect(screen.queryByTestId('token-load-error')).toBeNull(),
    );
  });

  it('does not refetch when the server already rendered metadata', () => {
    render(<TokenClient mintAddress="M" initialMetadata={GOOD} />);
    expect(fetchTokenMetadata).not.toHaveBeenCalled();
  });

  it('gets the mint from the backend config when the page had none', async () => {
    render(<TokenClient initialMetadata={GOOD} />);
    expect(await screen.findByText('MINT')).toBeTruthy();
  });

  it('passes the backend pool address to the chart', () => {
    render(
      <TokenClient mintAddress="M" poolAddress="POOL" initialMetadata={GOOD} />,
    );
    expect(screen.getByTestId('sparkline').getAttribute('data-pool')).toBe(
      'POOL',
    );
  });
});
