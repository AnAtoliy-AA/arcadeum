import type { ReactNode } from 'react';
import { XStack, YStack, Text, View, styled } from 'tamagui';
import { Button } from '../Button/Button';
import { RankBadge } from '../RankBadge/RankBadge';
import { MythicPortrait } from '../MythicPortrait/MythicPortrait';
import { FormPips, type FormResult } from '../FormPips/FormPips';

export type MythicSpotlightProps = {
  rank: number;
  name: string;
  rating: number;
  ratingDelta: number;
  streak: number;
  region?: string;
  recentForm?: FormResult[];
  streakLabel?: string;
  leadLabel?: string;
  recentLabel?: string;
  challengeLabel?: string;
  watchLabel?: string;
  followLabel?: string;
  /** Rich portrait slot — when provided, replaces the default initials
   *  monogram. Designed for `<EquippedPlayerAvatar size="card" />`. */
  portrait?: ReactNode;
  onChallenge?: () => void;
  onWatch?: () => void;
  onFollow?: () => void;
};

const Glow = styled(View, {
  name: 'MythicGlow',
  position: 'absolute',
  top: -80,
  left: -80,
  right: -80,
  bottom: -80,
  pointerEvents: 'none',
});

const Card = styled(YStack, {
  name: 'MythicCard',
  position: 'relative',
  padding: '$5',
  borderRadius: '$5',
  borderWidth: 1,
  borderColor: 'rgba(236,72,153,0.4)',
  backgroundColor: 'rgba(15,12,25,0.7)',
  overflow: 'hidden',
  gap: '$4',
});

const StatTile = styled(YStack, {
  name: 'MythicStatTile',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  borderRadius: '$2',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: 'rgba(255,255,255,0.02)',
  gap: 2,
  minWidth: 96,
});

export function MythicSpotlight({
  rank,
  name,
  rating,
  ratingDelta,
  streak,
  region,
  recentForm = [],
  streakLabel = `${streak}-game streak`,
  leadLabel = `+${ratingDelta} over #2`,
  recentLabel = 'Last 12 matches',
  challengeLabel = '⚔ Challenge',
  watchLabel = '▶ Watch replay',
  followLabel = 'Follow',
  portrait,
  onChallenge,
  onWatch,
  onFollow,
}: MythicSpotlightProps) {
  return (
    <Card testID="leaderboard-mythic-spotlight">
      <Glow
        style={{
          background:
            'radial-gradient(closest-side, rgba(236,72,153,0.35), rgba(236,72,153,0))',
          filter: 'blur(40px)',
        }}
      />
      <XStack alignItems="center" gap="$5" flexWrap="wrap">
        {portrait ?? <MythicPortrait monogram={name} />}
        <YStack gap="$2" flex={1} minWidth={240}>
          <XStack gap="$2" alignItems="center" flexWrap="wrap">
            <RankBadge tier="mythic">{`#${rank}`}</RankBadge>
            <Text
              fontSize="$2"
              letterSpacing={2}
              fontWeight="700"
              color="$mythicAccent"
            >
              MYTHIC
            </Text>
            <XStack
              alignItems="center"
              gap={4}
              paddingHorizontal={8}
              paddingVertical={2}
              borderRadius={999}
              borderWidth={1}
              borderColor="rgba(251,146,60,0.4)"
              backgroundColor="rgba(251,146,60,0.12)"
            >
              <Text fontSize="$2">🔥</Text>
              <Text fontSize="$2" fontWeight="700" color="#fb923c">
                {streak}
              </Text>
            </XStack>
            {region ? (
              <Text fontSize="$2" opacity={0.6}>
                · {region}
              </Text>
            ) : null}
          </XStack>
          <Text fontSize="$9" fontWeight="800" letterSpacing={-0.5}>
            {name}
          </Text>
          <XStack gap="$3" flexWrap="wrap" alignItems="center">
            <Text fontSize="$5" fontWeight="700" letterSpacing={1}>
              {rating.toLocaleString()}
            </Text>
            <Text fontSize="$3" opacity={0.75}>
              {leadLabel}
            </Text>
            <Text fontSize="$3" opacity={0.75}>
              · {streakLabel}
            </Text>
          </XStack>
        </YStack>
      </XStack>

      {recentForm.length > 0 ? (
        <YStack gap="$2">
          <Text
            fontSize="$1"
            letterSpacing={2}
            opacity={0.6}
            textTransform="uppercase"
          >
            {recentLabel}
          </Text>
          <FormPips results={recentForm} max={12} variant="letter" />
        </YStack>
      ) : null}

      <XStack gap="$3" flexWrap="wrap">
        <StatTile>
          <Text fontSize="$1" opacity={0.6} textTransform="uppercase">
            Rating
          </Text>
          <Text fontSize="$4" fontWeight="700" letterSpacing={1}>
            {rating.toLocaleString()}
          </Text>
        </StatTile>
        <StatTile>
          <Text fontSize="$1" opacity={0.6} textTransform="uppercase">
            Streak
          </Text>
          <Text fontSize="$4" fontWeight="700" letterSpacing={1}>
            {streak}
          </Text>
        </StatTile>
        <StatTile>
          <Text fontSize="$1" opacity={0.6} textTransform="uppercase">
            Lead
          </Text>
          <Text fontSize="$4" fontWeight="700" letterSpacing={1}>
            +{ratingDelta}
          </Text>
        </StatTile>
      </XStack>

      <XStack gap="$3" flexWrap="wrap">
        {onChallenge ? (
          <Button
            variant="ghost"
            onClick={onChallenge}
            data-testid="mythic-challenge"
            aria-label={challengeLabel}
            style={{
              borderColor: 'var(--mythicAccent)',
              backgroundColor: 'rgba(236,72,153,0.18)',
              color: 'var(--mythicAccent)',
            }}
          >
            {challengeLabel}
          </Button>
        ) : null}
        {onWatch ? (
          <Button
            variant="ghost"
            onClick={onWatch}
            data-testid="mythic-watch"
            aria-label={watchLabel}
          >
            {watchLabel}
          </Button>
        ) : null}
        {onFollow ? (
          <Button
            variant="ghost"
            onClick={onFollow}
            data-testid="mythic-follow"
            aria-label={followLabel}
          >
            {followLabel}
          </Button>
        ) : null}
      </XStack>
    </Card>
  );
}
