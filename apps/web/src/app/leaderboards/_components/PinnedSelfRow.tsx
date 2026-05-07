'use client';
import { XStack, YStack, Text, View } from 'tamagui';
import { RankBadge, FormPips } from '@arcadeum/ui';
import type { LeaderboardPlayer } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

export function PinnedSelfRow({
  player,
  t,
}: {
  player: LeaderboardPlayer;
  t?: PageTranslations;
}) {
  const tt = (t?.self ?? {}) as { pinned?: string; unranked?: string };
  const isAnon = player.id === 'anon';
  return (
    <View
      position="sticky"
      bottom={0}
      width="100%"
      backgroundColor="rgba(15,12,25,0.92)"
      borderTopWidth={1}
      borderColor="$mythicAccent"
      paddingHorizontal="$4"
      paddingVertical="$3"
      style={{ backdropFilter: 'blur(12px)' }}
      testID="leaderboard-self-row"
    >
      <XStack alignItems="center" gap="$3" flexWrap="wrap">
        <Text
          fontSize="$1"
          letterSpacing={2}
          opacity={0.6}
          textTransform="uppercase"
        >
          {tt.pinned ?? 'Your rank'}
        </Text>
        {isAnon ? (
          <Text fontSize="$3" opacity={0.85}>
            {tt.unranked ?? 'Unranked — play 5 ranked games to appear'}
          </Text>
        ) : (
          <>
            <RankBadge tier={player.tier as never}>
              {`#${player.rank}`}
            </RankBadge>
            <Text fontWeight="700">{player.name}</Text>
            <Text fontWeight="700" letterSpacing={1}>
              {player.rating.toLocaleString()}
            </Text>
            <YStack flex={1} alignItems="flex-end" $sm={{ display: 'none' }}>
              <FormPips results={player.recentForm} max={7} />
            </YStack>
          </>
        )}
      </XStack>
    </View>
  );
}
