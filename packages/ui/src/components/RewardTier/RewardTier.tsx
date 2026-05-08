import { XStack, YStack, Text } from 'tamagui';
import { RankBadge, type RankBadgeTier } from '../RankBadge/RankBadge';

export type RewardTierProps = {
  tier: RankBadgeTier;
  rankFrom: number;
  rankTo: number;
  rewardText: string;
};

export function RewardTier({
  tier,
  rankFrom,
  rankTo,
  rewardText,
}: RewardTierProps) {
  const rangeLabel =
    rankFrom === rankTo ? `#${rankFrom}` : `#${rankFrom}–${rankTo}`;
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal="$4"
      paddingVertical="$3"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="rgba(255,255,255,0.02)"
      gap="$3"
    >
      <XStack alignItems="center" gap="$3">
        <RankBadge tier={tier}>{rangeLabel}</RankBadge>
        <Text fontSize="$3" fontWeight="600" textTransform="capitalize">
          {tier}
        </Text>
      </XStack>
      <YStack flex={1} alignItems="flex-end">
        <Text fontSize="$2" opacity={0.85} textAlign="right">
          {rewardText}
        </Text>
      </YStack>
    </XStack>
  );
}
