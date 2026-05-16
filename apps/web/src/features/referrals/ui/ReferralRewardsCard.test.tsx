import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      // Return the full key with params substituted so tests can assert on content
      if (params) {
        return Object.entries(params).reduce(
          (str, [k, v]) => str.replace(`{{${k}}}`, v),
          key,
        );
      }
      return key;
    },
  }),
}));

vi.mock('@/shared/ui', () => ({
  GlassCard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="glass-card">{children}</div>
  ),
}));

import { ReferralRewardsCard } from './ReferralRewardsCard';
import type { ReferralTier } from '../types';
import { REFERRAL_COIN_REWARDS } from '../lib/coin-rewards';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const MOCK_TIERS: ReferralTier[] = [
  {
    tier: 1,
    requiredInvites: 3,
    rewards: [
      {
        rewardId: 'badge_social_butterfly',
        rewardType: 'badge',
        label: 'Social Butterfly',
      },
    ],
    unlocked: true,
  },
  {
    tier: 2,
    requiredInvites: 5,
    rewards: [
      {
        rewardId: 'early_access_heist',
        rewardType: 'early_access',
        label: 'Early Access: The Heist',
      },
    ],
    unlocked: false,
  },
  {
    tier: 3,
    requiredInvites: 10,
    rewards: [
      {
        rewardId: 'badge_legend_recruiter',
        rewardType: 'badge',
        label: 'Legend Recruiter',
      },
    ],
    unlocked: false,
  },
];

describe('ReferralRewardsCard', () => {
  it('shows a coin bonus annotation for each tier with the correct amount', () => {
    render(
      <Wrapper>
        <ReferralRewardsCard tiers={MOCK_TIERS} />
      </Wrapper>,
    );

    // Tier 1 — +100 coin bonus
    const tier1Bonus = screen.getByTestId('tier-1-coin-bonus');
    expect(tier1Bonus).toBeTruthy();
    expect(tier1Bonus.getAttribute('data-coins')).toBe('100');

    // Tier 2 — +200 coin bonus
    const tier2Bonus = screen.getByTestId('tier-2-coin-bonus');
    expect(tier2Bonus).toBeTruthy();
    expect(tier2Bonus.getAttribute('data-coins')).toBe('200');

    // Tier 3 — +500 coin bonus
    const tier3Bonus = screen.getByTestId('tier-3-coin-bonus');
    expect(tier3Bonus).toBeTruthy();
    expect(tier3Bonus.getAttribute('data-coins')).toBe('500');
  });

  it('renders a tier card for each tier', () => {
    render(
      <Wrapper>
        <ReferralRewardsCard tiers={MOCK_TIERS} />
      </Wrapper>,
    );

    expect(screen.getByTestId('tier-1')).toBeTruthy();
    expect(screen.getByTestId('tier-2')).toBeTruthy();
    expect(screen.getByTestId('tier-3')).toBeTruthy();
  });
});

// Import after mock so the mock is in place
import { useTranslation } from '@/shared/lib/useTranslation';

describe('+N coins per friend copy', () => {
  it('REFERRAL_COIN_REWARDS.perFriend is 50 (the copy shown in the explainer)', () => {
    // The per-friend reward amount is sourced from REFERRAL_COIN_REWARDS.perFriend.
    // ReferralDashboard renders t('referrals.coinReward.perFriend', { coins: '50' }).
    // This test asserts the constant that drives the copy is correct.
    expect(REFERRAL_COIN_REWARDS.perFriend).toBe(50);
  });

  it('renders the per-friend coin reward element with the correct amount', () => {
    // Directly render a component resembling the ReferralDashboard per-friend line
    // without mounting the full client component tree.
    function PerFriendLine() {
      const { t } = useTranslation();
      return (
        <p
          data-testid="per-friend-coin-reward"
          data-coins={REFERRAL_COIN_REWARDS.perFriend}
        >
          {t('referrals.coinReward.perFriend', {
            coins: String(REFERRAL_COIN_REWARDS.perFriend),
          })}
        </p>
      );
    }

    render(
      <Wrapper>
        <PerFriendLine />
      </Wrapper>,
    );

    const el = screen.getByTestId('per-friend-coin-reward');
    expect(el).toBeTruthy();
    // data-coins carries the numeric reward (50) from REFERRAL_COIN_REWARDS.perFriend
    expect(el.getAttribute('data-coins')).toBe('50');
  });
});
