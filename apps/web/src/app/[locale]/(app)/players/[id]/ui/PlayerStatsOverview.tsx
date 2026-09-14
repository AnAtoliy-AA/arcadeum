'use client';

import { xpProgress, toRoman } from '@/shared/lib/xp-level';

export interface PlayerStatsOverviewProps {
  wins: number;
  losses: number;
  draws: number;
  winrate: number;
  streak?: number;
  rating: number;
  elo?: number;
  rank: number;
  tier: string;
  xp?: number;
  level?: number;
  prestige?: number;
}

function getWidthClass(percent: number): string {
  if (percent >= 95) return 'w-full';
  if (percent >= 85) return 'w-11/12';
  if (percent >= 80) return 'w-4/5';
  if (percent >= 75) return 'w-3/4';
  if (percent >= 66) return 'w-2/3';
  if (percent >= 60) return 'w-3/5';
  if (percent >= 50) return 'w-1/2';
  if (percent >= 40) return 'w-2/5';
  if (percent >= 33) return 'w-1/3';
  if (percent >= 25) return 'w-1/4';
  if (percent >= 20) return 'w-1/5';
  if (percent >= 15) return 'w-1/6';
  if (percent >= 10) return 'w-1/12';
  if (percent > 0) return 'w-2';
  return 'w-0';
}

export function PlayerStatsOverview({
  wins,
  losses,
  draws,
  winrate,
  streak,
  rating,
  elo,
  rank,
  tier,
  xp = 0,
  level = 1,
  prestige = 0,
}: PlayerStatsOverviewProps) {
  const totalGames = wins + losses + draws;
  const winPercent = Math.round(winrate * 100);
  const lossPercent =
    totalGames > 0 ? Math.round((losses / totalGames) * 100) : 0;
  const drawPercent =
    totalGames > 0 ? Math.round((draws / totalGames) * 100) : 0;
  const { progress, xpInLevel, xpNeeded } = xpProgress(xp);

  return (
    <div
      data-testid="player-stats-overview"
      className="flex flex-col gap-4 w-full rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-6 backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold uppercase tracking-wider text-[var(--colorMuted)]">
          Combat & Ranking Statistics
        </h2>
        <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
          <span className="rounded-md border border-[var(--borderColor)] bg-white/5 px-2.5 py-1 text-[var(--color)]">
            {rating} Rating
          </span>
          {elo ? (
            <span className="rounded-md border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-sky-300">
              {elo} ELO
            </span>
          ) : null}
          <span className="rounded-md border border-[var(--borderColor)] bg-white/5 px-2.5 py-1 text-[var(--color)]">
            Rank #{rank}
          </span>
          <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 uppercase text-amber-400">
            {tier}
          </span>
          {streak && streak >= 2 ? (
            <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 font-bold text-orange-400">
              🔥 {streak} Streak
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          data-testid="stat-level"
          className="flex flex-col gap-1 rounded-xl border border-violet-500/30 bg-violet-500/5 p-3"
        >
          <span className="text-xs uppercase tracking-wider text-violet-400">
            Level
          </span>
          <span className="text-2xl font-extrabold text-violet-300">
            {prestige > 0 && (
              <span className="text-amber-400 mr-1">P{toRoman(prestige)}</span>
            )}
            {level}
          </span>
          <div className="w-full rounded-full bg-white/10 h-1.5 mt-1">
            <div
              className="h-full rounded-full bg-violet-500 transition-all duration-500"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-violet-400/70">
            {xpInLevel}/{xpNeeded} XP
          </span>
        </div>

        <div
          data-testid="stat-xp"
          className="flex flex-col gap-1 rounded-xl border border-[var(--borderColor)] bg-white/5 p-3"
        >
          <span className="text-xs uppercase tracking-wider text-[var(--colorMuted)]">
            Total XP
          </span>
          <span className="text-2xl font-extrabold text-[var(--color)]">
            {xp.toLocaleString()}
          </span>
          <span className="text-xs text-[var(--colorMuted)]">
            Earned across all games
          </span>
        </div>

        <div
          data-testid="stat-total-games"
          className="flex flex-col gap-1 rounded-xl border border-[var(--borderColor)] bg-white/5 p-3"
        >
          <span className="text-xs uppercase tracking-wider text-[var(--colorMuted)]">
            Total Matches
          </span>
          <span className="text-2xl font-extrabold text-[var(--color)]">
            {totalGames}
          </span>
          <span className="text-xs text-[var(--colorMuted)]">
            Recorded matches
          </span>
        </div>

        <div
          data-testid="stat-wins"
          className="flex flex-col gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3"
        >
          <span className="text-xs uppercase tracking-wider text-emerald-400">
            Victories
          </span>
          <span className="text-2xl font-extrabold text-emerald-300">
            {wins}
          </span>
          <span className="text-xs text-emerald-400/70">
            {winPercent}% win rate
          </span>
        </div>

        <div
          data-testid="stat-losses"
          className="flex flex-col gap-1 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3"
        >
          <span className="text-xs uppercase tracking-wider text-rose-400">
            Defeats
          </span>
          <span className="text-2xl font-extrabold text-rose-300">
            {losses}
          </span>
          <span className="text-xs text-rose-400/70">
            {lossPercent}% loss rate
          </span>
        </div>

        <div
          data-testid="stat-draws"
          className="flex flex-col gap-1 rounded-xl border border-[var(--borderColor)] bg-white/5 p-3"
        >
          <span className="text-xs uppercase tracking-wider text-[var(--colorMuted)]">
            Draws
          </span>
          <span className="text-2xl font-extrabold text-[var(--color)]">
            {draws}
          </span>
          <span className="text-xs text-[var(--colorMuted)]">
            {drawPercent}% draw rate
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-[var(--colorMuted)]">
            Win / Loss Distribution
          </span>
          <span className="text-emerald-400 font-bold">
            {winPercent}% Win Rate
          </span>
        </div>

        <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`bg-emerald-500 transition-all duration-500 ${getWidthClass(winPercent)}`}
          />
          <div
            className={`bg-slate-400 transition-all duration-500 ${getWidthClass(drawPercent)}`}
          />
          <div
            className={`bg-rose-500 transition-all duration-500 ${getWidthClass(lossPercent)}`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[var(--colorMuted)] pt-1">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Wins ({wins})
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
            Draws ({draws})
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
            Losses ({losses})
          </span>
        </div>
      </div>
    </div>
  );
}
