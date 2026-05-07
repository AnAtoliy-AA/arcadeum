'use client';
import { YStack, Text } from 'tamagui';
import { RewardTier } from '@arcadeum/ui';
import type { RewardTierItem } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

export function RewardLadder({
  rewards,
  t,
}: {
  rewards: RewardTierItem[];
  t?: PageTranslations;
}) {
  if (!rewards.length) return null;
  const rTitles = ((t?.rewards as Record<string, string>) ?? {}) as Record<
    string,
    string
  >;
  return (
    <YStack gap="$3">
      <Text
        fontSize="$2"
        letterSpacing={2}
        opacity={0.7}
        textTransform="uppercase"
      >
        {rTitles.title ?? 'Reward ladder'}
      </Text>
      <YStack gap="$2">
        {rewards.map((r) => (
          <RewardTier
            key={r.tier}
            tier={r.tier}
            rankFrom={r.rankFrom}
            rankTo={r.rankTo}
            rewardText={
              rTitles[r.tier] ??
              r.rewardLabel
                .replace('rewards.', '')
                .replace(/^./, (c) => c.toUpperCase())
            }
          />
        ))}
      </YStack>
    </YStack>
  );
}
