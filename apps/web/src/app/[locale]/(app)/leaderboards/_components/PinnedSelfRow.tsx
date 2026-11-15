'use client';
import { useRouter } from 'next/navigation';
import { useRoutes } from '@/shared/config/useRoutes';
import {
  RankBadge,
  FormPips,
  EnergyBar,
  Button,
  RoleBadge,
} from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import { useTranslation } from '@/shared/i18n/useTranslation';
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
  const router = useRouter();
  const routes = useRoutes();
  const { t: translate } = useTranslation();
  const tt = (t?.self ?? {}) as {
    pinned?: string;
    unranked?: string;
    share?: string;
  };
  const isAnon = player.id === 'anon';
  const max = topRating ?? player.rating;
  const roleLabel =
    player.role && player.role !== 'free' && player.role !== 'user'
      ? translate(`common.roles.${player.role}` as never) ||
        player.role.toUpperCase()
      : null;
  return (
    <div
      className="bg-[rgba(15,12,25,0.92)] border-t border-[var(--mythicAccent)] px-4 py-3 fixed inset-x-0 bottom-0 z-50 backdrop-blur-md shadow-[0_-16px_32px_-8px_rgba(236,72,153,0.35)] pb-[max(12px,env(safe-area-inset-bottom))]"
      data-testid="leaderboard-self-row"
    >
      <div className="flex flex-row items-center gap-3 flex-nowrap">
        <span className="text-[12px] tracking-[2px] opacity-[0.9] uppercase max-[800px]:hidden">
          {tt.pinned ?? 'Your rank'}
        </span>
        {isAnon ? (
          <span className="text-[16px] opacity-[0.85] flex-1 line-clamp-1">
            {tt.unranked ?? 'Unranked - play 5 ranked games to appear'}
          </span>
        ) : (
          <>
            <RankBadge tier={player.tier as never}>
              {`#${player.rank}`}
            </RankBadge>
            <button
              type="button"
              className="flex items-center gap-2 hover:opacity-85 transition-opacity text-left cursor-pointer"
              onClick={() => router.push(routes.playerProfile(player.id))}
              data-testid="pinned-self-profile-btn"
            >
              <EquippedPlayerAvatar
                size="sm"
                name={player.name}
                equippedAvatarId={player.equippedAvatarId}
                equippedBadgeId={player.equippedBadgeId}
                equippedNameColorId={player.equippedNameColorId}
                equippedFrameId={player.equippedFrameId}
                equippedAuraId={player.equippedAuraId}
                equippedBannerId={player.equippedBannerId}
                role={player.role}
                fallbackAvatarUrl={player.avatarUrl}
              />
              <span className="font-bold break-words" title={player.name}>
                {player.name}
              </span>
              {roleLabel && player.role ? (
                <RoleBadge role={player.role as never}>{roleLabel}</RoleBadge>
              ) : null}
            </button>
            {/* Hide rating viz on small screens so the row stays one line */}
            <div className="flex-1 min-w-[120px] max-w-[320px] max-[800px]:hidden">
              <EnergyBar value={player.rating} max={max} />
            </div>
            <div className="flex flex-col items-end max-[800px]:hidden">
              <FormPips results={player.recentForm} max={8} variant="letter" />
            </div>
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
      </div>
    </div>
  );
}
