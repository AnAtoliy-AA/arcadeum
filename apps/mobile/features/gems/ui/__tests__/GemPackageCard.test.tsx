import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type { useThemedStyles as UseThemedStylesType } from '@/hooks/useThemedStyles';
import type { GemPackage } from '../../api/usePackages';

jest.mock('@/hooks/useThemedStyles', () => ({
  useThemedStyles: jest.fn(),
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
jest.mock('@/components/ThemedView', () => ({
  ThemedView: ({
    children,
    ...props
  }: { children: React.ReactNode } & Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native') as {
      View: React.ComponentType<Record<string, unknown>>;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mockReact = require('react') as typeof import('react');
    return mockReact.createElement(View, props, children);
  },
}));
jest.mock('@/lib/platformShadow', () => ({
  platformShadow: () => ({}),
}));

/* eslint-disable @typescript-eslint/no-require-imports */
const { useThemedStyles } = require('@/hooks/useThemedStyles') as {
  useThemedStyles: jest.MockedFunction<typeof UseThemedStylesType>;
};
const { GemPackageCard } = require('../GemPackageCard') as {
  GemPackageCard: (
    props: import('../GemPackageCard').GemPackageCardProps,
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

const mockPackage: GemPackage = {
  id: 'pkg-1',
  name: 'Starter Pack',
  gems: 100,
  bonusGems: 10,
  priceUsd: 0.99,
  currency: 'USD',
  isActive: true,
};

const mockLabels = {
  buy: 'Buy',
  bonus: 'Bonus',
  buying: 'Buying...',
};

describe('GemPackageCard', () => {
  it('renders package name', () => {
    const { getByText } = render(
      <GemPackageCard
        item={mockPackage}
        labels={mockLabels}
        onBuy={jest.fn()}
      />,
    );
    expect(getByText('Starter Pack')).toBeTruthy();
  });

  it('renders total gems including bonus', () => {
    const { getByText } = render(
      <GemPackageCard
        item={mockPackage}
        labels={mockLabels}
        onBuy={jest.fn()}
      />,
    );
    // 100 + 10 bonus = 110
    expect(getByText('110')).toBeTruthy();
  });

  it('renders bonus badge when bonusGems > 0', () => {
    const { getByTestId } = render(
      <GemPackageCard
        item={mockPackage}
        labels={mockLabels}
        onBuy={jest.fn()}
      />,
    );
    expect(getByTestId('gem-package-bonus-pkg-1')).toBeTruthy();
  });

  it('does not render bonus badge when bonusGems is 0', () => {
    const { queryByTestId } = render(
      <GemPackageCard
        item={{ ...mockPackage, bonusGems: 0 }}
        labels={mockLabels}
        onBuy={jest.fn()}
      />,
    );
    expect(queryByTestId('gem-package-bonus-pkg-1')).toBeNull();
  });

  it('calls onBuy with package id when Buy is pressed', () => {
    const onBuy = jest.fn();
    const { getByTestId } = render(
      <GemPackageCard item={mockPackage} labels={mockLabels} onBuy={onBuy} />,
    );
    fireEvent.press(getByTestId('gem-package-buy-pkg-1'));
    expect(onBuy).toHaveBeenCalledWith('pkg-1');
  });

  it('does not call onBuy when isPending is true', () => {
    const onBuy = jest.fn();
    const { getByTestId } = render(
      <GemPackageCard
        item={mockPackage}
        labels={mockLabels}
        onBuy={onBuy}
        isPending
      />,
    );
    fireEvent.press(getByTestId('gem-package-buy-pkg-1'));
    expect(onBuy).not.toHaveBeenCalled();
  });
});
