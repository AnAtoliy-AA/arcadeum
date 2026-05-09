import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';

vi.mock('@/shared/i18n/context', () => ({
  useLanguage: () => ({ locale: 'en', messages: {} }),
}));

import { TournamentCard, type TournamentCardLabels } from './TournamentCard';
import type { PublicTournamentItem } from '../api';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const labels: TournamentCardLabels = {
  registered: '{count} / {max} registered',
  prize: 'Prize',
  entryFee: 'Entry fee',
  prizePool: 'Prize pool',
  registerCta: 'Register',
  unregisterCta: 'Unregister',
  signInToRegister: 'Sign in to register',
  full: 'Join waitlist',
  registrationClosed: 'Registration closed',
  confirmRegister: {
    title: 'Confirm entry',
    body: 'Costs {fee} coins. Balance: {balance} coins.',
    confirm: 'Pay & Register',
    cancel: 'Cancel',
  },
  confirmUnregister: {
    refund: 'Refunded {amount} coins.',
    title: 'Cancel registration',
    body: 'Are you sure?',
    confirm: 'Yes, cancel',
    cancelButton: 'No, keep me in',
  },
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

function makeItem(
  overrides: Partial<PublicTournamentItem> = {},
): PublicTournamentItem {
  return {
    id: 'tour-1',
    gameType: 'critical_v1',
    scheduledAt: '2026-06-01T12:00:00Z',
    registrationOpensAt: null,
    registrationClosesAt: null,
    maxPlayers: 16,
    prizeDescription: null,
    resultText: null,
    entryFeeCoins: 0,
    prizePoolCoins: 0,
    status: 'registration_open',
    effectiveStatus: 'registration_open',
    registeredCount: 3,
    waitlistCount: 0,
    isRegistered: false,
    isWaitlisted: false,
    name: 'Test Tournament',
    ...overrides,
  };
}

describe('TournamentCard – entry fee & prize pool', () => {
  it('does not show entry fee or prize pool when both are 0', () => {
    render(
      <Wrapper>
        <TournamentCard
          item={makeItem({ entryFeeCoins: 0, prizePoolCoins: 0 })}
          isAuthenticated={false}
          onRegister={() => undefined}
          onUnregister={() => undefined}
          labels={labels}
        />
      </Wrapper>,
    );
    expect(screen.queryByTestId('entry-fee-tour-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('prize-pool-tour-1')).not.toBeInTheDocument();
  });

  it('shows entry fee when > 0', () => {
    render(
      <Wrapper>
        <TournamentCard
          item={makeItem({ entryFeeCoins: 50, prizePoolCoins: 0 })}
          isAuthenticated={false}
          onRegister={() => undefined}
          onUnregister={() => undefined}
          labels={labels}
        />
      </Wrapper>,
    );
    expect(screen.getByTestId('entry-fee-tour-1')).toBeInTheDocument();
    expect(screen.queryByTestId('prize-pool-tour-1')).not.toBeInTheDocument();
  });

  it('shows prize pool when > 0', () => {
    render(
      <Wrapper>
        <TournamentCard
          item={makeItem({ entryFeeCoins: 0, prizePoolCoins: 1000 })}
          isAuthenticated={false}
          onRegister={() => undefined}
          onUnregister={() => undefined}
          labels={labels}
        />
      </Wrapper>,
    );
    expect(screen.queryByTestId('entry-fee-tour-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('prize-pool-tour-1')).toBeInTheDocument();
  });

  it('shows both entry fee and prize pool when both > 0', () => {
    render(
      <Wrapper>
        <TournamentCard
          item={makeItem({ entryFeeCoins: 25, prizePoolCoins: 200 })}
          isAuthenticated={false}
          onRegister={() => undefined}
          onUnregister={() => undefined}
          labels={labels}
        />
      </Wrapper>,
    );
    expect(screen.getByTestId('entry-fee-tour-1')).toBeInTheDocument();
    expect(screen.getByTestId('prize-pool-tour-1')).toBeInTheDocument();
  });
});
