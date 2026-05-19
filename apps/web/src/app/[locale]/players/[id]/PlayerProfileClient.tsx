'use client';
import { useRouter } from 'next/navigation';
import {
  PageLayout,
  Container,
  YStack,
  XStack,
  Button,
  RankBadge,
  FormPips,
  EnergyBar,
  EmptyState,
  Avatar,
} from '@arcadeum/ui';
import { Text, View } from 'tamagui';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import type { PlayerProfile } from '@/entities/leaderboard/model/types';
import { getPlayer } from '@/shared/api/leaderboard';
import { useQuery } from '@/shared/hooks/useQuery';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';

export default function PlayerProfileClient({
  id,
  t,
}: {
  id: string;
  t?: PageTranslations;
}) {
  const router = useRouter();
  const {
    data: profile,
    isLoading: loading,
    error,
  } = useQuery<PlayerProfile | null>({
    queryKey: ['player', id],
    queryFn: () => getPlayer(id),
  });
  const missing = !!error || (!loading && !profile);

  const profileT = (t?.profile ?? {}) as Record<string, string | undefined>;
  const eyebrow = profileT.eyebrow ?? 'Player';
  const backLabel = profileT.back ?? 'Back to leaderboard';
  const placeholder =
    profileT.placeholder ??
    'Full profile with rating history, recent matches, and squad info is coming soon.';

  return (
    <PageLayout>
      <Container size="md">
        <YStack
          gap="$5"
          paddingVertical="$8"
          alignItems="flex-start"
          testID={`player-profile-${id}`}
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            data-testid="player-profile-back"
            aria-label={backLabel}
          >
            ← {backLabel}
          </Button>
          {loading ? (
            <Text fontSize="$3" opacity={0.6}>
              {profileT.loading ?? 'Loading…'}
            </Text>
          ) : missing || !profile ? (
            <EmptyState message={profileT.notFound ?? 'Player not found.'} />
          ) : (
            <Profile
              profile={profile}
              eyebrow={eyebrow}
              placeholder={placeholder}
            />
          )}
        </YStack>
      </Container>
    </PageLayout>
  );
}

function Profile({
  profile,
  eyebrow,
  placeholder,
}: {
  profile: PlayerProfile;
  eyebrow: string;
  placeholder: string;
}) {
  const {
    player,
    modeRanks,
    squad,
    equippedAvatarId,
    equippedBadgeId,
    equippedNameColorId,
  } = profile;
  const max = modeRanks[0]?.rating ?? player.rating;
  const { avatarUrl, badgeUrl, nameColor } = useEquippedCosmetics({
    equippedAvatarId,
    equippedBadgeId,
    equippedNameColorId,
  });
  const nameProps = nameColorRenderProps(nameColor);
  return (
    <YStack gap="$4" width="100%">
      <Text
        fontSize="$2"
        letterSpacing={2}
        opacity={0.6}
        textTransform="uppercase"
      >
        {eyebrow}
      </Text>
      <XStack alignItems="center" gap="$3" flexWrap="wrap">
        <Avatar
          name={player.name}
          src={avatarUrl ?? undefined}
          size="xl"
          data-testid="player-profile-avatar"
        />
        <YStack gap="$1">
          <XStack alignItems="center" gap="$2" flexWrap="wrap">
            <Text
              fontSize="$9"
              fontWeight="800"
              letterSpacing={-0.5}
              {...(nameProps.color ? { color: nameProps.color } : {})}
              {...(nameProps.style ? { style: nameProps.style } : {})}
            >
              {player.name}
            </Text>
            {badgeUrl ? (
              <View width={32} height={32} data-testid="player-profile-badge">
                <img
                  src={badgeUrl}
                  alt=""
                  style={{
                    width: 32,
                    height: 32,
                    objectFit: 'contain',
                  }}
                />
              </View>
            ) : null}
          </XStack>
          <XStack alignItems="center" gap="$2">
            <RankBadge
              tier={player.tier as never}
            >{`#${player.rank}`}</RankBadge>
            {player.streak && player.streak >= 3 ? (
              <Text fontSize="$3">🔥 {player.streak}</Text>
            ) : null}
          </XStack>
        </YStack>
      </XStack>
      <XStack gap="$3" flexWrap="wrap">
        <Stat label="Rating" value={player.rating.toLocaleString()} />
        <Stat label="Wins" value={String(player.wins)} />
        <Stat label="Winrate" value={`${Math.round(player.winrate * 100)}%`} />
        {player.elo ? (
          <Stat label="ELO" value={player.elo.toLocaleString()} />
        ) : null}
        <Stat label="Region" value={player.region.toUpperCase()} />
      </XStack>
      <YStack gap="$2" width="100%" maxWidth={520}>
        <Text
          fontSize="$1"
          letterSpacing={2}
          opacity={0.6}
          textTransform="uppercase"
        >
          Recent form
        </Text>
        <FormPips results={player.recentForm} max={12} variant="letter" />
      </YStack>
      <YStack gap="$3" width="100%">
        <Text
          fontSize="$1"
          letterSpacing={2}
          opacity={0.6}
          textTransform="uppercase"
        >
          Per-mode ranks
        </Text>
        <YStack gap="$2">
          {modeRanks.map((m) => (
            <XStack
              key={m.mode}
              alignItems="center"
              gap="$3"
              padding="$3"
              borderRadius="$3"
              borderWidth={1}
              borderColor="$borderColor"
              backgroundColor="rgba(255,255,255,0.02)"
              data-testid={`profile-mode-${m.mode}`}
            >
              <Text
                width={96}
                fontSize="$2"
                letterSpacing={1}
                textTransform="capitalize"
              >
                {m.mode}
              </Text>
              <RankBadge tier={player.tier as never}>{`#${m.rank}`}</RankBadge>
              <View flex={1} minWidth={140}>
                <EnergyBar value={m.rating} max={max} />
              </View>
            </XStack>
          ))}
        </YStack>
      </YStack>
      {squad ? (
        <YStack gap="$2">
          <Text
            fontSize="$1"
            letterSpacing={2}
            opacity={0.6}
            textTransform="uppercase"
          >
            Squad
          </Text>
          <XStack
            alignItems="center"
            gap="$3"
            padding="$3"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="rgba(255,255,255,0.02)"
          >
            <Text fontWeight="700" letterSpacing={1} color="$mythicAccent">
              [{squad.tag}]
            </Text>
            <Text fontWeight="600">{squad.name}</Text>
            <Text fontSize="$2" opacity={0.7}>
              #{squad.rank}
            </Text>
            <Text fontSize="$2" opacity={0.85} letterSpacing={1}>
              {squad.rating.toLocaleString()}
            </Text>
          </XStack>
        </YStack>
      ) : null}
      <Text fontSize="$2" opacity={0.6} maxWidth={520}>
        {placeholder}
      </Text>
    </YStack>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <YStack
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$2"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="rgba(255,255,255,0.02)"
      gap={2}
      minWidth={96}
    >
      <Text fontSize="$1" opacity={0.6} textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="$4" fontWeight="700" letterSpacing={1}>
        {value}
      </Text>
    </YStack>
  );
}
