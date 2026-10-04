'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Button } from '@arcadeum/ui';
import { RatingBadge } from '@/features/ranking/ui/RatingBadge';
import { useMatchmaking } from '@/features/games/ui/MatchmakingQueue';
import { useRankingStore } from '@/features/ranking/store/rankingStore';
import { rankingApi } from '@/features/ranking/api';
import type { RankingPlayer } from '@/features/ranking/model/types';
import { CriticalRankedTierLadder } from './CriticalRankedTierLadder';
import { CriticalRankedLeaderboard } from './CriticalRankedLeaderboard';

export interface CriticalRankedHubLabels {
  kicker: string;
  title: string;
  subtitle: string;
  ctaQueue: string;
  ctaQueued: string;
  cancelQueue: string;
  yourRating: string;
  season: string;
  peakElo: string;
  rankedGames: string;
  winRate: string;
  unranked: string;
  baselineHint: string;
  ladderTitle: string;
  ladderSubtitle: string;
  leaderboardTitle: string;
  leaderboardSubtitle: string;
  leaderboardEmpty: string;
  rulesTitle: string;
  rule1Title: string;
  rule1Body: string;
  rule2Title: string;
  rule2Body: string;
  rule3Title: string;
  rule3Body: string;
  tiers?: Partial<Record<string, { name: string; min: string; desc: string }>>;
}

export interface CriticalRankedHubProps {
  gameId?: string;
  labels?: Partial<CriticalRankedHubLabels>;
  initialLeaderboard?: RankingPlayer[];
}

const DEFAULT_LABELS: CriticalRankedHubLabels = {
  kicker: 'Competitive 1v1',
  title: 'Critical Ranked ELO & Duel Arena',
  subtitle:
    'Step into high-stakes 1v1 mind games. Outwit your opponent, predict defusal placements, and fight for seasonal glory across 6 competitive rating tiers.',
  ctaQueue: 'Queue Ranked 1v1 Showdown',
  ctaQueued: 'Searching for ranked opponent...',
  cancelQueue: 'Cancel Queue',
  yourRating: 'Your Critical Rating',
  season: 'Season',
  peakElo: 'Peak ELO',
  rankedGames: 'Ranked Matches',
  winRate: 'Win Rate',
  unranked: 'Unranked',
  baselineHint: '1200 starting baseline',
  ladderTitle: 'Competitive Tier Ladder',
  ladderSubtitle: 'Progress through six competitive skill brackets',
  leaderboardTitle: 'Season Top Competitors',
  leaderboardSubtitle: 'Top rated Critical duelists this season',
  leaderboardEmpty:
    'No ranked duelists recorded yet this season. Be the first!',
  rulesTitle: 'Ranked 1v1 Duel Rules',
  rule1Title: 'High-Stakes 1v1 Duel',
  rule1Body:
    'Strict head-to-head format with 2 players and 1 fatal Critical Bomb in the deck.',
  rule2Title: 'Secret Bomb Re-Insertion',
  rule2Body:
    'When defusing, secretly pick the exact draw index to ambush your opponent.',
  rule3Title: 'Dynamic ELO Stakes',
  rule3Body:
    'Rating changes are calculated live via the ELO algorithm based on opponent strength.',
};

