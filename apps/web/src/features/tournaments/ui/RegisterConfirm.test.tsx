import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';
import { RegisterConfirm, type RegisterConfirmLabels } from './RegisterConfirm';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const labels: RegisterConfirmLabels = {
  title: 'Confirm entry',
  body: 'This tournament costs {fee} coins. Your balance: {balance} coins.',
  confirm: 'Pay & Register',
  cancel: 'Cancel',
  errors: { insufficientFunds: 'Not enough coins to enter.' },
};

const renderConfirm = (
  props: Partial<Parameters<typeof RegisterConfirm>[0]> = {},
) =>
  render(
    <Wrapper>
      <RegisterConfirm
        tournamentId="tour-1"
        entryFeeCoins={50}
        currentBalanceCoins={200}
        open={true}
        onClose={() => undefined}
        onSuccess={() => undefined}
        onRegister={vi.fn().mockResolvedValue(undefined)}
        labels={labels}
        {...props}
      />
    </Wrapper>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RegisterConfirm', () => {
  it('does not render when open is false', () => {
    renderConfirm({ open: false });
    expect(
      screen.queryByTestId('register-confirm-dialog'),
    ).not.toBeInTheDocument();
  });

  it('renders dialog with fee and balance interpolated', () => {
    renderConfirm({ entryFeeCoins: 50, currentBalanceCoins: 200 });
    expect(screen.getByTestId('register-confirm-dialog')).toBeInTheDocument();
    expect(
      screen.getByText(/This tournament costs 50 coins/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Your balance: 200 coins/)).toBeInTheDocument();
  });

  it('calls onRegister and closes on confirm', async () => {
    const onRegister = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    renderConfirm({ onRegister, onClose, currentBalanceCoins: 200 });

    fireEvent.click(screen.getByTestId('register-confirm-submit'));

    await waitFor(() => {
      expect(onRegister).toHaveBeenCalledWith('tour-1');
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('closes on cancel without calling onRegister', () => {
    const onRegister = vi.fn();
    const onClose = vi.fn();
    renderConfirm({ onRegister, onClose });
    fireEvent.click(screen.getByTestId('register-confirm-cancel'));
    expect(onRegister).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('shows insufficient-funds error when balance is too low', async () => {
    renderConfirm({ entryFeeCoins: 100, currentBalanceCoins: 20 });
    fireEvent.click(screen.getByTestId('register-confirm-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('register-confirm-error')).toHaveTextContent(
        'Not enough coins to enter.',
      );
    });
  });

  it('shows wallet link when balance is insufficient', async () => {
    renderConfirm({ entryFeeCoins: 100, currentBalanceCoins: 20 });
    fireEvent.click(screen.getByTestId('register-confirm-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('wallet-link')).toBeInTheDocument();
    });
  });

  it('handles 422 insufficient funds error from onRegister', async () => {
    const error = Object.assign(new Error('wallet.insufficientFunds'), {
      body: { message: 'wallet.insufficientFunds' },
    });
    const onRegister = vi.fn().mockRejectedValue(error);
    renderConfirm({ onRegister, currentBalanceCoins: 1000 });

    fireEvent.click(screen.getByTestId('register-confirm-submit'));

    await waitFor(() => {
      expect(screen.getByTestId('register-confirm-error')).toBeInTheDocument();
    });
  });
});
