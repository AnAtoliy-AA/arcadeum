'use client';

import { useMemo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

interface GameResult {
  id: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  rating: number;
  ratingChange: number;
  timeControl: string;
  date: string;
  opening?: string;
}

interface GameHistoryDashboardProps {
  games: GameResult[];
  currentRating: number;
  t: (key: string, params?: Record<string, string | number>) => string;
}

function RatingGraph({
  games,
  height = 100,
}: {
  games: GameResult[];
  height?: number;
}) {
  const ratings = useMemo(
    () => games.map((g) => g.rating + g.ratingChange),
    [games],
  );

  const minRating = useMemo(
    () => Math.min(...ratings, 1000),
    [ratings],
  );

  const maxRating = useMemo(
    () => Math.max(...ratings, 1400),
    [ratings],
  );

  const range = maxRating - minRating || 1;

  const points = useMemo(() => {
    if (ratings.length < 2) return '';
    const width = 100;
    const segW = width / (ratings.length - 1);
    return ratings
      .map((r, i) => {
        const x = i * segW;
        const y = height - ((r - minRating) / range) * (height - 8) - 4;
        return `${x},${y}`;
      })
      .join(' ');
  }, [ratings, minRating, range, height]);

  const lastRating = ratings[ratings.length - 1] ?? 1200;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 100 ${height}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
      >
        {points && (
          <polyline
            points={points}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      <div className="absolute top-1 right-1 text-[10px] font-bold text-[var(--color)] tabular-nums">
        {lastRating}
      </div>
    </div>
  );
}

function WinLossDrawPie({
  wins,
  losses,
  draws,
  size = 80,
}: {
  wins: number;
  losses: number;
  draws: number;
  size?: number;
}) {
  const total = wins + losses + draws;
  if (total === 0) return null;

  const winPct = (wins / total) * 100;
  const lossPct = (losses / total) * 100;
  const drawPct = (draws / total) * 100;

  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          stroke="var(--backgroundHover)"
          strokeWidth="3"
        />
        {wins > 0 && (
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#22c55e"
            strokeWidth="3"
            strokeDasharray={`${winPct} ${100 - winPct}`}
            strokeDashoffset="25"
          />
        )}
        {losses > 0 && (
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeDasharray={`${lossPct} ${100 - lossPct}`}
            strokeDashoffset={25 - winPct}
          />
        )}
        {draws > 0 && (
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#eab308"
            strokeWidth="3"
            strokeDasharray={`${drawPct} ${100 - drawPct}`}
            strokeDashoffset={25 - winPct - lossPct}
          />
        )}
      </svg>
      <div className="flex flex-col gap-1 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[var(--textSecondary)]">{wins} wins</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[var(--textSecondary)]">{losses} losses</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-[var(--textSecondary)]">{draws} draws</span>
        </div>
      </div>
    </div>
  );
}

function RecentGameRow({ game }: { game: GameResult }) {
  const resultLabel =
    game.result === 'win' ? 'W' : game.result === 'loss' ? 'L' : 'D';

  return (
    <div className="flex items-center gap-2 py-2 border-b border-[var(--glassBorder)] last:border-b-0">
      <span
        className={cx(
          'w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold',
          game.result === 'win' && 'bg-emerald-500/15 text-emerald-400',
          game.result === 'loss' && 'bg-red-500/15 text-red-400',
          game.result === 'draw' && 'bg-amber-500/15 text-amber-400',
        )}
      >
        {resultLabel}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-[var(--color)] truncate">
          {game.opponent}
        </div>
        <div className="text-[9px] text-[var(--textSecondary)]">
          {game.timeControl} · {game.date}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs font-bold text-[var(--color)]">{game.rating}</div>
        <div
          className={cx(
            'text-[9px] font-bold tabular-nums',
            game.ratingChange > 0 ? 'text-emerald-400' : 'text-red-400',
          )}
        >
          {game.ratingChange > 0 ? '+' : ''}
          {game.ratingChange}
        </div>
      </div>
    </div>
  );
}

export function GameHistoryDashboard({
  games,
  currentRating,
  t,
}: GameHistoryDashboardProps) {
  const stats = useMemo(() => {
    const wins = games.filter((g) => g.result === 'win').length;
    const losses = games.filter((g) => g.result === 'loss').length;
    const draws = games.filter((g) => g.result === 'draw').length;
    const winRate = games.length > 0 ? Math.round((wins / games.length) * 100) : 0;
    const peakRating = Math.max(...games.map((g) => g.rating + g.ratingChange), currentRating);
    return { wins, losses, draws, winRate, peakRating };
  }, [games, currentRating]);

  const openings = useMemo(() => {
    const map = new Map<string, { count: number; wins: number }>();
    for (const game of games) {
      if (!game.opening) continue;
      const existing = map.get(game.opening) ?? { count: 0, wins: 0 };
      existing.count++;
      if (game.result === 'win') existing.wins++;
      map.set(game.opening, existing);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
  }, [games]);

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
      <div className="text-[11px] font-semibold text-[var(--textSecondary)] uppercase tracking-wider">
        {t('games.chess_v1.history.title')}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center p-2 rounded-lg bg-[var(--backgroundHover)]">
          <span className="text-lg font-black text-[var(--color)]">{currentRating}</span>
          <span className="text-[9px] text-[var(--textSecondary)]">Rating</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-[var(--backgroundHover)]">
          <span className="text-lg font-black text-emerald-400">{stats.peakRating}</span>
          <span className="text-[9px] text-[var(--textSecondary)]">Peak</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-[var(--backgroundHover)]">
          <span className="text-lg font-black text-sky-400">{stats.winRate}%</span>
          <span className="text-[9px] text-[var(--textSecondary)]">Win Rate</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase">
          Rating Trend
        </span>
        <RatingGraph games={games} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase">
          Results
        </span>
        <WinLossDrawPie
          wins={stats.wins}
          losses={stats.losses}
          draws={stats.draws}
        />
      </div>

      {openings.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase">
            Top Openings
          </span>
          <div className="flex flex-col gap-1">
            {openings.map(([opening, data]) => (
              <div
                key={opening}
                className="flex items-center justify-between py-1 px-2 rounded-lg bg-[var(--backgroundHover)]"
              >
                <span className="text-xs text-[var(--color)] truncate">{opening}</span>
                <span className="text-[10px] text-[var(--textSecondary)] tabular-nums">
                  {data.count} games · {Math.round((data.wins / data.count) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold text-[var(--textSecondary)] uppercase">
          Recent Games
        </span>
        <div className="flex flex-col max-h-[200px] overflow-y-auto">
          {games.slice(0, 10).map((game) => (
            <RecentGameRow key={game.id} game={game} />
          ))}
          {games.length === 0 && (
            <div className="text-xs text-[var(--textSecondary)] text-center py-4">
              No games played yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
