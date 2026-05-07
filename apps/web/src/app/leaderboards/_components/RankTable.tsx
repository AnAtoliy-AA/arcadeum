'use client';
import { XStack, YStack, Text, View, styled } from 'tamagui';
import { RankBadge, FormPips } from '@arcadeum/ui';
import type { LeaderboardPlayer } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

const Row = styled(XStack, {
  name: 'LbRow',
  alignItems: 'center',
  paddingHorizontal: '$3',
  paddingVertical: '$3',
  borderBottomWidth: 1,
  borderColor: '$borderColor',
  gap: '$3',
  hoverStyle: { backgroundColor: 'rgba(255,255,255,0.03)' },
});

const HeaderRow = styled(XStack, {
  name: 'LbHeader',
  alignItems: 'center',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderBottomWidth: 1,
  borderColor: '$borderColor',
  gap: '$3',
});

function trendArrow(rank: number, prev?: number) {
  if (prev == null)
    return { glyph: '·', color: '$textSecondary' as const, n: 0 };
  if (prev > rank)
    return { glyph: '▲', color: '$success' as const, n: prev - rank };
  if (prev < rank)
    return { glyph: '▼', color: '$danger' as const, n: rank - prev };
  return { glyph: '·', color: '$textSecondary' as const, n: 0 };
}

export function RankTable({
  rows,
  loading,
  t,
}: {
  rows: LeaderboardPlayer[];
  loading?: boolean;
  t?: PageTranslations;
}) {
  const labels = ((t?.table as Record<string, string>) ?? {}) as Record<
    string,
    string
  >;
  const regionLabels = ((t?.regions as Record<string, string>) ?? {}) as Record<
    string,
    string
  >;
  return (
    <YStack
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="rgba(255,255,255,0.02)"
      overflow="hidden"
      testID="leaderboard-table"
    >
      <HeaderRow>
        <Text width={56} fontSize="$1" opacity={0.6} textTransform="uppercase">
          {labels.rank ?? '#'}
        </Text>
        <Text flex={1} fontSize="$1" opacity={0.6} textTransform="uppercase">
          {labels.player ?? 'Player'}
        </Text>
        <Text width={80} fontSize="$1" opacity={0.6} textTransform="uppercase">
          {labels.region ?? 'Region'}
        </Text>
        <Text
          width={80}
          textAlign="right"
          fontSize="$1"
          opacity={0.6}
          textTransform="uppercase"
        >
          {labels.rating ?? 'Rating'}
        </Text>
        <Text
          width={96}
          textAlign="right"
          fontSize="$1"
          opacity={0.6}
          textTransform="uppercase"
          $sm={{ display: 'none' }}
        >
          {labels.record ?? 'W–L–D'}
        </Text>
        <Text
          width={72}
          textAlign="right"
          fontSize="$1"
          opacity={0.6}
          textTransform="uppercase"
          $sm={{ display: 'none' }}
        >
          {labels.winrate ?? 'WR'}
        </Text>
        <Text
          width={120}
          fontSize="$1"
          opacity={0.6}
          textTransform="uppercase"
          $sm={{ display: 'none' }}
        >
          {labels.form ?? 'Form'}
        </Text>
        <Text width={56} fontSize="$1" opacity={0.6} textTransform="uppercase">
          {labels.trend ?? 'Trend'}
        </Text>
      </HeaderRow>

      {loading
        ? Array.from({ length: 8 }).map((_, i) => (
            <Row key={`sk_${i}`} minHeight={56}>
              <View width={56} alignItems="flex-start">
                <View
                  width={36}
                  height={22}
                  backgroundColor="rgba(255,255,255,0.06)"
                  borderRadius={4}
                />
              </View>
              <YStack flex={1} gap={4}>
                <View
                  width="60%"
                  height={16}
                  backgroundColor="rgba(255,255,255,0.06)"
                  borderRadius={4}
                />
              </YStack>
              <View
                width={80}
                height={14}
                backgroundColor="rgba(255,255,255,0.04)"
                borderRadius={4}
              />
              <View
                width={80}
                height={18}
                backgroundColor="rgba(255,255,255,0.06)"
                borderRadius={4}
              />
              <View
                width={96}
                height={14}
                backgroundColor="rgba(255,255,255,0.04)"
                borderRadius={4}
                $sm={{ display: 'none' }}
              />
              <View
                width={72}
                height={14}
                backgroundColor="rgba(255,255,255,0.04)"
                borderRadius={4}
                $sm={{ display: 'none' }}
              />
              <View
                width={120}
                height={14}
                backgroundColor="rgba(255,255,255,0.04)"
                borderRadius={4}
                $sm={{ display: 'none' }}
              />
              <View
                width={56}
                height={14}
                backgroundColor="rgba(255,255,255,0.04)"
                borderRadius={4}
              />
            </Row>
          ))
        : rows.map((p) => {
            const trend = trendArrow(p.rank, p.prevRank);
            return (
              <Row key={p.id} testID={`leaderboard-row-${p.rank}`}>
                <View width={56}>
                  <RankBadge tier={p.tier as never}>{`#${p.rank}`}</RankBadge>
                </View>
                <YStack flex={1} gap={2}>
                  <XStack gap="$2" alignItems="center">
                    <Text fontWeight="700" numberOfLines={1}>
                      {p.name}
                    </Text>
                    {p.isOnline ? (
                      <View
                        width={8}
                        height={8}
                        borderRadius={4}
                        backgroundColor="$success"
                      />
                    ) : null}
                    {p.isFriend ? (
                      <Text fontSize="$1" opacity={0.6}>
                        · friend
                      </Text>
                    ) : null}
                  </XStack>
                </YStack>
                <Text width={80} fontSize="$2" opacity={0.8} numberOfLines={1}>
                  {regionLabels[p.region] ?? p.region.toUpperCase()}
                </Text>
                <Text
                  width={80}
                  textAlign="right"
                  fontWeight="700"
                  letterSpacing={1}
                >
                  {p.rating.toLocaleString()}
                </Text>
                <Text
                  width={96}
                  textAlign="right"
                  fontSize="$2"
                  letterSpacing={1}
                  opacity={0.85}
                  $sm={{ display: 'none' }}
                >
                  {p.wins}–{p.losses}–{p.draws}
                </Text>
                <Text
                  width={72}
                  textAlign="right"
                  fontSize="$2"
                  letterSpacing={1}
                  $sm={{ display: 'none' }}
                >
                  {Math.round(p.winrate * 100)}%
                </Text>
                <View width={120} $sm={{ display: 'none' }}>
                  <FormPips results={p.recentForm} max={7} />
                </View>
                <XStack width={56} gap={4} alignItems="center">
                  <Text color={trend.color}>{trend.glyph}</Text>
                  {trend.n > 0 ? (
                    <Text fontSize="$2" letterSpacing={1} color={trend.color}>
                      {trend.n}
                    </Text>
                  ) : null}
                </XStack>
              </Row>
            );
          })}
    </YStack>
  );
}
