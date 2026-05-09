import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import type { useThemedStyles as UseThemedStylesType } from '@/hooks/useThemedStyles';
import type { RegisterConfirmLabels } from '../RegisterConfirm';

jest.mock('@/hooks/useThemedStyles', () => ({
  useThemedStyles: jest.fn(),
}));

/* eslint-disable @typescript-eslint/no-require-imports */
const { useThemedStyles } = require('@/hooks/useThemedStyles') as {
  useThemedStyles: jest.MockedFunction<typeof UseThemedStylesType>;
};
const { RegisterConfirm } = require('../RegisterConfirm') as {
  RegisterConfirm: (
    props: import('../RegisterConfirm').RegisterConfirmProps,
  ) => React.ReactElement | null;
};
/* eslint-enable @typescript-eslint/no-require-imports */

const mockPalette = {
  text: '#fff',
  background: '#000',
  tint: '#0af',
  icon: '#888',
  cardBackground: '#111',
  cardBorder: '#222',
};

beforeEach(() => {
  jest.clearAllMocks();
  (
    useThemedStyles as jest.MockedFunction<typeof UseThemedStylesType>
  ).mockImplementation((fn) => fn(mockPalette as Parameters<typeof fn>[0]));
});

const labels: RegisterConfirmLabels = {
  title: 'Confirm entry',
  body: 'This tournament costs {fee} coins. Your balance: {balance} coins.',
  confirm: 'Pay & Register',
  cancel: 'Cancel',
  errors: { insufficientFunds: 'Not enough coins to enter.' },
};

type OnRegisterFn = (id: string) => Promise<void>;

function makeRegister(
  impl: OnRegisterFn = () => Promise.resolve(),
): jest.MockedFunction<OnRegisterFn> {
  return jest.fn(impl) as jest.MockedFunction<OnRegisterFn>;
}

function baseProps(overrides?: {
  onRegister?: OnRegisterFn;
  onClose?: () => void;
  onSuccess?: () => void;
  currentBalanceCoins?: number | null;
  entryFeeCoins?: number;
  visible?: boolean;
}) {
  return {
    tournamentId: 'tour-1',
    entryFeeCoins: 100,
    currentBalanceCoins: 500,
    visible: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    onRegister: makeRegister(),
    labels,
    ...overrides,
  };
}

describe('RegisterConfirm', () => {
  it('renders title and body with placeholders filled', () => {
    const { getByText } = render(<RegisterConfirm {...baseProps()} />);
    expect(getByText('Confirm entry')).toBeTruthy();
    expect(
      getByText('This tournament costs 100 coins. Your balance: 500 coins.'),
    ).toBeTruthy();
  });

  it('calls onClose when Cancel is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <RegisterConfirm {...baseProps({ onClose })} />,
    );
    fireEvent.press(getByTestId('register-confirm-cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onRegister and onSuccess on confirm with sufficient balance', async () => {
    const onRegister = makeRegister(() => Promise.resolve());
    const onSuccess = jest.fn();
    const onClose = jest.fn();
    const { getByTestId } = render(
      <RegisterConfirm {...baseProps({ onRegister, onSuccess, onClose })} />,
    );

    await act(async () => {
      fireEvent.press(getByTestId('register-confirm-submit'));
    });

    await waitFor(() => {
      expect(onRegister).toHaveBeenCalledWith('tour-1');
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error and skips onRegister when balance is too low', async () => {
    const onRegister = makeRegister();
    const { getByTestId, getByText } = render(
      <RegisterConfirm
        {...baseProps({
          currentBalanceCoins: 50,
          entryFeeCoins: 100,
          onRegister,
        })}
      />,
    );

    await act(async () => {
      fireEvent.press(getByTestId('register-confirm-submit'));
    });

    expect(onRegister).not.toHaveBeenCalled();
    expect(getByText('Not enough coins to enter.')).toBeTruthy();
  });

  it('shows error on wallet.insufficientFunds thrown by onRegister', async () => {
    const onRegister = makeRegister(() =>
      Promise.reject(new Error('wallet.insufficientFunds')),
    );
    const { getByTestId, findByTestId } = render(
      <RegisterConfirm
        {...baseProps({ onRegister, currentBalanceCoins: 500 })}
      />,
    );

    await act(async () => {
      fireEvent.press(getByTestId('register-confirm-submit'));
    });

    const errorEl = await findByTestId('register-confirm-error');
    expect(errorEl).toBeTruthy();
  });

  it('omits balance line when currentBalanceCoins is null', () => {
    const { queryByText, getByText } = render(
      <RegisterConfirm {...baseProps({ currentBalanceCoins: null })} />,
    );
    expect(getByText('Confirm entry')).toBeTruthy();
    expect(queryByText(/Your balance/)).toBeNull();
  });

  it('does not render dialog content when visible is false', () => {
    const { queryByTestId } = render(
      <RegisterConfirm {...baseProps({ visible: false })} />,
    );
    expect(queryByTestId('register-confirm-dialog')).toBeNull();
  });
});
