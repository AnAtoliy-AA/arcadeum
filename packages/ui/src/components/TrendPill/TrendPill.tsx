import { cx } from '../../utils/cx';

export type TrendPillProps = {
  rank: number;
  prevRank?: number;
  testID?: string;
  className?: string;
};

type TrendDirection = 'up' | 'down' | 'same';

const trendPillClasses: Record<TrendDirection, string> = {
  up: 'border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.15)]',
  down: 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.15)]',
  same: 'border-[var(--borderColor)] bg-[rgba(255,255,255,0.04)]',
};

const trendTextClasses: Record<TrendDirection, string> = {
  up: 'text-[var(--success)]',
  down: 'text-[var(--danger)]',
  same: 'text-[var(--textSecondary)]',
};

export function TrendPill({ rank, prevRank, testID, className }: TrendPillProps) {
  const diff = prevRank == null ? 0 : prevRank - rank;
  const direction: TrendDirection = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';
  const glyph = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '–';
  return (
    <div
      data-testid={testID}
      className={cx(
        'box-border flex flex-row items-center gap-1 px-2 py-0.5 rounded-full border',
        trendPillClasses[direction],
        className,
      )}
    >
      <span className={cx('text-[12px] font-bold', trendTextClasses[direction])}>
        {glyph}
      </span>
      {direction !== 'same' ? (
        <span className={cx('text-[12px] font-bold', trendTextClasses[direction])}>
          {Math.abs(diff)}
        </span>
      ) : null}
    </div>
  );
}
