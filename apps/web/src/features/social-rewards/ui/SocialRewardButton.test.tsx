import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../server/social-rewards.actions', () => ({
  claimSocialRewardAction: vi.fn(),
}));

import { SocialRewardButton } from './SocialRewardButton';
import { claimSocialRewardAction } from '../server/social-rewards.actions';

const labels = {
  claim: 'Claim +{n} 💎',
  claimed: 'Claimed ✓',
  followAndClaim: 'Subscribe & Claim +{n} 💎',
  toastSuccess: 'Claimed +{n} Gem successfully!',
  errorAlreadyClaimed: 'Already claimed!',
  errorUnauthorized: 'Please sign in to claim rewards.',
  errorGeneric: 'Failed to claim reward. Try again.',
};

beforeEach(() => {
  vi.mocked(claimSocialRewardAction).mockReset();
  vi.stubGlobal('open', vi.fn());
});

describe('SocialRewardButton', () => {
  it('renders button with claim label and gem quantity', () => {
    render(<SocialRewardButton platform="discord" gems={1} labels={labels} />);
    const btn = screen.getByTestId('social-reward-claim-btn-discord');
    expect(btn.textContent).toContain('Claim +1 💎');
    expect((btn as HTMLButtonElement).disabled).toBe(false);
  });

  it('renders follow & claim label when href is provided', () => {
    render(
      <SocialRewardButton
        platform="telegram"
        href="https://t.me/arcadeum"
        gems={2}
        labels={labels}
      />,
    );
    const btn = screen.getByTestId('social-reward-claim-btn-telegram');
    expect(btn.textContent).toContain('Subscribe & Claim +2 💎');
  });

  it('renders disabled state when initialClaimed is true', () => {
    render(
      <SocialRewardButton
        platform="discord"
        initialClaimed={true}
        labels={labels}
      />,
    );
    const btn = screen.getByTestId(
      'social-reward-claim-btn-discord',
    ) as HTMLButtonElement;
    expect(btn.textContent).toContain('Claimed ✓');
    expect(btn.disabled).toBe(true);
  });

  it('opens link and claims reward successfully upon click', async () => {
    vi.mocked(claimSocialRewardAction).mockResolvedValueOnce({
      ok: true,
      result: {
        success: true,
        platform: 'discord',
        gemsAwarded: 1,
        gemsBalanceAfter: 10,
        claimedAt: new Date().toISOString(),
      },
    });

    render(
      <SocialRewardButton
        platform="discord"
        href="https://discord.gg/arcadeum"
        gems={1}
        labels={labels}
      />,
    );

    const btn = screen.getByTestId('social-reward-claim-btn-discord');
    fireEvent.click(btn);

    expect(window.open).toHaveBeenCalledWith(
      'https://discord.gg/arcadeum',
      '_blank',
      'noopener,noreferrer',
    );

    await waitFor(() => {
      expect(screen.getByTestId('social-reward-success-discord')).toBeDefined();
    });

    expect(
      screen.getByTestId('social-reward-success-discord').textContent,
    ).toBe('Claimed +1 Gem successfully!');
  });

  it('handles error response gracefully', async () => {
    vi.mocked(claimSocialRewardAction).mockResolvedValueOnce({
      ok: false,
      code: 'unauthorized',
    });

    render(<SocialRewardButton platform="discord" gems={1} labels={labels} />);

    const btn = screen.getByTestId('social-reward-claim-btn-discord');
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByTestId('social-reward-error-discord')).toBeDefined();
    });

    expect(screen.getByTestId('social-reward-error-discord').textContent).toBe(
      'Please sign in to claim rewards.',
    );
  });
});
