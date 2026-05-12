import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';
import {
  UnregisterConfirm,
  type UnregisterConfirmLabels,
} from './UnregisterConfirm';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const labels: UnregisterConfirmLabels = {
  refund: "You'll be refunded {amount} coins.",
  title: 'Cancel registration',
  body: 'Are you sure?',
  confirm: 'Yes, cancel',
  cancelButton: 'No, keep me in',
};

const renderConfirm = (
  props: Partial<Parameters<typeof UnregisterConfirm>[0]> = {},
) =>
  render(
    <Wrapper>
      <UnregisterConfirm
        tournamentId="tour-1"
        entryFeeCoins={50}
        status="registration_open"
        open={true}
        onClose={() => undefined}
        onSuccess={() => undefined}
        onUnregister={vi.fn().mockResolvedValue(undefined)}
        labels={labels}
        {...props}
      />
    </Wrapper>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe('UnregisterConfirm', () => {
  it('does not render when open is false', () => {
    renderConfirm({ open: false });
    expect(
      screen.queryByTestId('unregister-confirm-dialog'),
    ).not.toBeInTheDocument();
  });

  it('shows refund notice when status is registration_open and entryFeeCoins > 0', () => {
    renderConfirm({ status: 'registration_open', entryFeeCoins: 50 });
    expect(screen.getByTestId('refund-notice')).toHaveTextContent(
      "You'll be refunded 50 coins.",
    );
  });

  it('shows refund notice when status is scheduled and entryFeeCoins > 0', () => {
    renderConfirm({ status: 'scheduled', entryFeeCoins: 75 });
    expect(screen.getByTestId('refund-notice')).toHaveTextContent(
      "You'll be refunded 75 coins.",
    );
  });

  it('does not show refund when entryFeeCoins is 0', () => {
    renderConfirm({ status: 'registration_open', entryFeeCoins: 0 });
    expect(screen.queryByTestId('refund-notice')).not.toBeInTheDocument();
  });

  it('does not show refund when status is live', () => {
    renderConfirm({ status: 'live', entryFeeCoins: 50 });
    expect(screen.queryByTestId('refund-notice')).not.toBeInTheDocument();
  });

  it('calls onUnregister and closes on confirm', async () => {
    const onUnregister = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();
    renderConfirm({ onUnregister, onClose });

    fireEvent.click(screen.getByTestId('unregister-confirm-submit'));

    await waitFor(() => {
      expect(onUnregister).toHaveBeenCalledWith('tour-1');
    });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('closes on cancel without calling onUnregister', () => {
    const onUnregister = vi.fn();
    const onClose = vi.fn();
    renderConfirm({ onUnregister, onClose });
    fireEvent.click(screen.getByTestId('unregister-confirm-cancel'));
    expect(onUnregister).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
