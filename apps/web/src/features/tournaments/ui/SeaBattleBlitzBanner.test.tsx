import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/shared/i18n', () => ({
  useLanguage: () => ({ locale: 'en' }),
}));

const mockSessionState = {
  snapshot: {
    accessToken: null as string | null,
    userId: null as string | null,
  },
};

vi.mock('@/entities/session/store/sessionStore', () => ({
  useSessionStore: (selector: (s: typeof mockSessionState) => unknown) =>
    selector(mockSessionState),
}));

const mockMutateAsync = vi.fn().mockResolvedValue({ ok: true });
const mockUnregisterAsync = vi.fn().mockResolvedValue(undefined);

vi.mock('../hooks', () => ({
  useSeaBattleBlitzCup: () => ({ data: null }),
  useRegisterTournament: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
  useUnregisterTournament: () => ({
    mutateAsync: mockUnregisterAsync,
    isPending: false,
  }),
}));

import { SeaBattleBlitzBanner } from './SeaBattleBlitzBanner';
import type { SeaBattleBlitzCupResponse } from '../api';

function makeBlitzData(
  overrides: Partial<SeaBattleBlitzCupResponse['tournament']> = {},
): SeaBattleBlitzCupResponse {
  return {
    tournament: {
      id: 'blitz-cup-1',
      gameType: 'sea_battle_v1',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      registrationOpensAt: new Date(Date.now() - 3600000).toISOString(),
      registrationClosesAt: new Date(Date.now() + 86000000).toISOString(),
      maxPlayers: 16,
      prizeDescription: '500 Coins + Admiral Trophy',
      resultText: null,
      entryFeeCoins: 0,
      prizePoolCoins: 500,
      status: 'registration_open',
      effectiveStatus: 'registration_open',
      registeredCount: 4,
      waitlistCount: 0,
      isRegistered: false,
      isWaitlisted: false,
      name: 'Sea Battle Weekend Blitz Cup',
      description: 'Weekly 16-player single-elimination tournament',
      ...overrides,
    },
    bracket: null,
    countdownSeconds: 86400,
  };
}

describe('SeaBattleBlitzBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionState.snapshot = {
      accessToken: null,
      user: null,
    };
  });

  it('renders null when tournament is not provided', () => {
    const { container } = render(
      <SeaBattleBlitzBanner
        initialData={{ tournament: null, bracket: null, countdownSeconds: 0 }}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders banner with title, description, and status', () => {
    const data = makeBlitzData();
    render(<SeaBattleBlitzBanner initialData={data} />);

    expect(screen.getByTestId('sea-battle-blitz-banner')).toBeDefined();
    expect(screen.getByTestId('blitz-cup-title').textContent).toBe(
      'Sea Battle Weekend Blitz Cup',
    );
    expect(screen.getByTestId('blitz-status-registration-open')).toBeDefined();
    expect(
      screen.getByTestId('blitz-cup-captains-count').textContent,
    ).toContain('4 / 16');
  });

  it('shows sign-in notice when user is not authenticated', () => {
    const data = makeBlitzData();
    render(<SeaBattleBlitzBanner initialData={data} />);

    expect(screen.getByTestId('blitz-cup-signin-notice')).toBeDefined();
    expect(screen.queryByTestId('blitz-cup-register-button')).toBeNull();
  });

  it('renders register button and calls mutation when authenticated', () => {
    mockSessionState.snapshot = {
      accessToken: 'token-123',
      userId: 'usr-123',
    };

    const data = makeBlitzData();
    render(<SeaBattleBlitzBanner initialData={data} />);

    const registerBtn = screen.getByTestId('blitz-cup-register-button');
    expect(registerBtn).toBeDefined();

    fireEvent.click(registerBtn);
    expect(mockMutateAsync).toHaveBeenCalledWith({ id: 'blitz-cup-1' });
  });

  it('renders unregister button when user is already registered', () => {
    mockSessionState.snapshot = {
      accessToken: 'token-123',
      userId: 'usr-123',
    };

    const data = makeBlitzData({ isRegistered: true });
    render(<SeaBattleBlitzBanner initialData={data} />);

    const unregisterBtn = screen.getByTestId('blitz-cup-unregister-button');
    expect(unregisterBtn).toBeDefined();

    fireEvent.click(unregisterBtn);
    expect(mockUnregisterAsync).toHaveBeenCalledWith({ id: 'blitz-cup-1' });
  });

  it('renders live status badge when tournament is live', () => {
    const data = makeBlitzData({
      status: 'live',
      effectiveStatus: 'live',
    });
    render(<SeaBattleBlitzBanner initialData={data} />);

    expect(screen.getByTestId('blitz-status-live')).toBeDefined();
  });

  it('returns null when enabled is false', () => {
    const data = makeBlitzData();
    data.enabled = false;
    const { container } = render(<SeaBattleBlitzBanner initialData={data} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders custom localized labels when provided', () => {
    const data = makeBlitzData();
    render(
      <SeaBattleBlitzBanner
        initialData={data}
        labels={{
          kicker: 'Naval Clash',
          statusOpen: 'Slots Available',
          allTournaments: 'Explore All',
        }}
      />,
    );

    expect(screen.getByText('Naval Clash')).toBeDefined();
    expect(screen.getByText('Slots Available')).toBeDefined();
    expect(screen.getByText('Explore All')).toBeDefined();
  });
});
