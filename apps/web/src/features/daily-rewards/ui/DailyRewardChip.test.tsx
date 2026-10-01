import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from '@testing-library/react';

vi.mock('@/shared/lib/api-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/lib/api-client')>();
  return {
    ...actual,
    apiClient: { ...actual.apiClient, get: vi.fn() },
  };
});

vi.mock('@/shared/i18n/useTranslation', async () => {
  const { dailyRewardsEn } =
    await import('@/shared/i18n/messages/pages/daily-rewards/en');
  const messages: Record<string, unknown> = { dailyRewards: dailyRewardsEn };
  const lookup = (key: string): string => {
    let value: unknown = { pages: messages };
    for (const part of key.split('.')) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  };
  return { useTranslation: () => ({ t: lookup }) };
});

vi.mock('@/shared/config/useRoutes', async () => {
  const { buildRoutes } = await import('@/shared/config/routes');
  return { useRoutes: () => buildRoutes('en') };
});

vi.mock('../server/daily-rewards.actions', () => ({
  claimDailyRewardAction: vi.fn(),
}));

import { DailyRewardChip } from './DailyRewardChip';
import { apiClient, ApiError } from '@/shared/lib/api-client';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import { claimDailyRewardAction } from '../server/daily-rewards.actions';
import type { DailyRewardStatus } from '../server/daily-rewards.types';
import { buildRoutes } from '@/shared/config/routes';

const routes = buildRoutes('en');

const claimableStatus: DailyRewardStatus = {
  canClaim: true,
  nextDay: 3,
  currentStreak: 2,
  nextRewardCoins: 35,
  nextRewardGems: 0,
  nextResetAt: '2026-10-02T00:00:00.000Z',
};

function setStoreState(
  overrides: Partial<typeof useSessionStore.getState> = {},
) {
  const snapshot = useSessionStore.getState().snapshot;
  useSessionStore.setState({
    hydrated: true,
    snapshot: {
      ...snapshot,
      accessToken: null,
      userId: null,
      refreshToken: null,
    },
    ...overrides,
  });
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('DailyRewardChip', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    vi.mocked(claimDailyRewardAction).mockReset();
    setStoreState();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing while the status request is in flight', async () => {
    vi.mocked(apiClient.get).mockReturnValue(new Promise(() => {}));

    render(<DailyRewardChip />);

    expect(screen.queryByTestId('daily-reward-chip')).toBeNull();
  });

  it('shows the sign-in CTA for anonymous visitors on 401', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new ApiError('Unauthorized', 401),
    );

    render(<DailyRewardChip />);

    const chip = await screen.findByTestId('daily-reward-chip');
    expect(chip).toBeInTheDocument();

    const cta = screen.getByTestId('daily-reward-claim-btn');
    expect(cta).toHaveTextContent('Sign in to claim');
    expect(cta).toHaveAttribute('href', routes.auth);
  });

  it('shows the claim button when authenticated and claimable', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(claimableStatus);

    render(<DailyRewardChip />);

    const btn = await screen.findByTestId('daily-reward-claim-btn');
    expect(btn).toHaveTextContent('Claim 35 coins');
    expect(btn).not.toBeDisabled();
  });

  it('hides the chip when the reward was already claimed', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      ...claimableStatus,
      canClaim: false,
    });

    render(<DailyRewardChip />);
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
    await flush();

    expect(screen.queryByTestId('daily-reward-chip')).toBeNull();
  });

  it('hides the chip when the BE is unreachable', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new ApiError('Internal Server Error', 500),
    );

    render(<DailyRewardChip />);
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
    await flush();

    expect(screen.queryByTestId('daily-reward-chip')).toBeNull();
  });

  it('stays hidden while a prior session restore is still pending', async () => {
    setStoreState();
    const snapshot = useSessionStore.getState().snapshot;
    useSessionStore.setState({
      snapshot: { ...snapshot, userId: 'user-1' },
    });
    vi.mocked(apiClient.get).mockRejectedValue(
      new ApiError('Unauthorized', 401),
    );

    render(<DailyRewardChip />);
    await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
    await flush();

    // SessionRoleSync may still be restoring the token from the cookie;
    // the sign-in CTA must not flash for a logged-in user.
    expect(screen.queryByTestId('daily-reward-chip')).toBeNull();
  });

  it('falls back to the anon CTA when the session restore never lands', async () => {
    vi.useFakeTimers();
    const snapshot = useSessionStore.getState().snapshot;
    useSessionStore.setState({
      snapshot: { ...snapshot, userId: 'user-1' },
    });
    vi.mocked(apiClient.get).mockRejectedValue(
      new ApiError('Unauthorized', 401),
    );

    render(<DailyRewardChip />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4_000);
    });

    expect(screen.getByTestId('daily-reward-chip')).toBeInTheDocument();
    expect(screen.getByTestId('daily-reward-claim-btn')).toHaveTextContent(
      'Sign in to claim',
    );
  });

  it('flips to the claimed state after a successful claim', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(claimableStatus);
    vi.mocked(claimDailyRewardAction).mockResolvedValue({
      ok: true,
      result: {
        awardedCoins: 35,
        awardedGems: 0,
        currentStreak: 3,
        coinsBalanceAfter: 135,
        gemsBalanceAfter: null,
      },
    });

    render(<DailyRewardChip />);

    const btn = await screen.findByTestId('daily-reward-claim-btn');
    expect(btn).toHaveTextContent('Claim 35 coins');

    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId('daily-reward-success')).toHaveTextContent(
        'You claimed 35 coins!',
      );
    });
    // Chip stays mounted so the success message remains visible; the button
    // is now the disabled "Come back tomorrow" state.
    expect(screen.getByTestId('daily-reward-chip')).toBeInTheDocument();
    expect(screen.getByTestId('daily-reward-claim-btn')).toBeDisabled();
    expect(screen.getByTestId('daily-reward-claim-btn')).toHaveTextContent(
      'Come back tomorrow',
    );
  });
});
