import { describe, it, expect, jest } from '@jest/globals';
import React from 'react';
import { render } from '@testing-library/react-native';
import type { useThemedStyles as UseThemedStylesType } from '@/hooks/useThemedStyles';
import type { PublicTournamentItem } from '../../api/tournamentApi';
import type { TournamentCardLabels } from '../TournamentCard';

// Mock hooks
jest.mock('@/hooks/useThemedStyles', () => ({
  useThemedStyles: jest.fn(),
}));

jest.mock('@/lib/platformShadow', () => ({
  platformShadow: jest.fn(() => ({})),
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

/* eslint-disable @typescript-eslint/no-require-imports */
const { useThemedStyles } = require('@/hooks/useThemedStyles') as {
  useThemedStyles: jest.MockedFunction<typeof UseThemedStylesType>;
};
const { TournamentCard } = require('../TournamentCard') as {
  TournamentCard: (
    props: import('../TournamentCard').TournamentCardProps,
  ) => React.ReactElement | null;
};
/* eslint-enable @typescript-eslint/no-require-imports */

const mockPalette: Record<string, string> = {
  text: '#fff',
  background: '#000',
  tint: '#0af',
  icon: '#888',
  cardBackground: '#111',
  cardBorder: '#222',
};

beforeEach(() => {
  (
    useThemedStyles as jest.MockedFunction<typeof UseThemedStylesType>
  ).mockImplementation((fn) =>
    fn(mockPalette as unknown as Parameters<typeof fn>[0]),
  );
});

const baseLabels: TournamentCardLabels = {
  registered: '{count} / {max} registered',
  prize: 'Prize',
  entryFee: 'Entry fee',
  prizePool: 'Prize pool',
  registerCta: 'Register',
  unregisterCta: 'Unregister',
  signInToRegister: 'Sign in to register',
  full: 'Join waitlist',
  registrationClosed: 'Registration closed',
  errors: { insufficientFunds: 'Not enough coins.' },
  effectiveStatus: {
    scheduled: 'Scheduled',
    registration_open: 'Registration open',
    registration_closed: 'Registration closed',
    live: 'Live',
    awaiting_results: 'Awaiting results',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },
  gameType: { critical_v1: 'Critical', sea_battle_v1: 'Sea Battle' },
};

function buildItem(
  overrides?: Partial<PublicTournamentItem>,
): PublicTournamentItem {
  return {
    id: 'tournament-1',
    name: 'Spring Championship',
    gameType: 'critical_v1',
    scheduledAt: '2026-06-01T14:00:00Z',
    registrationOpensAt: '2026-05-01T00:00:00Z',
    registrationClosesAt: '2026-05-31T00:00:00Z',
    maxPlayers: 32,
    prizeDescription: 'Trophy + 500 coins',
    resultText: null,
    entryFeeCoins: 0,
    prizePoolCoins: 0,
    status: 'registration_open',
    effectiveStatus: 'registration_open',
    registeredCount: 10,
    waitlistCount: 0,
    isRegistered: false,
    isWaitlisted: false,
    ...overrides,
  };
}

describe('TournamentCard', () => {
  it('renders the tournament name', () => {
    const { getByText } = render(
      <TournamentCard
        item={buildItem()}
        isAuthenticated={false}
        onRegister={jest.fn()}
        onUnregister={jest.fn()}
        labels={baseLabels}
      />,
    );
    expect(getByText('Spring Championship')).toBeTruthy();
  });

  it('shows entry fee chip when entryFeeCoins > 0', () => {
    const { getByTestId } = render(
      <TournamentCard
        item={buildItem({ entryFeeCoins: 150 })}
        isAuthenticated={false}
        onRegister={jest.fn()}
        onUnregister={jest.fn()}
        labels={baseLabels}
      />,
    );
    const chip = getByTestId('entry-fee-tournament-1');
    expect(chip).toBeTruthy();
    // accessibilityLabel uses toLocaleString — just check it contains the number
    expect(chip.props.accessibilityLabel).toMatch(/Entry fee: 150/);
  });

  it('shows prize pool chip when prizePoolCoins > 0', () => {
    const { getByTestId } = render(
      <TournamentCard
        item={buildItem({ prizePoolCoins: 1000 })}
        isAuthenticated={false}
        onRegister={jest.fn()}
        onUnregister={jest.fn()}
        labels={baseLabels}
      />,
    );
    const chip = getByTestId('prize-pool-tournament-1');
    expect(chip).toBeTruthy();
    // accessibilityLabel uses toLocaleString — just check it contains the number
    expect(chip.props.accessibilityLabel).toMatch(/Prize pool: 1[,.]?000/);
  });

  it('hides entry fee chip when entryFeeCoins === 0', () => {
    const { queryByTestId } = render(
      <TournamentCard
        item={buildItem({ entryFeeCoins: 0 })}
        isAuthenticated={false}
        onRegister={jest.fn()}
        onUnregister={jest.fn()}
        labels={baseLabels}
      />,
    );
    expect(queryByTestId('entry-fee-tournament-1')).toBeNull();
  });

  it('hides prize pool chip when prizePoolCoins === 0', () => {
    const { queryByTestId } = render(
      <TournamentCard
        item={buildItem({ prizePoolCoins: 0 })}
        isAuthenticated={false}
        onRegister={jest.fn()}
        onUnregister={jest.fn()}
        labels={baseLabels}
      />,
    );
    expect(queryByTestId('prize-pool-tournament-1')).toBeNull();
  });

  it('shows both fee and prize pool chips when both > 0', () => {
    const { getByTestId } = render(
      <TournamentCard
        item={buildItem({ entryFeeCoins: 50, prizePoolCoins: 500 })}
        isAuthenticated={false}
        onRegister={jest.fn()}
        onUnregister={jest.fn()}
        labels={baseLabels}
      />,
    );
    expect(getByTestId('entry-fee-tournament-1')).toBeTruthy();
    expect(getByTestId('prize-pool-tournament-1')).toBeTruthy();
  });

  it('shows register button when authenticated and registration open', () => {
    const { getByTestId } = render(
      <TournamentCard
        item={buildItem({ effectiveStatus: 'registration_open' })}
        isAuthenticated={true}
        onRegister={jest.fn()}
        onUnregister={jest.fn()}
        labels={baseLabels}
      />,
    );
    expect(getByTestId('register-tournament-1')).toBeTruthy();
  });

  it('shows unregister button when already registered', () => {
    const { getByTestId } = render(
      <TournamentCard
        item={buildItem({ isRegistered: true })}
        isAuthenticated={true}
        onRegister={jest.fn()}
        onUnregister={jest.fn()}
        labels={baseLabels}
      />,
    );
    expect(getByTestId('unregister-tournament-1')).toBeTruthy();
  });

  it('matches snapshot with entry fee and prize pool', () => {
    const tree = render(
      <TournamentCard
        item={buildItem({ entryFeeCoins: 100, prizePoolCoins: 2000 })}
        isAuthenticated={true}
        onRegister={jest.fn()}
        onUnregister={jest.fn()}
        labels={baseLabels}
      />,
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
