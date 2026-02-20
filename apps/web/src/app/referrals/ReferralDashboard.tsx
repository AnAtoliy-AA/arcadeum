'use client';

import { useReferralStats } from '@/features/referrals/hooks/useReferralStats';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { LoadingState, EmptyState, CosmeticBadge } from '@/shared/ui';
import { ReferralShareCard } from '@/features/referrals/ui/ReferralShareCard';
import { ReferralProgressCard } from '@/features/referrals/ui/ReferralProgressCard';
import { ReferralRewardsCard } from '@/features/referrals/ui/ReferralRewardsCard';
import {
  DashboardContainer,
  DashboardTitle,
  DashboardSubtitle,
  BadgesRowContainer,
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

export function ReferralDashboard() {
  const { t } = useTranslation();
  const { snapshot } = useSessionTokens();
  const isAuthenticated = !!snapshot.accessToken;
  const { data, isLoading, error } = useReferralStats();

  if (!isAuthenticated) {
    return (
      <DashboardContainer>
        <EmptyState message={t('referrals.unauthenticated.title')} icon="🔒" />
      </DashboardContainer>
    );
  }

  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingState message={t('referrals.loading')} />
      </DashboardContainer>
    );
  }

  if (error || !data) {
    return (
      <DashboardContainer>
        <EmptyState message={t('referrals.error.title')} icon="⚠️" />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer data-testid="referral-dashboard">
      <div>
        <DashboardTitle>{t('referrals.dashboard.title')}</DashboardTitle>
        <DashboardSubtitle>
          {t('referrals.dashboard.subtitle')}
        </DashboardSubtitle>
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
