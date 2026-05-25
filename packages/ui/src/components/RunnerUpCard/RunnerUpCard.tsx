import type { ReactNode } from 'react';
import { XStack, YStack, Text, View, styled } from 'tamagui';

export type RunnerUpCardProps = {
  place: 2 | 3;
  name: string;
  rating: number;
  wins: number;
  winrate: number;
  region?: string;
  placeLabel?: string;
  testID?: string;
  /** Optional avatar slot — designed for `<EquippedPlayerAvatar size="sm" />`. */
  avatar?: ReactNode;
};

const MEDAL_BY_PLACE: Record<2 | 3, string> = { 2: '🥈', 3: '🥉' };

const Card = styled(YStack, {
  name: 'RunnerUpCard',
  padding: '$4',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: 'rgba(255,255,255,0.02)',
  gap: '$2',
  minWidth: 200,
});

export function RunnerUpCard({
  place,
  name,
  rating,
  wins,
  winrate,
  region,
  placeLabel,
  testID,
  avatar,
}: RunnerUpCardProps) {
  return (
    <Card testID={testID ?? `runner-up-${place}`}>
      <XStack alignItems="center" gap="$2">
        {avatar}
        <Text fontSize="$6">{MEDAL_BY_PLACE[place]}</Text>
        <Text
          fontSize="$1"
          letterSpacing={2}
          opacity={0.7}
          textTransform="uppercase"
        >
          {placeLabel ?? (place === 2 ? 'Runner · Up' : '3rd · Place')}
        </Text>
      </XStack>
      <Text fontSize="$5" fontWeight="800" numberOfLines={1}>
        {name}
      </Text>
      <XStack gap="$3" flexWrap="wrap" alignItems="center">
        <Text fontSize="$3" fontWeight="700" letterSpacing={1}>
          {rating.toLocaleString()}
        </Text>
        <View width={1} height={12} backgroundColor="$borderColor" />
        <Text fontSize="$2" opacity={0.8}>
          {wins} W
        </Text>
        <Text fontSize="$2" opacity={0.8}>
          {Math.round(winrate * 100)}% WR
        </Text>
        {region ? (
          <Text fontSize="$2" opacity={0.6}>
            · {region}
          </Text>
        ) : null}
      </XStack>
    </Card>
  );
}
