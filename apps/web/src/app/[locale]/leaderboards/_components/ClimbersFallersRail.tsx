'use client';
import { XStack, YStack, Text } from 'tamagui';
import { DeltaChip } from '@arcadeum/ui';
import type { ClimberFaller } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

export function ClimbersFallersRail({
  climbers,
  fallers,
  t,
}: {
  climbers: ClimberFaller[];
  fallers: ClimberFaller[];
  t?: PageTranslations;
}) {
  return (
    <XStack gap="$4" flexWrap="wrap">
      <Column
        title={(t?.climbers as { title?: string })?.title ?? 'Top climbers'}
        rows={climbers}
        accent="$success"
      />
      <Column
        title={(t?.fallers as { title?: string })?.title ?? 'Biggest drops'}
        rows={fallers}
        accent="$danger"
      />
    </XStack>
  );
}

function Column({
  title,
  rows,
  accent,
}: {
  title: string;
  rows: ClimberFaller[];
  accent: '$success' | '$danger';
}) {
  return (
    <YStack
      flex={1}
      minWidth={280}
      gap="$3"
      padding="$4"
      borderRadius="$4"
      borderWidth={1}
      borderTopWidth={2}
      borderTopColor={accent}
      borderColor="$borderColor"
      backgroundColor="rgba(255,255,255,0.02)"
    >
      <Text
        fontSize="$2"
        letterSpacing={2}
        opacity={0.7}
        textTransform="uppercase"
      >
        {title}
      </Text>
      <YStack gap="$2">
        {rows.map(({ player, fromRank, toRank }) => (
          <XStack
            key={player.id}
            alignItems="center"
            justifyContent="space-between"
            gap="$3"
          >
            <Text fontWeight="600" numberOfLines={1} flex={1}>
              {player.name}
            </Text>
            <DeltaChip from={fromRank} to={toRank} />
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
