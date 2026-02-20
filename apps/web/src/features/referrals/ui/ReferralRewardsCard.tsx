'use client';

import { GlassCard } from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { ReferralTier } from '../types';
import {
  CardTitle,
  TierList,
  TierCard,
  TierIcon,
  TierContent,
  TierTitle,
  TierDescription,
  TierBadge,
} from './styles';

interface ReferralRewardsCardProps {
  tiers: ReferralTier[];
}

function getRewardIcon(rewardId: string, unlocked: boolean): string {
  if (!unlocked) return '🔒';
  if (rewardId.startsWith('badge_')) return '🏷️';
  if (rewardId.startsWith('early_access_')) return '🔓';
  return '🎁';
}

export function ReferralRewardsCard({ tiers }: ReferralRewardsCardProps) {
  const { t } = useTranslation();

  return (
    <GlassCard>
      <CardTitle>🎁 {t('referrals.rewardsCard.title')}</CardTitle>
      <TierList>
        {tiers.map((tier) => (
          <TierCard
            key={tier.tier}
            $unlocked={tier.unlocked}
            data-testid={`tier-${tier.tier}`}
            data-unlocked={tier.unlocked}
          >
            <TierIcon $unlocked={tier.unlocked}>
              {getRewardIcon(tier.rewards[0]?.rewardId ?? '', tier.unlocked)}
            </TierIcon>
            <TierContent>
              <TierTitle>
                {t('referrals.rewardsCard.tierTitle', {
                  count: String(tier.requiredInvites),
                })}
              </TierTitle>
              {tier.rewards.map((reward) => (
                <TierDescription key={reward.rewardId}>
                  {reward.label}
                </TierDescription>
              ))}
              <TierBadge $unlocked={tier.unlocked}>
                {tier.unlocked
                  ? t('referrals.rewardsCard.unlocked')
                  : t('referrals.rewardsCard.locked')}
              </TierBadge>
            </TierContent>
          </TierCard>
        ))}
      </TierList>
    </GlassCard>
  );
}
