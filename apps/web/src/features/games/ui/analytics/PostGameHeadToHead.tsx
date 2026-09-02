import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { HeadToHeadResponse } from '@/features/history/api';

interface PostGameHeadToHeadProps {
  data: HeadToHeadResponse | null;
  loading: boolean;
  opponentId?: string | null;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function PostGameHeadToHead({
  data,
  loading,
  opponentId,
  t,
}: PostGameHeadToHeadProps) {
  if (!opponentId) {
    return (
      <div className="flex flex-col items-center gap-2 py-6">
        <span className="text-3xl">⚔️</span>
        <p className="text-center text-[13px] text-[var(--textSecondary)]">
          {t('games.table.analytics.headToHead.noOpponent')}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--glassBorder)] border-t-[var(--primary)]" />
        <span className="text-xs text-[var(--textSecondary)]">
          Loading rivalry...
        </span>
      </div>
    );
  }

  if (!data || data.totalGames === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6">
        <span className="text-3xl">⚔️</span>
        <p className="text-center text-[13px] text-[var(--textSecondary)]">
          {t('games.table.analytics.headToHead.empty')}
        </p>
      </div>
    );
  }

  const p1Wins = data.player1.wins;
  const p2Wins = data.player2.wins;
  const total = data.totalGames;

  const p1WinRate = total > 0 ? Math.round((p1Wins / total) * 100) : 0;
  const p2WinRate = total > 0 ? Math.round((p2Wins / total) * 100) : 0;

  const rivalryKey: TranslationKey =
    total === 1
      ? 'games.table.analytics.headToHead.first'
      : p1Wins > p2Wins + 2
        ? 'games.table.analytics.headToHead.dominant'
        : p2Wins > p1Wins + 2
          ? 'games.table.analytics.headToHead.revenge'
          : 'games.table.analytics.headToHead.close';

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
          {t('games.table.analytics.headToHead.rivalryStatus')}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-bold text-indigo-400">
          ✨ {t(rivalryKey)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
            {t('games.table.analytics.headToHead.wins')}
          </span>
          <div className="mt-1 flex items-center justify-center gap-1.5 font-mono">
            <span className="text-lg font-bold text-emerald-400">{p1Wins}</span>
            <span className="text-xs text-[var(--textSecondary)]">:</span>
            <span className="text-lg font-bold text-rose-400">{p2Wins}</span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
            {t('games.table.analytics.headToHead.draws')}
          </span>
          <p className="mt-1 font-mono text-lg font-bold text-[var(--color)]">
            {data.player1.draws}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
            {t('games.table.analytics.headToHead.totalGames')}
          </span>
          <p className="mt-1 font-mono text-lg font-bold text-[var(--color)]">
            {total}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-[11px] font-medium text-[var(--color)]">
          <span className="text-emerald-400">You ({p1WinRate}%)</span>
          <span className="text-rose-400">Opponent ({p2WinRate}%)</span>
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--backgroundHover)]">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
            style={{ width: `${p1WinRate}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-700"
            style={{ width: `${p2WinRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
