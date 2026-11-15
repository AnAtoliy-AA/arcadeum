import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeaBattleBlitzModal } from './SeaBattleBlitzModal';
import { DEFAULT_BLITZ_BANNER_LABELS } from './SeaBattleBlitzBanner';
import type {
  PublicTournamentItem,
  TournamentBracketView,
  SeaBattleBlitzCaptain,
} from '../api';

const mockTournament: PublicTournamentItem = {
  id: 'cup-123',
  gameType: 'sea_battle_v1',
  scheduledAt: new Date(Date.now() + 3600000).toISOString(),
  registrationOpensAt: new Date(Date.now() - 3600000).toISOString(),
  registrationClosesAt: new Date(Date.now() + 3600000).toISOString(),
  maxPlayers: 16,
  prizeDescription: '500 Coins + Admiral Trophy',
  resultText: null,
  entryFeeCoins: 0,
  prizePoolCoins: 500,
  status: 'registration_open',
  effectiveStatus: 'registration_open',
  registeredCount: 2,
  waitlistCount: 0,
  isRegistered: false,
  isWaitlisted: false,
  name: 'Naval Armada Blitz Cup',
  description: '16-player naval warfare bracket',
};

const mockCaptains: SeaBattleBlitzCaptain[] = [
  {
    userId: 'user-alpha',
    displayName: 'Captain Drake',
    seed: 1,
    waitlist: false,
  },
  {
    userId: 'user-beta',
    displayName: 'Commander Nelson',
    seed: 2,
    waitlist: true,
  },
];

const mockBracket: TournamentBracketView = {
  tournamentId: 'cup-123',
  status: 'live',
  format: 'single_elimination',
  rounds: [
    [
      {
        round: 1,
        matchIndex: 0,
        playerA: 'user-alpha',
        playerB: 'user-beta',
        winnerUserId: null,
      },
    ],
  ],
};

