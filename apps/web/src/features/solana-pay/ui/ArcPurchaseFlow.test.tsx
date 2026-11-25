import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { en } from '@/shared/i18n/messages/arcCheckout';

let confirm: ((sig: string) => void) | null = null;
const config = vi.fn();

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const path = key.replace('wallet.arcCheckout.', '').split('.');
      let v: unknown = en;
      for (const p of path) v = (v as Record<string, unknown>)[p];
      return String(v);
    },
  }),
}));
vi.mock('../hooks/useArcConfig', () => ({ useArcConfig: () => config() }));
vi.mock('./SolanaPayQR', () => ({
  SolanaPayQR: (p: {
    tokenAddress: string;
    onConfirmed: (s: string) => void;
  }) => {
    confirm = p.onConfirmed;
    return <div data-testid="qr">{p.tokenAddress}</div>;
  },
}));

import { ArcPurchaseFlow } from './ArcPurchaseFlow';

const MINT = '7aRVHPcJnsGWBZMNe2igQsLQmQb4LCCtpuiJgxHjpump';

beforeEach(() => {
  confirm = null;
  config.mockReturnValue({
    config: {
      configured: true,
      mintAddress: MINT,
      poolAddress: 'p',
      decimals: 6,
    },
    loading: false,
    error: false,
  });
});

const setup = (deliver: (s: string) => Promise<void>) => {
  const onPurchased = vi.fn();
  render(
    <ArcPurchaseFlow
      amount={25}
      deliver={deliver}
      successKey="successGems"
      onPurchased={onPurchased}
    />,
  );
  return { onPurchased };
};

describe('ArcPurchaseFlow', () => {
  it('pays with the mint served by the backend (not a bundled copy)', () => {
    setup(vi.fn());
    expect(screen.getByTestId('qr').textContent).toBe(MINT);
  });

  it('shows an explicit unavailable state when ARC is not configured', () => {
    config.mockReturnValue({
      config: { configured: false, mintAddress: null },
      loading: false,
      error: false,
    });
    setup(vi.fn());
    expect(
      screen.getByTestId('arc-purchase-unavailable').textContent,
    ).toContain(en.errors.notConfigured);
  });

  it('shows unavailable when the config request failed', () => {
    config.mockReturnValue({ config: null, loading: false, error: true });
    setup(vi.fn());
    expect(screen.getByTestId('arc-purchase-unavailable')).toBeTruthy();
  });

  it('delivers once per confirmation and shows success', async () => {
    const deliver = vi.fn().mockResolvedValue(undefined);
    const { onPurchased } = setup(deliver);
    await act(async () => confirm?.('SIG'));
    await waitFor(() =>
      expect(screen.getByTestId('arc-purchase-done')).toBeTruthy(),
    );
    expect(deliver).toHaveBeenCalledWith('SIG');
    expect(onPurchased).toHaveBeenCalledTimes(1);
    expect(screen.getByText(en.successGems)).toBeTruthy();
  });

  it('double confirmation (poll race) does not double submit', async () => {
    let resolve!: () => void;
    const deliver = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    setup(deliver);
    await act(async () => {
      confirm?.('SIG');
      confirm?.('SIG');
    });
    expect(deliver).toHaveBeenCalledTimes(1);
    await act(async () => resolve());
  });

  it('a temporary RPC failure retries the SAME signature (no second payment)', async () => {
    const deliver = vi
      .fn()
      .mockRejectedValueOnce(new Error('gems.rpcUnavailable'))
      .mockResolvedValue(undefined);
    setup(deliver);
    await act(async () => confirm?.('SIG'));

    const err = await screen.findByTestId('arc-purchase-error');
    expect(err.textContent).toContain(en.errors.rpcUnavailable);

    fireEvent.click(screen.getByText(en.retry));
    await waitFor(() =>
      expect(screen.getByTestId('arc-purchase-done')).toBeTruthy(),
    );
    expect(deliver).toHaveBeenNthCalledWith(2, 'SIG');
  });

  it('a final failure (payment too low) offers no retry', async () => {
    const deliver = vi.fn().mockRejectedValue(new Error('gems.paymentTooLow'));
    setup(deliver);
    await act(async () => confirm?.('SIG'));
    const err = await screen.findByTestId('arc-purchase-error');
    expect(err.textContent).toContain(en.errors.paymentTooLow);
    expect(screen.queryByText(en.retry)).toBeNull();
  });

  it('an unknown error shows the generic message', async () => {
    setup(vi.fn().mockRejectedValue(new Error('weird')));
    await act(async () => confirm?.('SIG'));
    expect(
      (await screen.findByTestId('arc-purchase-error')).textContent,
    ).toContain(en.errorGeneric);
  });
});
