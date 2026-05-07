import { XStack, YStack, Text, View, styled } from 'tamagui';
import { Button } from '../Button/Button';
import { RankBadge } from '../RankBadge/RankBadge';

export type MythicSpotlightProps = {
  rank: number;
  name: string;
  rating: number;
  ratingDelta: number;
  streak: number;
  avatarUrl?: string;
  region?: string;
  streakLabel?: string;
  leadLabel?: string;
  ctaLabel?: string;
  onPressCta?: () => void;
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

const Avatar = styled(View, {
  name: 'MythicAvatar',
  width: 96,
  height: 96,
  borderRadius: 48,
  borderWidth: 2,
  borderColor: '$mythicAccent',
  backgroundColor: 'rgba(236,72,153,0.12)',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
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

export function MythicSpotlight({
  rank,
  name,
  rating,
  ratingDelta,
  streak,
  avatarUrl,
  region,
  streakLabel = `${streak}-game streak`,
  leadLabel = `+${ratingDelta} over #2`,
  ctaLabel = 'View profile',
  onPressCta,
}: MythicSpotlightProps) {
  const initial = name.charAt(0).toUpperCase();
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
        <Avatar>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Text
              fontSize={48}
              fontWeight="800"
              color="$mythicAccent"
            >
              {initial}
            </Text>
          )}
        </Avatar>
        <YStack gap="$2" flex={1} minWidth={240}>
          <XStack gap="$2" alignItems="center">
            <RankBadge tier="mythic">{`#${rank}`}</RankBadge>
            <Text
              fontSize="$2"
              letterSpacing={2}
              fontWeight="700"
              color="$mythicAccent"
            >
              MYTHIC
            </Text>
            {region ? (
              <Text fontSize="$2" opacity={0.6} textTransform="uppercase">
                · {region}
              </Text>
            ) : null}
          </XStack>
          <Text fontSize="$9" fontWeight="800" letterSpacing={-0.5}>
            {name}
          </Text>
          <XStack gap="$4" flexWrap="wrap">
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
        {onPressCta ? (
          <Button
            variant="ghost"
            onClick={onPressCta}
            aria-label={ctaLabel}
            data-testid="leaderboard-mythic-spotlight-cta"
            style={{
              borderColor: 'var(--mythicAccent)',
              backgroundColor: 'rgba(236,72,153,0.12)',
              color: 'var(--mythicAccent)',
            }}
          >
            {ctaLabel}
          </Button>
        ) : null}
      </XStack>
    </Card>
  );
}