describe('SeaBattleBlitzModal', () => {
  it('does not render content when open is false', () => {
    const { container } = render(
      <SeaBattleBlitzModal
        open={false}
        onClose={vi.fn()}
        tournament={mockTournament}
        bracket={null}
        captains={mockCaptains}
        labels={DEFAULT_BLITZ_BANNER_LABELS}
        locale="en"
        isAuthenticated={true}
        canRegister={true}
        isPending={false}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders modal header, tabs, and pending bracket state when open with null bracket', () => {
    render(
      <SeaBattleBlitzModal
        open={true}
        onClose={vi.fn()}
        tournament={mockTournament}
        bracket={null}
        captains={mockCaptains}
        labels={DEFAULT_BLITZ_BANNER_LABELS}
        locale="en"
        isAuthenticated={true}
        canRegister={true}
        isPending={false}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />,
    );

    expect(screen.getByTestId('sea-battle-blitz-modal')).toBeDefined();
    expect(screen.getByText('Naval Armada Blitz Cup')).toBeDefined();
    expect(screen.getByTestId('blitz-bracket-pending')).toBeDefined();
    expect(
      screen.getByText(DEFAULT_BLITZ_BANNER_LABELS.bracketPendingTitle),
    ).toBeDefined();
  });

  it('renders bracket matches when bracket data is provided', () => {
    render(
      <SeaBattleBlitzModal
        open={true}
        onClose={vi.fn()}
        tournament={mockTournament}
        bracket={mockBracket}
        captains={mockCaptains}
        labels={DEFAULT_BLITZ_BANNER_LABELS}
        locale="en"
        isAuthenticated={true}
        canRegister={true}
        isPending={false}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />,
    );

    expect(screen.getByTestId('bracket-view')).toBeDefined();
    expect(screen.getByTestId('bracket-match-0-0')).toBeDefined();
  });

  it('switches to roster tab and renders registered captains', () => {
    render(
      <SeaBattleBlitzModal
        open={true}
        onClose={vi.fn()}
        tournament={mockTournament}
        bracket={null}
        captains={mockCaptains}
        labels={DEFAULT_BLITZ_BANNER_LABELS}
        locale="en"
        isAuthenticated={true}
        canRegister={true}
        isPending={false}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('blitz-tab-roster'));

    expect(screen.getByTestId('blitz-modal-roster-section')).toBeDefined();
    expect(screen.getByText('Captain Drake')).toBeDefined();
    expect(screen.getByText('Commander Nelson')).toBeDefined();
    expect(
      screen.getByText(DEFAULT_BLITZ_BANNER_LABELS.rosterWaitlist),
    ).toBeDefined();
  });

  it('renders empty roster state when no captains registered', () => {
    render(
      <SeaBattleBlitzModal
        open={true}
        onClose={vi.fn()}
        tournament={mockTournament}
        bracket={null}
        captains={[]}
        labels={DEFAULT_BLITZ_BANNER_LABELS}
        locale="en"
        isAuthenticated={true}
        canRegister={true}
        isPending={false}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('blitz-tab-roster'));

    expect(screen.getByTestId('blitz-roster-empty')).toBeDefined();
    expect(
      screen.getByText(DEFAULT_BLITZ_BANNER_LABELS.rosterEmpty),
    ).toBeDefined();
  });

  it('switches to intel tab and renders rules cards', () => {
    render(
      <SeaBattleBlitzModal
        open={true}
        onClose={vi.fn()}
        tournament={mockTournament}
        bracket={null}
        captains={mockCaptains}
        labels={DEFAULT_BLITZ_BANNER_LABELS}
        locale="en"
        isAuthenticated={true}
        canRegister={true}
        isPending={false}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('blitz-tab-intel'));

    expect(screen.getByTestId('blitz-modal-intel-section')).toBeDefined();
    expect(
      screen.getByText(DEFAULT_BLITZ_BANNER_LABELS.intelFormat),
    ).toBeDefined();
    expect(
      screen.getByText(DEFAULT_BLITZ_BANNER_LABELS.intelFleet),
    ).toBeDefined();
    expect(
      screen.getByText(DEFAULT_BLITZ_BANNER_LABELS.intelClock),
    ).toBeDefined();
    expect(
      screen.getByText(DEFAULT_BLITZ_BANNER_LABELS.intelRewards),
    ).toBeDefined();
  });

  it('triggers onRegister when register button in modal footer is clicked', () => {
    const onRegister = vi.fn();
    render(
      <SeaBattleBlitzModal
        open={true}
        onClose={vi.fn()}
        tournament={mockTournament}
        bracket={null}
        captains={mockCaptains}
        labels={DEFAULT_BLITZ_BANNER_LABELS}
        locale="en"
        isAuthenticated={true}
        canRegister={true}
        isPending={false}
        onRegister={onRegister}
        onUnregister={vi.fn()}
      />,
    );

    const registerBtn = screen.getByTestId('blitz-modal-register-btn');
    fireEvent.click(registerBtn);
    expect(onRegister).toHaveBeenCalledTimes(1);
  });

  it('triggers onUnregister when player is registered', () => {
    const onUnregister = vi.fn();
    render(
      <SeaBattleBlitzModal
        open={true}
        onClose={vi.fn()}
        tournament={{ ...mockTournament, isRegistered: true }}
        bracket={null}
        captains={mockCaptains}
        labels={DEFAULT_BLITZ_BANNER_LABELS}
        locale="en"
        isAuthenticated={true}
        canRegister={false}
        isPending={false}
        onRegister={vi.fn()}
        onUnregister={onUnregister}
      />,
    );

    const unregisterBtn = screen.getByTestId('blitz-modal-unregister-btn');
    fireEvent.click(unregisterBtn);
    expect(onUnregister).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <SeaBattleBlitzModal
        open={true}
        onClose={onClose}
        tournament={mockTournament}
        bracket={null}
        captains={mockCaptains}
        labels={DEFAULT_BLITZ_BANNER_LABELS}
        locale="en"
        isAuthenticated={true}
        canRegister={true}
        isPending={false}
        onRegister={vi.fn()}
        onUnregister={vi.fn()}
      />,
    );

    const closeBtn = screen.getByTestId('blitz-modal-close-btn');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
