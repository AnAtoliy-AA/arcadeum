'use client';
import { XStack, YStack, Text } from 'tamagui';
import type { Squad } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

export function SquadStrip({
  squads,
  t,
}: {
  squads: Squad[];
  t?: PageTranslations;
}) {
  if (!squads.length) return null;
  const tt = (t?.squads ?? {}) as { title?: string; members?: string };
  const membersTpl = tt.members ?? '{count} members';
  return (
    <YStack gap="$3">
      <Text
        fontSize="$2"
        letterSpacing={2}
        opacity={0.7}
        textTransform="uppercase"
      >
        {tt.title ?? 'Top squads'}
      </Text>
      <XStack gap="$3" flexWrap="wrap">
        {squads.map((s) => (
          <YStack
            key={s.id}
            flex={1}
            minWidth={180}
            padding="$3"
            gap="$1"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="rgba(255,255,255,0.02)"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text opacity={0.6} letterSpacing={1}>
                #{s.rank}
              </Text>
              <Text fontWeight="700" letterSpacing={1} color="$mythicAccent">
                [{s.tag}]
              </Text>
            </XStack>
            <Text fontWeight="700" numberOfLines={1}>
              {s.name}
            </Text>
            <XStack justifyContent="space-between">
              <Text fontSize="$2" opacity={0.7}>
                {membersTpl.replace('{count}', String(s.memberCount))}
              </Text>
              <Text fontSize="$2" letterSpacing={1}>
                {s.rating.toLocaleString()}
              </Text>
            </XStack>
          </YStack>
        ))}
      </XStack>
    </YStack>
  );
}
