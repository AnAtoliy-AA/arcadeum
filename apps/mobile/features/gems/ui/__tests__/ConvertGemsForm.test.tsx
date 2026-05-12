import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import type { useThemedStyles as UseThemedStylesType } from '@/hooks/useThemedStyles';
import type { useWalletBalance as UseWalletBalanceType } from '@/features/wallet/api/useWallet';
import type { useConversionRate as UseConversionRateType } from '../../api/useConversionRate';
import type { useConvertGems as UseConvertGemsType } from '../../api/useConvertGems';

jest.mock('@/hooks/useThemedStyles', () => ({
  useThemedStyles: jest.fn(),
}));
jest.mock('@/lib/i18n', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
  })),
}));
jest.mock('@/components/ThemedText', () => ({
  ThemedText: ({
    children,
    ...props
  }: { children: React.ReactNode } & Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require('react-native') as {
      Text: React.ComponentType<Record<string, unknown>>;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mockReact = require('react') as typeof import('react');
    return mockReact.createElement(Text, props, children);
  },
}));
jest.mock('@/features/wallet/api/useWallet', () => ({
  useWalletBalance: jest.fn(),
}));
jest.mock('../../api/useConversionRate', () => ({
  useConversionRate: jest.fn(),
}));
jest.mock('../../api/useConvertGems', () => ({
  useConvertGems: jest.fn(),
}));
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-1234'),
}));

/* eslint-disable @typescript-eslint/no-require-imports */
const { useThemedStyles } = require('@/hooks/useThemedStyles') as {
  useThemedStyles: jest.MockedFunction<typeof UseThemedStylesType>;
};
const { useWalletBalance } = require('@/features/wallet/api/useWallet') as {
  useWalletBalance: jest.MockedFunction<typeof UseWalletBalanceType>;
};
const { useConversionRate } = require('../../api/useConversionRate') as {
  useConversionRate: jest.MockedFunction<typeof UseConversionRateType>;
};
const { useConvertGems } = require('../../api/useConvertGems') as {
  useConvertGems: jest.MockedFunction<typeof UseConvertGemsType>;
};
const { ConvertGemsForm } = require('../ConvertGemsForm') as {
  ConvertGemsForm: () => React.ReactElement | null;
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

type ConvertGemsFn = (
  payload: import('../../api/useConvertGems').ConvertGemsPayload,
) => Promise<import('../../api/useConvertGems').ConvertGemsResult>;
const mockMutateAsync = jest.fn<ConvertGemsFn>().mockResolvedValue({
  gemsDebited: 50,
  coinscredited: 5,
  balanceAfter: { coins: 105, gems: 50 },
});

beforeEach(() => {
  jest.clearAllMocks();
  (
    useThemedStyles as jest.MockedFunction<typeof UseThemedStylesType>
  ).mockImplementation((fn) => fn(mockPalette as Parameters<typeof fn>[0]));
  (
    useWalletBalance as jest.MockedFunction<typeof UseWalletBalanceType>
  ).mockReturnValue({
    data: { coins: 100, gems: 100 },
    isLoading: false,
    isError: false,
    isSuccess: true,
  } as unknown as ReturnType<typeof UseWalletBalanceType>);
  (
    useConversionRate as jest.MockedFunction<typeof UseConversionRateType>
  ).mockReturnValue({
    data: { gemsPerCoin: 10, coinsPerGem: 0.1 },
    isLoading: false,
    isError: false,
    isSuccess: true,
  } as unknown as ReturnType<typeof UseConversionRateType>);
  (
    useConvertGems as jest.MockedFunction<typeof UseConvertGemsType>
  ).mockReturnValue({
    mutateAsync: mockMutateAsync,
    mutate: jest.fn(),
    reset: jest.fn(),
    status: 'idle',
    isIdle: true,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: undefined,
    variables: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    context: undefined,
  } as unknown as ReturnType<typeof UseConvertGemsType>);
});

describe('ConvertGemsForm', () => {
  it('renders the form', () => {
    const { getByTestId } = render(<ConvertGemsForm />);
    expect(getByTestId('convert-gems-form')).toBeTruthy();
    expect(getByTestId('convert-gems-input')).toBeTruthy();
    expect(getByTestId('convert-gems-submit')).toBeTruthy();
  });

  it('shows computed coins when gems are entered', () => {
    const { getByTestId } = render(<ConvertGemsForm />);
    fireEvent.changeText(getByTestId('convert-gems-input'), '50');
    // 50 gems * 0.1 coinsPerGem = 5 coins
    expect(getByTestId('convert-coins-out')).toBeTruthy();
  });

  it('calls convertGems mutation on submit with valid input and sufficient balance', async () => {
    const { getByTestId } = render(<ConvertGemsForm />);
    fireEvent.changeText(getByTestId('convert-gems-input'), '50');

    await act(async () => {
      fireEvent.press(getByTestId('convert-gems-submit'));
    });

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        gems: 50,
        conversionId: 'test-uuid-1234',
      });
    });
  });

  it('shows insufficient funds inline error when gems exceed balance', async () => {
    (
      useWalletBalance as jest.MockedFunction<typeof UseWalletBalanceType>
    ).mockReturnValue({
      data: { coins: 100, gems: 10 },
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof UseWalletBalanceType>);

    const { getByTestId } = render(<ConvertGemsForm />);
    fireEvent.changeText(getByTestId('convert-gems-input'), '999');

    await act(async () => {
      fireEvent.press(getByTestId('convert-gems-submit'));
    });

    expect(getByTestId('convert-gems-error')).toBeTruthy();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows error when conversion fails', async () => {
    mockMutateAsync.mockRejectedValueOnce(
      new Error(
        'Conversion failed',
      ) as unknown as import('../../api/useConvertGems').ConvertGemsResult,
    );

    const { getByTestId } = render(<ConvertGemsForm />);
    fireEvent.changeText(getByTestId('convert-gems-input'), '10');

    await act(async () => {
      fireEvent.press(getByTestId('convert-gems-submit'));
    });

    await waitFor(() => {
      expect(getByTestId('convert-gems-error')).toBeTruthy();
    });
  });

  it('returns null when rate is not available', () => {
    (
      useConversionRate as jest.MockedFunction<typeof UseConversionRateType>
    ).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof UseConversionRateType>);

    const { queryByTestId } = render(<ConvertGemsForm />);
    expect(queryByTestId('convert-gems-form')).toBeNull();
  });
});
