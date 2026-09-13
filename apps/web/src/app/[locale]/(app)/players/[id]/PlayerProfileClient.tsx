'use client';
import { Suspense, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  PageLayout,
  Container,
  Button,
  RankBadge,
  EmptyState,
} from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import type { PlayerProfile } from '@/entities/leaderboard/model/types';
import { getPlayer } from '@/shared/api/leaderboard';
import { useQuery } from '@/shared/hooks/useQuery';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
import { useLanguage } from '@/shared/i18n';
import { formatNumber } from '@/shared/i18n/formatters';
import { SeasonBanner } from '@/features/seasons/ui';
import { PlayerStatsOverview } from './ui/PlayerStatsOverview';
import { PlayerGameHistory } from './ui/PlayerGameHistory';
import { PlayerFavoriteGames } from './ui/PlayerFavoriteGames';
import { PlayerShareActions } from './ui/PlayerShareActions';

export default function PlayerProfileClient({
  id,
  t,
  isSelf = false,
  achievementsSlot,
  initialProfile,
}: {
  id: string;
  t?: PageTranslations;
  isSelf?: boolean;
  achievementsSlot?: ReactNode;
  initialProfile?: PlayerProfile | null;
}) {
  const router = useRouter();
  const {
    data: profile,
    isLoading: loading,
    error,
  } = useQuery<PlayerProfile | null>({
    queryKey: ['player', id],
    queryFn: () => getPlayer(id),
    // SSR-seeded profile renders instantly (and appears in initial HTML);
    // background refresh still runs when no seed was provided.
    initialData: initialProfile ?? null,
    refetchOnMount: !initialProfile,
  });
  const missing = !!error || (!loading && !profile);

  const profileT = (t?.profile ?? {}) as Record<string, string | undefined>;
  const eyebrow = profileT.eyebrow ?? 'Player';
  const backLabel = profileT.back ?? 'Back to leaderboard';

  return (
    <PageLayout>
      <Container size="md">
        <div
          className="flex flex-col gap-5 py-8 items-start"
          data-testid={`player-profile-${id}`}
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
            <span className="text-[16px] opacity-[0.6]">
              {profileT.loading ?? 'Loading…'}
            </span>
          ) : missing || !profile ? (
            <EmptyState message={profileT.notFound ?? 'Player not found.'} />
          ) : (
            <Profile
              profile={profile}
              eyebrow={eyebrow}
              isSelf={isSelf}
              achievementsSlot={achievementsSlot}
            />
          )}
        </div>
      </Container>
    </PageLayout>
  );
}

function Profile({
  profile,
  eyebrow,
  isSelf,
  achievementsSlot,
}: {
  profile: PlayerProfile;
  eyebrow: string;
  isSelf?: boolean;
  achievementsSlot?: ReactNode;
}) {
  const { locale } = useLanguage();
  const {
    player,
    modeRanks,
    squad,
    equippedAvatarId,
    equippedBadgeId,
    equippedNameColorId,
    equippedFrameId,
    equippedAuraId,
    equippedBannerId,
    equippedGameSkinId,
  } = profile;
  const { nameColor } = useEquippedCosmetics({
    equippedAvatarId,
    equippedBadgeId,
    equippedNameColorId,
    equippedFrameId,
    equippedAuraId,
    equippedBannerId,
  });
  const nameProps = nameColorRenderProps(nameColor);

  return (
    <div className="flex flex-col items-stretch gap-6 w-full">
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold tracking-[2px] opacity-60 uppercase">
          {eyebrow}
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-4 flex-wrap">
            <EquippedPlayerAvatar
              name={player.name}
              size="md"
              equippedAvatarId={equippedAvatarId}
              equippedBadgeId={equippedBadgeId}
              equippedNameColorId={equippedNameColorId}
              equippedFrameId={equippedFrameId}
              equippedAuraId={equippedAuraId}
              equippedBannerId={equippedBannerId}
              equippedGameSkinId={equippedGameSkinId}
              fallbackAvatarUrl={player.avatarUrl}
              data-testid="player-profile-avatar"
            />
            <div className="flex flex-col items-stretch gap-1">
              <div className="flex flex-row items-center gap-2 flex-wrap">
                <span
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                  {...(nameProps.color ? { color: nameProps.color } : {})}
                  {...(nameProps.style ? { style: nameProps.style } : {})}
                >
                  {player.name}
                </span>
              </div>
              <div className="flex flex-row items-center gap-2">
                <RankBadge
                  tier={player.tier as never}
                >{`#${player.rank}`}</RankBadge>
                {player.streak && player.streak >= 3 ? (
                  <span className="text-sm font-semibold text-orange-400">
                    🔥 {player.streak} Streak
                  </span>
                ) : null}
                <span className="text-xs text-[var(--colorMuted)] font-medium">
                  {player.region ? player.region.toUpperCase() : 'GLOBAL'}
                </span>
              </div>
            </div>
          </div>

          <PlayerShareActions
            playerId={player.id}
            playerName={player.name}
            isSelf={isSelf}
          />
        </div>
      </div>

      <PlayerStatsOverview
        wins={player.wins}
        losses={player.losses}
        draws={player.draws}
        winrate={player.winrate}
        streak={player.streak}
        rating={player.rating}
        elo={player.elo}
        rank={player.rank}
        tier={player.tier}
        xp={profile.xp}
        level={profile.level}
        prestige={profile.prestige}
      />

      <SeasonBanner className="w-full" />

      <PlayerFavoriteGames modeRanks={modeRanks} />

      <PlayerGameHistory
        recentForm={player.recentForm}
        playerName={player.name}
        modes={modeRanks.map((m) => m.mode)}
      />

      {achievementsSlot ? (
        <Suspense fallback={null}>
          <div className="flex w-full flex-col items-stretch">
            {achievementsSlot}
          </div>
        </Suspense>
      ) : null}

      {squad ? (
        <div className="flex flex-col items-stretch gap-2">
          <span className="text-xs tracking-[2px] opacity-60 uppercase font-bold">
            Squad
          </span>
          <div className="flex flex-row items-center gap-3 p-3 rounded-xl border border-[var(--borderColor)] bg-white/5">
            <span className="font-bold tracking-[1px] text-[var(--mythicAccent)]">
              [{squad.tag}]
            </span>
            <span className="font-semibold">{squad.name}</span>
            <span className="text-sm opacity-70">#{squad.rank}</span>
            <span className="text-sm opacity-85 tracking-wider">
              {formatNumber(squad.rating, locale)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
