'use client';
import { Suspense, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  PageLayout,
  Container,
  Button,
  RankBadge,
  FormPips,
  EnergyBar,
  EmptyState,
} from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import type { PlayerProfile } from '@/entities/leaderboard/model/types';
import { getPlayer } from '@/shared/api/leaderboard';
import { useQuery } from '@/shared/hooks/useQuery';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
import { useLanguage } from '@/shared/i18n/context';
import { formatNumber } from '@/shared/i18n/formatters';
import { SeasonBanner } from '@/features/seasons/ui';

export default function PlayerProfileClient({
  id,
  t,
  achievementsSlot,
}: {
  id: string;
  t?: PageTranslations;
  achievementsSlot?: ReactNode;
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
              placeholder={placeholder}
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
  placeholder,
  achievementsSlot,
}: {
  profile: PlayerProfile;
  eyebrow: string;
  placeholder: string;
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
  const max = modeRanks[0]?.rating ?? player.rating;
  // PlayerAvatar renders the avatar disc + badge corner + frame + aura.
  // The name color still drives the surrounding name `<Text>` below.
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
    <div className="flex flex-col items-stretch gap-4 w-full">
      <span className="text-[14px] tracking-[2px] opacity-[0.6] uppercase">
        {eyebrow}
      </span>
      <div className="flex flex-row items-center gap-3 flex-wrap">
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
              className="text-[40px] font-extrabold tracking-[-0.5px]"
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
              <span className="text-[16px]">🔥 {player.streak}</span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-row items-stretch gap-3 flex-wrap">
        <Stat label="Rating" value={formatNumber(player.rating, locale)} />
        <Stat label="Wins" value={String(player.wins)} />
        <Stat label="Winrate" value={`${Math.round(player.winrate * 100)}%`} />
        {player.elo ? (
          <Stat label="ELO" value={formatNumber(player.elo, locale)} />
        ) : null}
        <Stat
          label="Region"
          value={player.region ? player.region.toUpperCase() : '—'}
        />
      </div>
      <SeasonBanner className="w-full max-w-[520px]" />
      <div className="flex flex-col items-stretch gap-2 w-full max-w-[520px]">
        <span className="text-[12px] tracking-[2px] opacity-[0.6] uppercase">
          Recent form
        </span>
        <FormPips results={player.recentForm} max={12} variant="letter" />
      </div>
      <div className="flex flex-col items-stretch gap-3 w-full">
        <span className="text-[12px] tracking-[2px] opacity-[0.6] uppercase">
          Per-mode ranks
        </span>
        <div className="flex flex-col items-stretch gap-2">
          {modeRanks.map((m) => (
            <div
              className="flex flex-row items-center gap-3 p-3 rounded-xl border border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)]"
              key={m.mode}
              data-testid={`profile-mode-${m.mode}`}
            >
              <span className="w-[96px] text-[14px] tracking-[1px] capitalize">
                {m.mode}
              </span>
              <RankBadge tier={player.tier as never}>{`#${m.rank}`}</RankBadge>
              <div className="flex-1 min-w-[140px]">
                <EnergyBar value={m.rating} max={max} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {achievementsSlot ? (
        <Suspense fallback={null}>
          <div className="flex w-full flex-col items-stretch">
            {achievementsSlot}
          </div>
        </Suspense>
      ) : null}
      {squad ? (
        <div className="flex flex-col items-stretch gap-2">
          <span className="text-[12px] tracking-[2px] opacity-[0.6] uppercase">
            Squad
          </span>
          <div className="flex flex-row items-center gap-3 p-3 rounded-xl border border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)]">
            <span className="font-bold tracking-[1px] text-[var(--mythicAccent)]">
              [{squad.tag}]
            </span>
            <span className="font-semibold">{squad.name}</span>
            <span className="text-[14px] opacity-[0.7]">#{squad.rank}</span>
            <span className="text-[14px] opacity-[0.85] tracking-[1px]">
              {formatNumber(squad.rating, locale)}
            </span>
          </div>
        </div>
      ) : null}
      <span className="text-[14px] opacity-[0.6] max-w-[520px]">
        {placeholder}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-stretch px-3 py-2 rounded-lg border border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)] gap-2 min-w-[96px]">
      <span className="text-[12px] opacity-[0.6] uppercase">{label}</span>
      <span className="text-[18px] font-bold tracking-[1px]">{value}</span>
    </div>
  );
}
