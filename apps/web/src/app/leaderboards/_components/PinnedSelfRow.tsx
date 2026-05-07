'use client';
import { XStack, YStack, Text, View } from 'tamagui';
import { RankBadge, FormPips, EnergyBar, Button } from '@arcadeum/ui';
import type { LeaderboardPlayer } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

export function PinnedSelfRow({
  player,
  topRating,
  onShare,
  t,
}: {
  player: LeaderboardPlayer;
  topRating?: number;
  onShare?: () => void;
  t?: PageTranslations;
}) {
  const tt = (t?.self ?? {}) as {
    pinned?: string;
    unranked?: string;
    share?: string;
  };
  const isAnon = player.id === 'anon';
  const max = topRating ?? player.rating;
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
      style={{
        backdropFilter: 'blur(12px)',
        boxShadow: '0 -16px 32px -8px rgba(236,72,153,0.35)',
      }}
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
          <Text fontSize="$3" opacity={0.85} flex={1}>
            {tt.unranked ?? 'Unranked — play 5 ranked games to appear'}
          </Text>
        ) : (
          <>
            <RankBadge tier={player.tier as never}>
              {`#${player.rank}`}
            </RankBadge>
            <Text fontWeight="700">{player.name}</Text>
            <View flex={1} minWidth={160} maxWidth={320}>
              <EnergyBar value={player.rating} max={max} />
            </View>
            <YStack alignItems="flex-end" $sm={{ display: 'none' }}>
              <FormPips results={player.recentForm} max={8} variant="letter" />
            </YStack>
          </>
        )}
        {onShare && !isAnon ? (
          <Button
            variant="ghost"
            onClick={onShare}
            data-testid="self-share-cta"
            aria-label={tt.share ?? 'Share'}
          >
            ⤴ {tt.share ?? 'Share'}
          </Button>
        ) : null}
      </XStack>
    </View>
  );
}
