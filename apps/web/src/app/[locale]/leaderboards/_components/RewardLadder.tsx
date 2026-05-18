'use client';
import { XStack, YStack, Text } from 'tamagui';
import type { RewardTierItem } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

const TIER_COLORS: Record<string, string> = {
  mythic: '#ec4899',
  diamond: '#22d3ee',
  platinum: '#a78bfa',
  gold: '#facc15',
  silver: '#94a3b8',
  bronze: '#b45309',
};

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
      <XStack gap="$3" flexWrap="wrap">
        {rewards.map((r) => {
          const color = r.color ?? TIER_COLORS[r.tier] ?? '#94a3b8';
          const range =
            r.rankFrom === r.rankTo
              ? `RANK ${r.rankFrom}`
              : `RANK ${r.rankFrom}–${r.rankTo}`;
          const prizeText =
            rTitles[r.tier] ??
            r.rewardLabel
              .replace('rewards.', '')
              .replace(/^./, (c) => c.toUpperCase());
          return (
            <YStack
              key={r.tier}
              flex={1}
              minWidth={150}
              padding="$3"
              gap="$2"
              borderRadius="$3"
              borderWidth={1}
              alignItems="center"
              testID={`reward-card-${r.tier}`}
              style={{
                borderColor: `${color}55`,
                backgroundColor: 'rgba(255,255,255,0.02)',
              }}
            >
              <Text fontSize={28} color={color as never}>
                {r.icon ?? '★'}
              </Text>
              <Text
                fontSize="$1"
                fontWeight="700"
                letterSpacing={2}
                textTransform="uppercase"
                color={color as never}
              >
                {r.tier}
              </Text>
              <Text fontSize="$1" opacity={0.6} letterSpacing={1}>
                {range}
              </Text>
              <Text fontSize="$2" textAlign="center" opacity={0.9}>
                {prizeText}
              </Text>
            </YStack>
          );
        })}
      </XStack>
    </YStack>
  );
}
