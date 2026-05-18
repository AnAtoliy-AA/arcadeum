'use client';

import React from 'react';
import { useReferralStats } from '@/features/referrals/hooks/useReferralStats';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { LoadingState, EmptyState, CosmeticBadge } from '@/shared/ui';
import { ReferralShareCard } from '@/features/referrals/ui/ReferralShareCard';
import { ReferralProgressCard } from '@/features/referrals/ui/ReferralProgressCard';
import { ReferralRewardsCard } from '@/features/referrals/ui/ReferralRewardsCard';
import { REFERRAL_COIN_REWARDS } from '@/features/referrals/lib/coin-rewards';
import {
  DashboardContainer,
  DashboardTitle,
  DashboardSubtitle,
  BadgesRowContainer,
  referralsStyles,
} from '@/features/referrals/ui/styles';

const BadgesRow = ({ badgeIds }: { badgeIds: string[] }) => {
  if (badgeIds.length === 0) return null;
  return (
    <BadgesRowContainer>
      {badgeIds.map((id) => (
        <CosmeticBadge key={id} badgeId={id} />
      ))}
    </BadgesRowContainer>
  );
};

export default function ReferralDashboard() {
  const { t } = useTranslation();
  const { snapshot, hydrated } = useSessionTokens();
  const isAuthenticated = !!snapshot.accessToken;
  const { data, isLoading, error } = useReferralStats();

  let content: React.ReactNode;

  if (!hydrated || (isLoading && isAuthenticated)) {
    content = (
      <DashboardContainer data-testid="referral-dashboard">
        <LoadingState message={t('referrals.loading')} />
      </DashboardContainer>
    );
  } else if (!isAuthenticated) {
    content = (
      <DashboardContainer data-testid="referral-dashboard">
        <EmptyState message={t('referrals.unauthenticated.title')} icon="🔒" />
      </DashboardContainer>
    );
  } else if (error || !data) {
    content = (
      <DashboardContainer data-testid="referral-dashboard">
        <EmptyState message={t('referrals.error.title')} icon="⚠️" />
      </DashboardContainer>
    );
  } else {
    content = (
      <DashboardContainer data-testid="referral-dashboard">
        <div>
          <DashboardTitle>{t('referrals.dashboard.title')}</DashboardTitle>
          <DashboardSubtitle>
            {t('referrals.dashboard.subtitle')}
          </DashboardSubtitle>
          <p
            data-testid="per-friend-coin-reward"
            data-coins={REFERRAL_COIN_REWARDS.perFriend}
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#4ade80',
              margin: 0,
            }}
          >
            {t('referrals.coinReward.perFriend', {
              coins: String(REFERRAL_COIN_REWARDS.perFriend),
            })}
          </p>
        </div>
        <BadgesRow
          badgeIds={data.rewards
            .filter((r) => r.rewardType === 'badge')
            .map((r) => r.rewardId)}
        />
        <ReferralShareCard referralCode={data.referralCode} />
        <ReferralProgressCard stats={data} />
        <ReferralRewardsCard tiers={data.tiers} />
      </DashboardContainer>
    );
  }

  return (
    <>
      <style>{referralsStyles}</style>
      {content}
    </>
  );
}
