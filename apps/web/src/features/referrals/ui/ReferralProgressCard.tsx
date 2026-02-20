'use client';

import { GlassCard } from '@/shared/ui';
import { ProgressBar } from '@/shared/ui/Progress/Progress';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { ReferralStats } from '../types';
import {
  CardTitle,
  ProgressSection,
  ProgressLabel,
  ProgressCount,
  ProgressTarget,
} from './styles';

interface ReferralProgressCardProps {
  stats: ReferralStats;
}

export function ReferralProgressCard({ stats }: ReferralProgressCardProps) {
  const { t } = useTranslation();

  const { totalReferrals, nextTier } = stats;
  const target = nextTier ? nextTier.requiredInvites : totalReferrals;
  const progressValue = target > 0 ? (totalReferrals / target) * 100 : 100;

  return (
    <GlassCard>
      <CardTitle>📊 {t('referrals.progressCard.title')}</CardTitle>
      <ProgressSection>
        <ProgressLabel>
          <ProgressCount data-testid="referral-count">
            {totalReferrals}
          </ProgressCount>
          {nextTier && (
            <ProgressTarget>
              {t('referrals.progressCard.nextAt', {
                count: String(nextTier.requiredInvites),
              })}
            </ProgressTarget>
          )}
          {!nextTier && (
            <ProgressTarget>
              {t('referrals.progressCard.allUnlocked')}
            </ProgressTarget>
          )}
        </ProgressLabel>
        <ProgressBar value={Math.min(progressValue, 100)} height={12} animate />
        <ProgressLabel>
          <span>{t('referrals.progressCard.friendsInvited')}</span>
          {nextTier && (
            <span>
              {t('referrals.progressCard.remaining', {
                count: String(nextTier.remaining),
              })}
            </span>
          )}
        </ProgressLabel>
      </ProgressSection>
    </GlassCard>
  );
}
