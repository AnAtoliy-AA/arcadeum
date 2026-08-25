import { cx } from '../../utils/cx';

export type FormResult = 'W' | 'L' | 'D';

export type FormPipsProps = {
  results: FormResult[];
  max?: number;
  size?: number;
  variant?: 'dot' | 'letter';
  className?: string;
};

const pipResultClasses: Record<FormResult, string> = {
  W: 'border-transparent bg-[var(--success)]',
  L: 'border-transparent bg-[var(--danger)]',
  D: 'border-[var(--borderColor)] bg-[var(--neutral)]',
};

const letterTileClasses: Record<FormResult, string> = {
  W: 'border-[rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.18)]',
  L: 'border-[rgba(239,68,68,0.4)] bg-[rgba(239,68,68,0.18)]',
  D: 'border-[var(--borderColor)] bg-[rgba(255,255,255,0.06)]',
};

const letterTextClasses: Record<FormResult, string> = {
  W: 'text-[var(--success)]',
  L: 'text-[var(--danger)]',
  D: 'text-[var(--textSecondary)]',
};

export function FormPips({
  results,
  max = 7,
  size,
  variant = 'dot',
  className,
}: FormPipsProps) {
  const sliced = results.slice(-max);
  const dotSize = size ?? 10;

  return (
    <div
      className={cx('flex items-center gap-1', className)}
      aria-label="Recent form"
    >
      {sliced.map((r, i) =>
        variant === 'letter' ? (
          <span
            key={i}
            className={cx(
              'flex h-4 w-4 items-center justify-center rounded-[4px] border',
              letterTileClasses[r],
            )}
          >
            <span
              className={cx(
                'text-[10px] font-bold tracking-[1px]',
                letterTextClasses[r],
              )}
            >
              {r}
            </span>
          </span>
        ) : (
          <span
            key={i}
            data-testid="form-pip"
            className={cx('border', pipResultClasses[r])}
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
            }}
          />
        ),
      )}
    </div>
  );
}
