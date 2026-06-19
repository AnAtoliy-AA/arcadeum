import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletBalanceSummary } from './WalletBalanceSummary';
import type { WalletBalance } from '../server/wallet.types';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: {
      wallet: {
        balance: {
          title: 'Your Wallet',
          subtitle: 'Coins are earned through play. Gems are purchased.',
          coins: 'Coins',
          gems: 'Gems',
          arcadeum: 'ARCADEUM',
        },
      },
    },
  }),
}));

describe('WalletBalanceSummary', () => {
  it('renders coin and gem balances', () => {
    const balance: WalletBalance = { coins: 1_250, gems: 30 };
    render(<WalletBalanceSummary balance={balance} />);
    expect(screen.getByTestId('balance-coins-value').textContent).toContain(
      '1,250',
    );
    expect(screen.getByTestId('balance-gems-value').textContent).toContain(
      '30',
    );
  });

  it('renders zero balances for an empty wallet', () => {
    render(<WalletBalanceSummary balance={{ coins: 0, gems: 0 }} />);
    expect(screen.getByTestId('balance-coins-value').textContent).toContain(
      '0',
    );
    expect(screen.getByTestId('balance-gems-value').textContent).toContain('0');
  });
});
