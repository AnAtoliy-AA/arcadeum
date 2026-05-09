import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';

// ─── Mock server actions ───────────────────────────────────────────────────────
vi.mock('../server/wallet.actions', () => ({
  loadAdminWalletAction: vi.fn(),
  grantWalletAction: vi.fn(),
  deductWalletAction: vi.fn(),
}));

import {
  loadAdminWalletAction,
  grantWalletAction,
  deductWalletAction,
} from '../server/wallet.actions';
import {
  AdminWalletDrawer,
  type AdminWalletDrawerLabels,
} from './AdminWalletDrawer';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const renderWithProvider = (ui: React.ReactElement) =>
  render(<Wrapper>{ui}</Wrapper>);

const labels: AdminWalletDrawerLabels = {
  title: 'Wallet',
  sections: {
    balance: 'Balance',
    grantDeduct: 'Grant or deduct',
    recent: 'Recent transactions',
  },
  form: {
    currencyLabel: 'Currency',
    amountLabel: 'Amount',
    noteLabel: 'Note',
    grant: 'Grant',
    deduct: 'Deduct',
    submitting: 'Working…',
    success: 'Done.',
    errors: {
      insufficient: 'Not enough balance.',
      generic: 'Something went wrong.',
    },
  },
};

const mockBalance = { coins: 500, gems: 10 };
const mockRecent = {
  items: [
    {
      id: 'tx1',
      currency: 'coins',
      delta: 100,
      balanceAfter: 500,
      reason: 'admin_grant',
      createdAt: '2026-01-01T00:00:00Z',
    },
  ],
  nextCursor: null,
};

const successLoadResult = {
  ok: true as const,
  data: { balance: mockBalance, recent: mockRecent },
};

beforeEach(() => {
  vi.mocked(loadAdminWalletAction).mockReset();
  vi.mocked(grantWalletAction).mockReset();
  vi.mocked(deductWalletAction).mockReset();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AdminWalletDrawer', () => {
  it('renders balance and form when data loads successfully', async () => {
    vi.mocked(loadAdminWalletAction).mockResolvedValue(successLoadResult);

    renderWithProvider(
      <AdminWalletDrawer
        userId="u1"
        open={true}
        onClose={() => {}}
        labels={labels}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('wallet-balance-section')).toBeInTheDocument();
    });

    expect(screen.getByTestId('wallet-balance-coins')).toHaveTextContent('500');
    expect(screen.getByTestId('wallet-balance-gems')).toHaveTextContent('10');
    expect(screen.getByTestId('admin-wallet-form')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-recent-section')).toBeInTheDocument();
  });

  it('shows loading skeletons while data is being fetched', () => {
    // Never resolves synchronously — stays in loading state
    vi.mocked(loadAdminWalletAction).mockImplementation(
      () => new Promise(() => {}),
    );

    renderWithProvider(
      <AdminWalletDrawer
        userId="u1"
        open={true}
        onClose={() => {}}
        labels={labels}
      />,
    );

    expect(screen.getByTestId('wallet-drawer-loading')).toBeInTheDocument();
  });

  it('shows generic error when load fails', async () => {
    vi.mocked(loadAdminWalletAction).mockResolvedValue({
      ok: false,
      error: 'generic',
    });

    renderWithProvider(
      <AdminWalletDrawer
        userId="u1"
        open={true}
        onClose={() => {}}
        labels={labels}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('wallet-drawer-error')).toBeInTheDocument();
    });
  });

  it('does not render body when closed', () => {
    renderWithProvider(
      <AdminWalletDrawer
        userId="u1"
        open={false}
        onClose={() => {}}
        labels={labels}
      />,
    );

    expect(screen.queryByTestId('admin-wallet-drawer')).not.toBeInTheDocument();
    expect(loadAdminWalletAction).not.toHaveBeenCalled();
  });

  it('submitting grant calls grantWalletAction with correct params and reloads', async () => {
    vi.mocked(loadAdminWalletAction).mockResolvedValue(successLoadResult);
    vi.mocked(grantWalletAction).mockResolvedValue({
      ok: true,
      data: {
        id: 'tx2',
        currency: 'coins',
        delta: 50,
        balanceAfter: 550,
        reason: 'admin_grant',
        createdAt: '2026-01-02T00:00:00Z',
      },
    });

    renderWithProvider(
      <AdminWalletDrawer
        userId="u1"
        open={true}
        onClose={() => {}}
        labels={labels}
      />,
    );

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByTestId('wallet-form-amount')).toBeInTheDocument();
    });

    // Fill amount and click Grant
    fireEvent.change(screen.getByTestId('wallet-form-amount'), {
      target: { value: '50' },
    });
    fireEvent.click(screen.getByTestId('wallet-form-grant'));

    await waitFor(() => {
      expect(grantWalletAction).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u1',
          currency: 'coins',
          amount: 50,
        }),
      );
    });

    // Reload should have been called a second time after success
    await waitFor(() => {
      expect(loadAdminWalletAction).toHaveBeenCalledTimes(2);
    });
  });

  it('shows insufficient error inline when grant returns 422', async () => {
    vi.mocked(loadAdminWalletAction).mockResolvedValue(successLoadResult);
    vi.mocked(grantWalletAction).mockResolvedValue({
      ok: false,
      error: 'insufficient',
    });

    renderWithProvider(
      <AdminWalletDrawer
        userId="u1"
        open={true}
        onClose={() => {}}
        labels={labels}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('wallet-form-amount')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('wallet-form-amount'), {
      target: { value: '999999' },
    });
    fireEvent.click(screen.getByTestId('wallet-form-grant'));

    await waitFor(() => {
      expect(
        screen.getByTestId('wallet-form-error-insufficient'),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId('wallet-form-error-insufficient'),
    ).toHaveTextContent('Not enough balance.');
  });

  it('calls onClose when close button is clicked', async () => {
    vi.mocked(loadAdminWalletAction).mockResolvedValue(successLoadResult);
    const onClose = vi.fn();

    renderWithProvider(
      <AdminWalletDrawer
        userId="u1"
        open={true}
        onClose={onClose}
        labels={labels}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('modal-close-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('modal-close-button'));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
