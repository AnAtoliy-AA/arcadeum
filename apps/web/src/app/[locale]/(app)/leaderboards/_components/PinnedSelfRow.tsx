'use client';
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
    <div
      className="bg-[rgba(15,12,25,0.92)] border-t border-[var(--mythicAccent)] px-4 py-3"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 -16px 32px -8px rgba(236,72,153,0.35)',
        // Clear iOS home-indicator safe area without overflowing on
        // browsers that don't support env().
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
      data-testid="leaderboard-self-row"
    >
      <div className="flex flex-row items-center gap-3 flex-nowrap">
        <span className="text-[12px] tracking-[2px] opacity-[0.6] uppercase max-[800px]:hidden">
          {tt.pinned ?? 'Your rank'}
        </span>
        {isAnon ? (
          <span className="text-[16px] opacity-[0.85] flex-1 line-clamp-1">
            {tt.unranked ?? 'Unranked — play 5 ranked games to appear'}
          </span>
        ) : (
          <>
            <RankBadge tier={player.tier as never}>
              {`#${player.rank}`}
            </RankBadge>
            <span className="font-bold line-clamp-1">{player.name}</span>
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
