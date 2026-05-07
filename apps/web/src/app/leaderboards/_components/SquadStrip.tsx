'use client';
import { XStack, YStack, Text, View } from 'tamagui';
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
    <YStack
      gap="$3"
      padding="$4"
      borderRadius="$4"
      borderWidth={1}
      borderTopWidth={2}
      borderTopColor="$info"
      borderColor="$borderColor"
      backgroundColor="rgba(255,255,255,0.02)"
      flex={1}
      minWidth={280}
    >
      <Text
        fontSize="$2"
        letterSpacing={2}
        opacity={0.7}
        textTransform="uppercase"
      >
        {tt.title ?? 'Top squads'}
      </Text>
      <YStack gap="$2">
        {squads.map((s) => (
          <XStack
            key={s.id}
            alignItems="center"
            justifyContent="space-between"
            gap="$2"
            paddingHorizontal={s.isYou ? '$2' : 0}
            paddingVertical={s.isYou ? '$1' : 0}
            borderRadius={s.isYou ? '$2' : 0}
            backgroundColor={s.isYou ? 'rgba(236,72,153,0.08)' : 'transparent'}
          >
            <XStack alignItems="center" gap="$2" flex={1}>
              {s.isYou ? (
                <View
                  paddingHorizontal={6}
                  paddingVertical={1}
                  borderRadius={999}
                  backgroundColor="$mythicAccent"
                >
                  <Text fontSize={9} fontWeight="800" color="#0f0c19">
                    YOU
                  </Text>
                </View>
              ) : null}
              <Text fontWeight="700" letterSpacing={1} color="$mythicAccent">
                [{s.tag}]
              </Text>
              <Text fontWeight="600" numberOfLines={1} flex={1}>
                {s.name}
              </Text>
            </XStack>
            <Text fontSize="$2" opacity={0.7}>
              {membersTpl.replace('{count}', String(s.memberCount))}
            </Text>
            <Text fontSize="$2" letterSpacing={1} fontWeight="700">
              #{s.rank}
            </Text>
            <Text fontSize="$2" letterSpacing={1} opacity={0.85}>
              {s.rating.toLocaleString()}
            </Text>
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
