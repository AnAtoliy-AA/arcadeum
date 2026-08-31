import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialRewardsSection } from './SocialRewardsSection';

vi.mock('../server/social-rewards.actions', () => ({
  claimSocialRewardAction: vi.fn(),
}));

describe('SocialRewardsSection', () => {
  it('renders all default social network cards when status is not provided', () => {
    render(<SocialRewardsSection />);

    expect(screen.getByTestId('social-rewards-section')).toBeDefined();
    expect(screen.getByTestId('social-rewards-grid')).toBeDefined();
    expect(screen.getByTestId('social-reward-card-discord')).toBeDefined();
    expect(screen.getByTestId('social-reward-card-telegram')).toBeDefined();
    expect(screen.getByTestId('social-reward-card-x')).toBeDefined();
    expect(screen.getByTestId('social-reward-card-github')).toBeDefined();
    expect(screen.getByTestId('social-reward-card-youtube')).toBeDefined();
    expect(screen.getByTestId('social-reward-card-instagram')).toBeDefined();
  });

  it('renders status data and claimed counts when provided', () => {
    const status = {
      items: [
        {
          platform: 'discord',
          gems: 2,
          claimed: true,
          claimedAt: '2026-08-31',
        },
        { platform: 'telegram', gems: 2, claimed: false, claimedAt: null },
      ],
      totalClaimed: 1,
      totalAvailable: 2,
      gemsPerSubscription: 2,
    };

    render(<SocialRewardsSection status={status} />);

    expect(screen.getByText('1 / 2 claimed')).toBeDefined();
    expect(screen.getAllByText('+2 💎').length).toBe(2);
    expect(screen.getByText('Claimed')).toBeDefined();
  });
});
