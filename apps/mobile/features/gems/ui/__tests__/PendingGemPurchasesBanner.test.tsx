import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { useThemedStyles as UseThemedStylesType } from '@/hooks/useThemedStyles';
import type { usePendingPurchases as UsePendingPurchasesType } from '../../api/usePendingPurchases';
import type { useFinalizeGemPurchase as UseFinalizeMutationType } from '../../api/useFinalizeGemPurchase';

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
jest.mock('../../api/usePendingPurchases', () => ({
  usePendingPurchases: jest.fn(),
}));
jest.mock('../../api/useFinalizeGemPurchase', () => ({
  useFinalizeGemPurchase: jest.fn(),
}));

/* eslint-disable @typescript-eslint/no-require-imports */
const { useThemedStyles } = require('@/hooks/useThemedStyles') as {
  useThemedStyles: jest.MockedFunction<typeof UseThemedStylesType>;
};
const { usePendingPurchases } = require('../../api/usePendingPurchases') as {
  usePendingPurchases: jest.MockedFunction<typeof UsePendingPurchasesType>;
};
const { useFinalizeGemPurchase } =
  require('../../api/useFinalizeGemPurchase') as {
    useFinalizeGemPurchase: jest.MockedFunction<typeof UseFinalizeMutationType>;
  };
const { PendingGemPurchasesBanner } =
  require('../PendingGemPurchasesBanner') as {
    PendingGemPurchasesBanner: () => React.ReactElement | null;
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

const mockMutate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (
    useThemedStyles as jest.MockedFunction<typeof UseThemedStylesType>
  ).mockImplementation((fn) => fn(mockPalette as Parameters<typeof fn>[0]));
  (
    useFinalizeGemPurchase as jest.MockedFunction<
      typeof UseFinalizeMutationType
    >
  ).mockReturnValue({
    mutate: mockMutate,
    mutateAsync: jest.fn(),
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
  } as unknown as ReturnType<typeof UseFinalizeMutationType>);
});

describe('PendingGemPurchasesBanner', () => {
  it('renders nothing when pending list is empty', () => {
    (
      usePendingPurchases as jest.MockedFunction<typeof UsePendingPurchasesType>
    ).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof UsePendingPurchasesType>);

    const { queryByTestId } = render(<PendingGemPurchasesBanner />);
    expect(queryByTestId('pending-gem-purchases-banner')).toBeNull();
  });

  it('renders nothing while loading', () => {
    (
      usePendingPurchases as jest.MockedFunction<typeof UsePendingPurchasesType>
    ).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      isSuccess: false,
    } as unknown as ReturnType<typeof UsePendingPurchasesType>);

    const { queryByTestId } = render(<PendingGemPurchasesBanner />);
    expect(queryByTestId('pending-gem-purchases-banner')).toBeNull();
  });

  it('renders banner when there are pending purchases', () => {
    (
      usePendingPurchases as jest.MockedFunction<typeof UsePendingPurchasesType>
    ).mockReturnValue({
      data: [
        {
          id: 'purchase-1',
          packageId: 'pkg-1',
          packageName: 'Starter Pack',
          gems: 100,
          paypalOrderId: 'PP-TEST-1',
          approveUrl: 'https://paypal.test',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof UsePendingPurchasesType>);

    const { getByTestId } = render(<PendingGemPurchasesBanner />);
    expect(getByTestId('pending-gem-purchases-banner')).toBeTruthy();
    expect(getByTestId('pending-purchase-row-PP-TEST-1')).toBeTruthy();
  });

  it('calls finalize mutation when Verify is pressed', () => {
    (
      usePendingPurchases as jest.MockedFunction<typeof UsePendingPurchasesType>
    ).mockReturnValue({
      data: [
        {
          id: 'purchase-1',
          packageId: 'pkg-1',
          packageName: 'Starter Pack',
          gems: 100,
          paypalOrderId: 'PP-TEST-1',
          approveUrl: 'https://paypal.test',
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
      isLoading: false,
      isError: false,
      isSuccess: true,
    } as unknown as ReturnType<typeof UsePendingPurchasesType>);

    const { getByTestId } = render(<PendingGemPurchasesBanner />);
    fireEvent.press(getByTestId('pending-purchase-verify-PP-TEST-1'));
    expect(mockMutate).toHaveBeenCalledWith('PP-TEST-1');
  });
});
