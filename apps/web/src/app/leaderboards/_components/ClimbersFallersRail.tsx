'use client';
import { XStack, YStack, Text } from 'tamagui';
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
        positive
      />
      <Column
        title={(t?.fallers as { title?: string })?.title ?? 'Biggest drops'}
        rows={fallers}
        positive={false}
      />
    </XStack>
  );
}

function Column({
  title,
  rows,
  positive,
}: {
  title: string;
  rows: ClimberFaller[];
  positive: boolean;
}) {
  return (
    <YStack
      flex={1}
      minWidth={280}
      gap="$3"
      padding="$4"
      borderRadius="$4"
      borderWidth={1}
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
        {rows.map(({ player, delta }) => (
          <XStack
            key={player.id}
            alignItems="center"
            justifyContent="space-between"
            gap="$3"
          >
            <XStack gap="$2" alignItems="center" flex={1}>
              <Text opacity={0.6} letterSpacing={1}>
                #{player.rank}
              </Text>
              <Text fontWeight="600" numberOfLines={1}>
                {player.name}
              </Text>
            </XStack>
            <Text
              fontWeight="700"
              letterSpacing={1}
              color={positive ? '$success' : '$danger'}
            >
              {positive ? '▲' : '▼'} {Math.abs(delta)}
            </Text>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
