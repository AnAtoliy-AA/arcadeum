'use client';
import { XStack, YStack, Text, View } from 'tamagui';
import type { RegionDistribution } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

const COLORS: Record<string, string> = {
  na: '#22d3ee',
  eu: '#a78bfa',
  sa: '#facc15',
  asia: '#ec4899',
  oceania: '#34d399',
  africa: '#f97316',
  me: '#94a3b8',
};

export function RegionStrip({
  regions,
  t,
}: {
  regions: RegionDistribution;
  t?: PageTranslations;
}) {
  if (!regions.length) return null;
  const tRegions = (t?.regions ?? {}) as Record<string, string | undefined>;
  const title = tRegions.title ?? 'By region';
  return (
    <YStack gap="$3">
      <Text
        fontSize="$2"
        letterSpacing={2}
        opacity={0.7}
        textTransform="uppercase"
      >
        {title}
      </Text>
      <XStack
        height={14}
        borderRadius={7}
        overflow="hidden"
        borderWidth={1}
        borderColor="$borderColor"
      >
        {regions.map((r) => (
          <View
            key={r.region}
            backgroundColor={COLORS[r.region] ?? '#94a3b8'}
            width={`${r.share * 100}%`}
          />
        ))}
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        {regions.map((r) => (
          <XStack key={r.region} alignItems="center" gap="$2">
            <View
              width={10}
              height={10}
              borderRadius={5}
              backgroundColor={COLORS[r.region] ?? '#94a3b8'}
            />
            <Text fontSize="$2" opacity={0.85}>
              {tRegions[r.region] ?? r.region.toUpperCase()}
            </Text>
            <Text fontSize="$2" opacity={0.6} letterSpacing={1}>
              {Math.round(r.share * 100)}%
            </Text>
          </XStack>
        ))}
      </XStack>
    </YStack>
  );
}
