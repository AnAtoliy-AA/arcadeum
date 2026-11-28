import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BalanceChip } from './BalanceChip';

const handlers = new Map<string, (payload: unknown) => void>();
const get = vi.fn();

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: { get: (...args: unknown[]) => get(...args) },
}));
vi.mock('@/shared/lib/socket', () => ({
  walletSocket: {
    on: (event: string, fn: (payload: unknown) => void) =>
      handlers.set(event, fn),
    off: (event: string) => handlers.delete(event),
  },
}));
vi.mock('@/shared/config/useRoutes', () => ({
  useRoutes: () => ({ wallet: '/wallet' }),
}));

describe('BalanceChip', () => {
  beforeEach(() => {
    handlers.clear();
    get.mockReset();
  });

  it('renders nothing when the balance fetch fails', async () => {
    get.mockRejectedValue(new Error('401'));
    const { container } = render(<BalanceChip />);
    await act(async () => {});
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the fetched balance and updates live on wallet:updated', async () => {
    get.mockResolvedValue({ coins: 10, gems: 2 });
    render(<BalanceChip />);
    await waitFor(() =>
      expect(screen.getByTestId('header-wallet-balance')).toHaveTextContent(
        '10',
      ),
    );

    act(() => handlers.get('wallet:updated')?.({ coins: 20, gems: 2 }));

    expect(screen.getByTestId('header-wallet-balance')).toHaveTextContent('20');
  });

  it('ignores malformed socket payloads', async () => {
    get.mockResolvedValue({ coins: 10, gems: 2 });
    render(<BalanceChip />);
    await screen.findByTestId('header-wallet-balance');

    act(() => handlers.get('wallet:updated')?.({ coins: 'x' }));

    expect(screen.getByTestId('header-wallet-balance')).toHaveTextContent('10');
  });
});
