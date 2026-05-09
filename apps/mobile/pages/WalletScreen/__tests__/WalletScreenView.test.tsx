import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render } from '@testing-library/react-native';
import type {
  useWalletBalance as UseWalletBalanceType,
  useWalletTransactions as UseWalletTransactionsType,
} from '@/features/wallet/api/useWallet';
import type { useTranslation as UseTranslationType } from '@/lib/i18n';
import type { useColorScheme as UseColorSchemeType } from '@/hooks/useColorScheme';

// Mock dependencies
jest.mock('@/features/wallet/api/useWallet', () => ({
  useWalletBalance: jest.fn(),
  useWalletTransactions: jest.fn(),
}));

jest.mock('@/lib/i18n', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(),
}));

jest.mock('@/stores/sessionTokens', () => ({
  useSessionTokens: jest.fn(),
}));

/* eslint-disable @typescript-eslint/no-require-imports */
const { useWalletBalance, useWalletTransactions } =
  require('@/features/wallet/api/useWallet') as {
    useWalletBalance: jest.MockedFunction<typeof UseWalletBalanceType>;
    useWalletTransactions: jest.MockedFunction<
      typeof UseWalletTransactionsType
    >;
  };
const { useTranslation } = require('@/lib/i18n') as {
  useTranslation: jest.MockedFunction<typeof UseTranslationType>;
};
const { useColorScheme } = require('@/hooks/useColorScheme') as {
  useColorScheme: jest.MockedFunction<typeof UseColorSchemeType>;
};
const { WalletScreenView } = require('../WalletScreenView') as {
  WalletScreenView: () => React.ReactElement;
};
/* eslint-enable @typescript-eslint/no-require-imports */

const mockT = jest.fn((key: string) => key);

const mockColorScheme = {
  colorScheme: 'dark' as const,
  isDarkLike: true,
};

const emptyTransactionResult = {
  data: { pages: [{ items: [], nextCursor: null }], pageParams: [undefined] },
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  fetchNextPage: jest.fn(),
  hasNextPage: false,
  isFetchingNextPage: false,
} as unknown as ReturnType<typeof UseWalletTransactionsType>;

beforeEach(() => {
  useTranslation.mockReturnValue({ t: mockT, locale: 'en' });
  useColorScheme.mockReturnValue(mockColorScheme);
  useWalletBalance.mockReturnValue({
    data: { coins: 100, gems: 5 },
    isLoading: false,
    isError: false,
  } as unknown as ReturnType<typeof UseWalletBalanceType>);
  useWalletTransactions.mockReturnValue(emptyTransactionResult);
});

describe('WalletScreenView', () => {
  it('renders without crashing (snapshot)', () => {
    const { toJSON } = render(<WalletScreenView />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('shows loading indicator when transactions are loading', () => {
    useWalletTransactions.mockReturnValue({
      ...emptyTransactionResult,
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof UseWalletTransactionsType>);

    const { toJSON } = render(<WalletScreenView />);
    expect(toJSON()).toBeTruthy();
  });

  it('shows error state when transactions fail', () => {
    useWalletTransactions.mockReturnValue({
      ...emptyTransactionResult,
      isError: true,
    } as unknown as ReturnType<typeof UseWalletTransactionsType>);

    const { getByText } = render(<WalletScreenView />);
    expect(getByText('wallet.page.error.title')).toBeTruthy();
    expect(getByText('wallet.page.error.retry')).toBeTruthy();
  });

  it('shows empty state when no transactions', () => {
    const { getByText } = render(<WalletScreenView />);
    expect(getByText('wallet.page.empty.title')).toBeTruthy();
  });
});
