import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the Server Action module before importing the component.
vi.mock('../server/daily-rewards.actions', () => ({
  claimDailyRewardAction: vi.fn(),
}));

import { ClaimButton } from './ClaimButton';
import { claimDailyRewardAction } from '../server/daily-rewards.actions';

const labels = {
  claim: 'Claim {n} coins',
  claimed: 'Come back tomorrow',
  toastClaimed: 'You claimed {n} coins!',
  errorAlreadyClaimed: 'Already claimed today.',
  errorUnauthorized: 'Sign in to claim.',
  errorGeneric: 'Could not claim. Try again.',
};

beforeEach(() => {
  vi.mocked(claimDailyRewardAction).mockReset();
});

describe('ClaimButton', () => {
  it('renders the claim label with coin count when canClaim is true', () => {
    render(
      <ClaimButton canClaim={true} nextRewardCoins={25} labels={labels} />,
    );
    const btn = screen.getByTestId('daily-reward-claim-btn');
    expect(btn.textContent).toContain('Claim 25 coins');
    expect((btn as HTMLButtonElement).disabled).toBe(false);
  });

  it('renders the disabled state with `claimed` label when canClaim is false', () => {
    render(
      <ClaimButton canClaim={false} nextRewardCoins={25} labels={labels} />,
    );
    const btn = screen.getByTestId(
      'daily-reward-claim-btn',
    ) as HTMLButtonElement;
    expect(btn.textContent).toContain('Come back tomorrow');
    expect(btn.disabled).toBe(true);
  });

  it('fires the Server Action on click and shows a success message', async () => {
    vi.mocked(claimDailyRewardAction).mockResolvedValueOnce({
      ok: true,
      result: { awardedCoins: 25, currentStreak: 1, balanceAfter: 125 },
    });

    render(
      <ClaimButton canClaim={true} nextRewardCoins={25} labels={labels} />,
    );

    fireEvent.click(screen.getByTestId('daily-reward-claim-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('daily-reward-success').textContent).toContain(
        'You claimed 25 coins!',
      );
    });
    expect(claimDailyRewardAction).toHaveBeenCalledOnce();
  });

  it('shows already-claimed error on 409', async () => {
    vi.mocked(claimDailyRewardAction).mockResolvedValueOnce({
      ok: false,
      code: 'already_claimed',
    });

    render(
      <ClaimButton canClaim={true} nextRewardCoins={25} labels={labels} />,
    );

    fireEvent.click(screen.getByTestId('daily-reward-claim-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('daily-reward-error').textContent).toContain(
        'Already claimed today.',
      );
    });
  });

  it('shows unauthorized error on 401', async () => {
    vi.mocked(claimDailyRewardAction).mockResolvedValueOnce({
      ok: false,
      code: 'unauthorized',
    });

    render(
      <ClaimButton canClaim={true} nextRewardCoins={25} labels={labels} />,
    );

    fireEvent.click(screen.getByTestId('daily-reward-claim-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('daily-reward-error').textContent).toContain(
        'Sign in to claim.',
      );
    });
  });

  it('shows generic error on unknown failure', async () => {
    vi.mocked(claimDailyRewardAction).mockResolvedValueOnce({
      ok: false,
      code: 'unknown',
    });

    render(
      <ClaimButton canClaim={true} nextRewardCoins={25} labels={labels} />,
    );

    fireEvent.click(screen.getByTestId('daily-reward-claim-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('daily-reward-error').textContent).toContain(
        'Could not claim. Try again.',
      );
    });
  });

  it('does not fire the action when canClaim is false', () => {
    render(
      <ClaimButton canClaim={false} nextRewardCoins={25} labels={labels} />,
    );

    fireEvent.click(screen.getByTestId('daily-reward-claim-btn'));
    expect(claimDailyRewardAction).not.toHaveBeenCalled();
  });
});