export function CriticalRankedHub({
  gameId = 'critical_v1',
  labels,
  initialLeaderboard,
}: CriticalRankedHubProps) {
  const t: CriticalRankedHubLabels = {
    ...DEFAULT_LABELS,
    ...(labels ?? {}),
  };

  const ratings = useRankingStore((s) => s.ratings);
  const userRanking = ratings[gameId];
  const {
    isQueued,
    gameId: queuedGameId,
    ranked: isRankedQueue,
    joinQueue,
    leaveQueue,
  } = useMatchmaking();

  const isQueuedForThis =
    isQueued && queuedGameId === gameId && isRankedQueue === true;

  const [leaderboard, setLeaderboard] = useState<RankingPlayer[]>(
    initialLeaderboard ?? [],
  );
  const [loadingLeaderboard, setLoadingLeaderboard] =
    useState(!initialLeaderboard);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    startTransition(() => {
      rankingApi
        .getRankings(gameId)
        .then((res) => {
          if (active && res.entries) {
            setLeaderboard(res.entries);
          }
        })
        .finally(() => {
          if (active) setLoadingLeaderboard(false);
        });
    });

    return () => {
      active = false;
    };
  }, [gameId]);

  const currentElo = userRanking?.elo ?? 1200;
  const currentTier = userRanking?.tier ?? 'silver';
  const gamesPlayed = userRanking?.rankedGames ?? 0;
  const totalMatches =
    (userRanking?.wins ?? 0) +
    (userRanking?.losses ?? 0) +
    (userRanking?.draws ?? 0);
  const winRate =
    totalMatches > 0
      ? Math.round(((userRanking?.wins ?? 0) / totalMatches) * 100)
      : 0;

  const handleQueue = () => {
    if (isQueuedForThis) {
      void leaveQueue();
    } else {
      void joinQueue(gameId, undefined, true);
    }
  };

  return (
    <section
      id="ranked"
      data-testid="critical-ranked-hub"
      className="box-border flex flex-col gap-8 pt-4 pb-12"
    >
      <div className="box-border flex flex-col gap-2">
        <div className="box-border flex items-center gap-2">
          <span className="box-border px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
            ⚔️ {t.kicker}
          </span>
        </div>
        <h2 className="box-border m-0 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
          {t.title}
        </h2>
        <p className="box-border m-0 text-sm sm:text-base text-[var(--foreground)] opacity-85 max-w-3xl leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      <div className="box-border grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="box-border lg:col-span-1 flex flex-col justify-between gap-6 p-6 rounded-2xl border border-[var(--borderColor)] bg-[var(--glassBg)] backdrop-blur-md shadow-lg">
          <div className="box-border flex flex-col gap-4">
            <div className="box-border flex items-center justify-between gap-2">
              <span className="box-border text-xs font-bold uppercase tracking-wider text-[var(--textSecondary)]">
                {t.yourRating}
              </span>
              <RatingBadge
                elo={gamesPlayed > 0 ? currentElo : null}
                tier={currentTier}
                size="md"
              />
            </div>

            <div className="box-border flex items-baseline gap-3">
              <span
                data-testid="user-ranked-elo"
                className="box-border text-4xl sm:text-5xl font-black tracking-tight text-[var(--foreground)]"
              >
                {gamesPlayed > 0 ? currentElo : 1200}
              </span>
              <span className="box-border text-xs text-[var(--foreground)] opacity-70">
                {gamesPlayed > 0 ? t.season : t.baselineHint}
              </span>
            </div>

            <div className="box-border grid grid-cols-3 gap-2 pt-2 border-t border-[var(--borderColor)]">
              <div className="box-border flex flex-col">
                <span className="box-border text-[10px] font-semibold uppercase text-[var(--textSecondary)]">
                  {t.peakElo}
                </span>
                <span className="box-border text-sm font-bold text-[var(--foreground)]">
                  {userRanking?.peakElo ?? (gamesPlayed > 0 ? currentElo : '-')}
                </span>
              </div>
              <div className="box-border flex flex-col">
                <span className="box-border text-[10px] font-semibold uppercase text-[var(--textSecondary)]">
                  {t.rankedGames}
                </span>
                <span className="box-border text-sm font-bold text-[var(--foreground)]">
                  {gamesPlayed}
                </span>
              </div>
              <div className="box-border flex flex-col">
                <span className="box-border text-[10px] font-semibold uppercase text-[var(--textSecondary)]">
                  {t.winRate}
                </span>
                <span className="box-border text-sm font-bold text-[var(--foreground)]">
                  {gamesPlayed > 0 ? `${winRate}%` : '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="box-border flex flex-col gap-2">
            <Button
              variant={isQueuedForThis ? 'danger' : 'primary'}
              size="lg"
              onClick={handleQueue}
              className="box-border w-full font-bold shadow-md"
              data-testid="queue-ranked-critical-button"
            >
              {isQueuedForThis ? t.cancelQueue : t.ctaQueue}
            </Button>
            {isQueuedForThis ? (
              <span
                aria-live="polite"
                className="box-border text-center text-xs text-rose-400 font-semibold animate-pulse"
              >
                {t.ctaQueued}
              </span>
            ) : null}
          </div>
        </div>

        <div className="box-border lg:col-span-2 flex flex-col gap-4">
          <div className="box-border flex flex-col gap-1">
            <h3 className="box-border m-0 text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
              {t.rulesTitle}
            </h3>
          </div>

          <div className="box-border grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="box-border flex flex-col gap-2 p-4 rounded-xl border border-[var(--borderColor)] bg-[var(--glassBg)] backdrop-blur-md">
              <span className="box-border text-2xl" aria-hidden="true">
                🎯
              </span>
              <h4 className="box-border m-0 text-sm font-bold text-[var(--foreground)]">
                {t.rule1Title}
              </h4>
              <p className="box-border m-0 text-xs text-[var(--foreground)] opacity-80 leading-relaxed">
                {t.rule1Body}
              </p>
            </div>

            <div className="box-border flex flex-col gap-2 p-4 rounded-xl border border-[var(--borderColor)] bg-[var(--glassBg)] backdrop-blur-md">
              <span className="box-border text-2xl" aria-hidden="true">
                🧠
              </span>
              <h4 className="box-border m-0 text-sm font-bold text-[var(--foreground)]">
                {t.rule2Title}
              </h4>
              <p className="box-border m-0 text-xs text-[var(--foreground)] opacity-80 leading-relaxed">
                {t.rule2Body}
              </p>
            </div>

            <div className="box-border flex flex-col gap-2 p-4 rounded-xl border border-[var(--borderColor)] bg-[var(--glassBg)] backdrop-blur-md">
              <span className="box-border text-2xl" aria-hidden="true">
                📈
              </span>
              <h4 className="box-border m-0 text-sm font-bold text-[var(--foreground)]">
                {t.rule3Title}
              </h4>
              <p className="box-border m-0 text-xs text-[var(--foreground)] opacity-80 leading-relaxed">
                {t.rule3Body}
              </p>
            </div>
          </div>
        </div>
      </div>

      <CriticalRankedTierLadder
        currentTier={gamesPlayed > 0 ? currentTier : null}
        tiersInfo={t.tiers}
        title={t.ladderTitle}
        subtitle={t.ladderSubtitle}
      />

      <CriticalRankedLeaderboard
        entries={leaderboard}
        loading={loadingLeaderboard}
        title={t.leaderboardTitle}
        subtitle={t.leaderboardSubtitle}
        emptyMessage={t.leaderboardEmpty}
      />
    </section>
  );
}
