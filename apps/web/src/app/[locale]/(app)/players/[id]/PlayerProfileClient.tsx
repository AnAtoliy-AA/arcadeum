'use client';
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
        <div
          className="box-border flex flex-col gap-5 py-8 items-start"
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
            <span className="box-border text-[16px] opacity-[0.6]">
              {profileT.loading ?? 'Loading…'}
            </span>
          ) : missing || !profile ? (
            <EmptyState message={profileT.notFound ?? 'Player not found.'} />
          ) : (
            <Profile
              profile={profile}
              eyebrow={eyebrow}
              placeholder={placeholder}
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
}: {
  profile: PlayerProfile;
  eyebrow: string;
  placeholder: string;
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
    <div className="box-border flex flex-col items-stretch gap-4 w-full">
      <span className="box-border text-[14px] tracking-[2px] opacity-[0.6] uppercase">
        {eyebrow}
      </span>
      <div className="box-border flex flex-row items-center gap-3 flex-wrap">
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
        <div className="box-border flex flex-col items-stretch gap-1">
          <div className="box-border flex flex-row items-center gap-2 flex-wrap">
            <span
              className="box-border text-[40px] font-extrabold tracking-[-0.5px]"
              {...(nameProps.color ? { color: nameProps.color } : {})}
              {...(nameProps.style ? { style: nameProps.style } : {})}
            >
              {player.name}
            </span>
          </div>
          <div className="box-border flex flex-row items-center gap-2">
            <RankBadge
              tier={player.tier as never}
            >{`#${player.rank}`}</RankBadge>
            {player.streak && player.streak >= 3 ? (
              <span className="box-border text-[16px]">🔥 {player.streak}</span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="box-border flex flex-row items-stretch gap-3 flex-wrap">
        <Stat label="Rating" value={formatNumber(player.rating, locale)} />
        <Stat label="Wins" value={String(player.wins)} />
        <Stat label="Winrate" value={`${Math.round(player.winrate * 100)}%`} />
        {player.elo ? (
          <Stat label="ELO" value={formatNumber(player.elo, locale)} />
        ) : null}
        <Stat label="Region" value={player.region.toUpperCase()} />
      </div>
      <div className="box-border flex flex-col items-stretch gap-2 w-full max-w-[520px]">
        <span className="box-border text-[12px] tracking-[2px] opacity-[0.6] uppercase">
          Recent form
        </span>
        <FormPips results={player.recentForm} max={12} variant="letter" />
      </div>
      <div className="box-border flex flex-col items-stretch gap-3 w-full">
        <span className="box-border text-[12px] tracking-[2px] opacity-[0.6] uppercase">
          Per-mode ranks
        </span>
        <div className="box-border flex flex-col items-stretch gap-2">
          {modeRanks.map((m) => (
            <div
              className="box-border flex flex-row items-center gap-3 p-3 rounded-xl border border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)]"
              key={m.mode}
              data-testid={`profile-mode-${m.mode}`}
            >
              <span className="box-border w-[96px] text-[14px] tracking-[1px] capitalize">
                {m.mode}
              </span>
              <RankBadge tier={player.tier as never}>{`#${m.rank}`}</RankBadge>
              <div className="box-border flex-1 min-w-[140px]">
                <EnergyBar value={m.rating} max={max} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {squad ? (
        <div className="box-border flex flex-col items-stretch gap-2">
          <span className="box-border text-[12px] tracking-[2px] opacity-[0.6] uppercase">
            Squad
          </span>
          <div className="box-border flex flex-row items-center gap-3 p-3 rounded-xl border border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)]">
            <span className="box-border font-bold tracking-[1px] text-[var(--mythicAccent)]">
              [{squad.tag}]
            </span>
            <span className="box-border font-semibold">{squad.name}</span>
            <span className="box-border text-[14px] opacity-[0.7]">
              #{squad.rank}
            </span>
            <span className="box-border text-[14px] opacity-[0.85] tracking-[1px]">
              {formatNumber(squad.rating, locale)}
            </span>
          </div>
        </div>
      ) : null}
      <span className="box-border text-[14px] opacity-[0.6] max-w-[520px]">
        {placeholder}
      </span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="box-border flex flex-col items-stretch px-3 py-2 rounded-lg border border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)] gap-2 min-w-[96px]">
      <span className="box-border text-[12px] opacity-[0.6] uppercase">
        {label}
      </span>
      <span className="box-border text-[18px] font-bold tracking-[1px]">
        {value}
      </span>
    </div>
  );
}
