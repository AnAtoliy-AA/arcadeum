'use client';
import { XStack, YStack, Text, View, styled } from 'tamagui';
import Image from 'next/image';
import {
  Avatar,
  RankBadge,
  FormPips,
  TrendPill,
  EnergyBar,
  LiveChip,
} from '@arcadeum/ui';
import type { LeaderboardPlayer } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';

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

const TagPill = styled(XStack, {
  name: 'GameTag',
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: 'rgba(255,255,255,0.02)',
});

export function RankTable({
  rows,
  loading,
  topRating,
  selfId,
  t,
}: {
  rows: LeaderboardPlayer[];
  loading?: boolean;
  topRating?: number;
  selfId?: string;
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
  const liveLabel = (t?.live as string) ?? 'Live';
  const max = topRating ?? rows[0]?.rating ?? 1;

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
          width={240}
          fontSize="$1"
          opacity={0.6}
          textTransform="uppercase"
          $sm={{ display: 'none' }}
        >
          {labels.rating ?? 'Rating'}
        </Text>
        <Text
          width={140}
          fontSize="$1"
          opacity={0.6}
          textTransform="uppercase"
          $sm={{ display: 'none' }}
        >
          {labels.form ?? 'Form'}
        </Text>
        <Text
          width={120}
          fontSize="$1"
          opacity={0.6}
          textTransform="uppercase"
          $md={{ display: 'none' }}
        >
          Tags
        </Text>
        <Text width={72} fontSize="$1" opacity={0.6} textTransform="uppercase">
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
                width={240}
                height={22}
                backgroundColor="rgba(255,255,255,0.06)"
                borderRadius={11}
                $sm={{ display: 'none' }}
              />
              <View
                width={140}
                height={16}
                backgroundColor="rgba(255,255,255,0.04)"
                borderRadius={4}
                $sm={{ display: 'none' }}
              />
              <View
                width={120}
                height={20}
                backgroundColor="rgba(255,255,255,0.04)"
                borderRadius={10}
                $md={{ display: 'none' }}
              />
              <View
                width={72}
                height={20}
                backgroundColor="rgba(255,255,255,0.04)"
                borderRadius={10}
              />
            </Row>
          ))
        : rows.map((p) => (
            <RankRow
              key={p.id}
              player={p}
              liveLabel={liveLabel}
              regionLabels={regionLabels}
              max={max}
              isSelf={!!selfId && p.id === selfId}
            />
          ))}
    </YStack>
  );
}

function RankRow({
  player: p,
  liveLabel,
  regionLabels,
  max,
  isSelf,
}: {
  player: LeaderboardPlayer;
  liveLabel: string;
  regionLabels: Record<string, string>;
  max: number;
  isSelf: boolean;
}) {
  const live = p.isInMatch ?? false;
  const flag = p.countryCode ? regionFlag(p.countryCode) : null;
  const { avatarUrl, badgeUrl, nameColor } = useEquippedCosmetics({
    equippedAvatarId: p.equippedAvatarId,
    equippedBadgeId: p.equippedBadgeId,
    equippedNameColorId: p.equippedNameColorId,
  });
  const nameProps = nameColorRenderProps(nameColor);
  return (
    <Row
      testID={`leaderboard-row-${p.rank}`}
      {...(isSelf ? { 'data-self': 'true' } : {})}
    >
      <View width={56}>
        <RankBadge tier={p.tier as never}>{`#${p.rank}`}</RankBadge>
      </View>
      <YStack flex={1} gap={2}>
        <XStack gap="$2" alignItems="center" flexWrap="wrap">
          <Avatar
            size="sm"
            name={p.name}
            src={avatarUrl ?? p.avatarUrl ?? undefined}
          />
          {flag ? (
            <Text fontSize="$3" aria-label={p.countryCode}>
              {flag}
            </Text>
          ) : null}
          <Text
            fontWeight="700"
            numberOfLines={1}
            {...(nameProps.color ? { color: nameProps.color } : {})}
            {...(nameProps.style ? { style: nameProps.style } : {})}
          >
            {p.name}
          </Text>
          {badgeUrl ? (
            <View width={16} height={16}>
              <Image
                src={badgeUrl}
                alt=""
                width={16}
                height={16}
                data-testid={`leaderboard-row-${p.rank}-badge`}
                unoptimized
              />
            </View>
          ) : null}
          {p.isOnline ? (
            <View
              width={8}
              height={8}
              borderRadius={4}
              backgroundColor="$success"
            />
          ) : null}
          {p.streak && p.streak >= 3 ? (
            <Text fontSize="$2">🔥 {p.streak}</Text>
          ) : null}
          {live ? (
            <View testID="row-live-chip">
              <LiveChip label={liveLabel} />
            </View>
          ) : null}
          {p.elo ? (
            <Text fontSize="$1" opacity={0.5} letterSpacing={1}>
              {p.elo} ELO
            </Text>
          ) : null}
        </XStack>
      </YStack>
      <Text width={80} fontSize="$2" opacity={0.8} numberOfLines={1}>
        {regionLabels[p.region] ?? p.region.toUpperCase()}
      </Text>
      <View width={240} $sm={{ display: 'none' }}>
        <EnergyBar value={p.rating} max={max} />
      </View>
      <View width={140} $sm={{ display: 'none' }}>
        <FormPips results={p.recentForm} max={8} variant="letter" />
      </View>
      <YStack width={120} gap={4} $md={{ display: 'none' }}>
        {(p.gameTags ?? []).slice(0, 2).map((tag) => (
          <TagPill key={tag}>
            <Text fontSize="$1" opacity={0.85}>
              {tag}
            </Text>
          </TagPill>
        ))}
      </YStack>
      <View width={72}>
        <TrendPill rank={p.rank} prevRank={p.prevRank} />
      </View>
    </Row>
  );
}

function regionFlag(code: string): string | null {
  if (code.length !== 2) return null;
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + code.toUpperCase().charCodeAt(0) - 65,
    A + code.toUpperCase().charCodeAt(1) - 65,
  );
}
