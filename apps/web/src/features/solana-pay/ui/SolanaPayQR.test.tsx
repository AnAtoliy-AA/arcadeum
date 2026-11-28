import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { en } from '@/shared/i18n/messages/arcCheckout';

const create = vi.fn();
const status = vi.fn();

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
vi.mock('@/shared/api/solana-pay', () => ({
  createSolanaPayRequest: (...a: unknown[]) => create(...a),
  getSolanaPayStatus: (...a: unknown[]) => status(...a),
}));
vi.mock('next/image', () => ({
  default: (p: { alt: string }) => <span role="img" aria-label={p.alt} />,
}));

import { SolanaPayQR } from './SolanaPayQR';

const REQ = {
  sessionId: 's1',
  solanaPayUrl: 'solana:T?amount=25',
  amount: 25,
  tokenAddress: 'M',
  recipient: 'Treasury',
  reference: 'R',
};

beforeEach(() => {
  create.mockReset();
  status.mockReset();
  create.mockResolvedValue(REQ);
});

describe('SolanaPayQR states', () => {
  it('pending: shows the QR, amount and the waiting message', async () => {
    status.mockResolvedValue({ status: 'pending' });
    render(<SolanaPayQR amount={25} tokenAddress="M" onConfirmed={vi.fn()} />);
    expect(await screen.findByTestId('solana-pay-pending')).toBeTruthy();
    expect(screen.getByText('25 ARC')).toBeTruthy();
    expect(screen.getByText(en.statusPending)).toBeTruthy();
  });

  it('confirmed: reports the signature', async () => {
    status.mockResolvedValue({ status: 'confirmed', signature: 'SIG' });
    const onConfirmed = vi.fn();
    render(
      <SolanaPayQR amount={25} tokenAddress="M" onConfirmed={onConfirmed} />,
    );
    await waitFor(() => expect(onConfirmed).toHaveBeenCalledWith('SIG'));
  });

  it('failed: shows the failure copy and a retry that creates a new request', async () => {
    status.mockResolvedValue({ status: 'failed', reason: 'amount_too_low' });
    const onError = vi.fn();
    render(
      <SolanaPayQR
        amount={25}
        tokenAddress="M"
        onConfirmed={vi.fn()}
        onError={onError}
      />,
    );
    const box = await screen.findByTestId('solana-pay-failed');
    expect(box.textContent).toContain(en.statusFailed);
    expect(onError).toHaveBeenCalledWith('amount_too_low');

    status.mockResolvedValue({ status: 'pending' });
    await act(async () => fireEvent.click(screen.getByText(en.retry)));
    await waitFor(() => expect(create).toHaveBeenCalledTimes(2));
    expect(await screen.findByTestId('solana-pay-pending')).toBeTruthy();
  });

  it('expired: shows the expiry copy', async () => {
    status.mockResolvedValue({ status: 'expired' });
    render(<SolanaPayQR amount={25} tokenAddress="M" onConfirmed={vi.fn()} />);
    const box = await screen.findByTestId('solana-pay-expired');
    expect(box.textContent).toContain(en.statusExpired);
  });

  it('request creation error shows a translated message with retry', async () => {
    create.mockRejectedValueOnce(new Error('x'));
    render(<SolanaPayQR amount={25} tokenAddress="M" onConfirmed={vi.fn()} />);
    expect(await screen.findByText(en.errorCreate)).toBeTruthy();
    status.mockResolvedValue({ status: 'pending' });
    await act(async () => fireEvent.click(screen.getByText(en.retry)));
    expect(await screen.findByTestId('solana-pay-pending')).toBeTruthy();
  });
});
