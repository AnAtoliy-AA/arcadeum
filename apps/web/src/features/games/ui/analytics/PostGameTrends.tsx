import { cx } from '@arcadeum/ui/utils/cx';
import type { TranslationKey } from '@/shared/lib/useTranslation';
import type { TrendsResponse } from '@/features/history/api';

interface PostGameTrendsProps {
  data: TrendsResponse | null;
  loading: boolean;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export function PostGameTrends({ data, loading, t }: PostGameTrendsProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--glassBorder)] border-t-[var(--primary)]" />
        <span className="text-xs text-[var(--textSecondary)]">
          Loading trends...
        </span>
      </div>
    );
  }

  if (!data || data.records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6">
        <span className="text-3xl">📈</span>
        <p className="text-center text-[13px] text-[var(--textSecondary)]">
          {t('games.table.analytics.trends.empty')}
        </p>
      </div>
    );
  }

  const last10 = data.records.slice(-10);
  const winCount = last10.filter((r) => r.result === 'won').length;
  const isWinningStreak = data.currentStreakType === 'won';
  const isLosingStreak = data.currentStreakType === 'lost';

  return (
    <div className="flex flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
            {t('games.table.analytics.trends.winRate')}
          </span>
          <div className="mt-1 flex items-baseline justify-center gap-1">
            <span className="font-mono text-xl font-bold text-emerald-400">
              {data.winRate}%
            </span>
            <span className="text-[11px] text-[var(--textSecondary)]">
              ({winCount}/{last10.length} L10)
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--glassBorder)] bg-[var(--glassBg)] p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--textSecondary)]">
            {t('games.table.analytics.trends.currentStreak')}
          </span>
          <p
            className={cx(
              'mt-1 flex items-center justify-center gap-1 font-mono text-xl font-bold',
              isWinningStreak
                ? 'text-amber-400'
                : isLosingStreak
                  ? 'text-rose-400'
                  : 'text-[var(--color)]',
            )}
          >
            {isWinningStreak && '🔥'}
            {isLosingStreak && '❄️'}
            {data.currentStreak > 0
              ? isWinningStreak
                ? t('games.table.analytics.trends.winStreak', {
                    count: data.currentStreak,
                  })
                : t('games.table.analytics.trends.lossStreak', {
                    count: data.currentStreak,
                  })
              : t('games.table.analytics.trends.neutral')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-[var(--color)]">
          <span>{t('games.table.analytics.trends.form')}</span>
          <span className="text-[10px] text-[var(--textSecondary)]">
            {t('games.table.analytics.trends.newest')} ➔
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {last10.map((r, i) => {
            const isWin = r.result === 'won';
            const isLoss = r.result === 'lost';
            return (
              <div
                key={`${r.sessionId}-${i}`}
                title={new Date(r.timestamp).toLocaleDateString()}
                className={cx(
                  'flex h-7 flex-1 items-center justify-center rounded-lg font-mono text-[11px] font-bold transition-transform hover:scale-105',
                  isWin &&
                    'border border-emerald-500/30 bg-emerald-500/20 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
                  isLoss &&
                    'border border-rose-500/30 bg-rose-500/20 text-rose-400',
                  !isWin &&
                    !isLoss &&
                    'border border-white/10 bg-white/10 text-white/60',
                )}
              >
                {isWin ? 'W' : isLoss ? 'L' : 'D'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
