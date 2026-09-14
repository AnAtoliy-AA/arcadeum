'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import type { LeaderboardEntry } from '@/features/history/api';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import {
  Badge,
  EmptyState,
  SkeletonCircle,
  SkeletonText,
  ProgressBar,
  Spinner,
  Card,
} from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  currentUserId?: string;
}

export function Leaderboard({
  leaderboard,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  currentUserId,
}: LeaderboardProps) {
  const { t } = useTranslation();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingMore && onLoadMore) {
        onLoadMore();
      }
    },
    [hasMore, loadingMore, onLoadMore],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  if (loading && leaderboard.length === 0) {
    return (
      <Card
        variant="glass"
        padding="md"
        className="flex flex-col gap-4 border-[var(--borderColor)] shadow-lg"
      >
        <div className="flex items-center gap-2">
          <span className="text-[18px]">🏆</span>
          <h3 className="text-[17px] font-bold tracking-tight text-[var(--color)]">
            {t('stats.leaderboardTab')}
          </h3>
        </div>
        <div className="flex flex-col w-full rounded-xl overflow-hidden border border-[var(--borderColor)]/50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 border-b border-[var(--borderColor)]/40 bg-[var(--surfaceSecondary)]/40"
            >
              <div className="flex items-center gap-3">
                <SkeletonCircle width="36px" height="36px" delay={i * 0.1} />
                <SkeletonCircle
                  width="40px"
                  height="40px"
                  delay={i * 0.1 + 0.05}
                />
                <SkeletonText width="120px" delay={i * 0.1 + 0.1} />
              </div>
              <SkeletonText width="50px" delay={i * 0.1 + 0.15} />
              <SkeletonText width="50px" delay={i * 0.1 + 0.2} />
              <SkeletonText width="80px" delay={i * 0.1 + 0.25} />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card
        variant="glass"
        padding="lg"
        className="flex flex-col items-center justify-center p-8 border-[var(--borderColor)] shadow-lg"
      >
        <EmptyState icon="🏆" message={t('stats.noPlayersFound')} />
      </Card>
    );
  }

  return (
    <Card
      variant="glass"
      padding="md"
      className="flex flex-col gap-4 border-[var(--borderColor)] shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">🏆</span>
          <h3 className="text-[17px] font-bold tracking-tight text-[var(--color)]">
            {t('stats.leaderboardTab')}
          </h3>
        </div>
        <span className="text-[12px] font-semibold text-[var(--textSecondary)]">
          {leaderboard.length} {t('stats.player' as TranslationKey)}s
        </span>
      </div>

      <div className="flex flex-col w-full rounded-xl overflow-hidden border border-[var(--borderColor)]/50 bg-[var(--surfaceSecondary)]/30">
        <div className="hidden md:grid md:grid-cols-[56px_2.5fr_1fr_1fr_1fr_1.5fr] p-3 px-4 bg-[var(--surfaceTertiary)]/40 border-b border-[var(--borderColor)]/50 text-[11px] font-bold uppercase tracking-wider text-[var(--textSecondary)]">
          <div className="text-center">{t('stats.rank')}</div>
          <div>{t('stats.player')}</div>
          <div className="text-right">{t('stats.games')}</div>
          <div className="text-right">{t('stats.wins')}</div>
          <div className="text-right">{t('stats.losses')}</div>
          <div className="text-right pl-4">{t('stats.winRate')}</div>
        </div>

        <div className="divide-y divide-[var(--borderColor)]/30">
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.playerId === currentUserId;

            return (
              <div
                key={entry.playerId}
                className={`stats-leaderboard-row grid grid-cols-[44px_1fr_auto] md:grid-cols-[56px_2.5fr_1fr_1fr_1fr_1.5fr] items-center p-3 px-4 transition-colors ${
                  isCurrentUser
                    ? 'stats-leaderboard-row--current-user bg-violet-500/15 border-l-4 border-l-violet-500 font-semibold'
                    : 'hover:bg-[var(--surfaceHover)]/60'
                }`}
              >
                <div className="flex items-center justify-center">
                  <RankIndicator rank={entry.rank} />
                </div>

                <div className="flex items-center gap-3 min-w-0 pl-1">
                  <EquippedPlayerAvatar
                    name={entry.username}
                    size="md"
                    equippedAvatarId={entry.equippedAvatarId ?? null}
                    equippedBadgeId={entry.equippedBadgeId ?? null}
                    equippedNameColorId={entry.equippedNameColorId}
                    equippedFrameId={entry.equippedFrameId}
                    equippedAuraId={entry.equippedAuraId}
                    equippedBannerId={entry.equippedBannerId}
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[14px] font-bold text-[var(--color)] truncate">
                      {entry.username}
                    </span>
                    {isCurrentUser && (
                      <Badge variant="info" size="sm">
                        {t('stats.you')}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="hidden md:block text-right text-[14px] font-medium text-[var(--color)] font-mono">
                  {entry.totalGames}
                </div>

                <div className="hidden md:block text-right text-[14px] font-bold text-[var(--success)] font-mono">
                  {entry.wins}
                </div>

                <div className="hidden md:block text-right text-[14px] font-semibold text-[var(--danger)] font-mono">
                  {entry.losses}
                </div>

                <div className="flex items-center justify-end md:pl-4 min-w-[90px]">
                  <div className="w-full max-w-[130px]">
                    <ProgressBar
                      className="h-2"
                      value={entry.winRate}
                      showLabel
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        ref={loadMoreRef}
        className="min-h-[60px] flex items-center justify-center p-3"
      >
        {loadingMore && (
          <div className="flex items-center gap-2 text-[var(--textSecondary)] text-[14px]">
            <Spinner size="sm" />
            <span>{t('stats.loadingMore')}</span>
          </div>
        )}
        {!hasMore && leaderboard.length > 0 && (
          <span className="text-[13px] text-[var(--textSecondary)] opacity-60">
            {t('stats.endOfLeaderboard')}
          </span>
        )}
      </div>
    </Card>
  );
}

function RankIndicator({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-[18px] shadow-sm">
        🥇
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-400/20 border border-slate-400/40 text-[18px] shadow-sm">
        🥈
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 border border-amber-700/40 text-[18px] shadow-sm">
        🥉
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-7 h-7 rounded-full border border-[var(--borderColor)]/60 bg-[var(--surfaceTertiary)]/50 text-[12px] font-bold text-[var(--textSecondary)] font-mono">
      {rank}
    </div>
  );
}
