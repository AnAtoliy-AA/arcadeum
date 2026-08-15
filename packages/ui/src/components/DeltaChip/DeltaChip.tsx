import { cx } from '../../utils/cx';

export type DeltaChipProps = {
  from: number;
  to: number;
  testID?: string;
  className?: string;
};

type DeltaDirection = 'up' | 'down' | 'flat';

const deltaChipClasses: Record<DeltaDirection, string> = {
  up: 'border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.15)]',
  down: 'border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.15)]',
  flat: 'border-[var(--borderColor)] bg-[rgba(255,255,255,0.04)]',
};

const deltaTextClasses: Record<DeltaDirection, string> = {
  up: 'text-[var(--success)]',
  down: 'text-[var(--danger)]',
  flat: 'text-[var(--textSecondary)]',
};

export function DeltaChip({ from, to, testID, className }: DeltaChipProps) {
  const diff = from - to;
  const direction: DeltaDirection = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
  const sign = diff > 0 ? '+' : diff < 0 ? '' : '±';
  return (
    <div
      data-testid={testID}
      className={cx(
        'box-border flex flex-row items-center gap-1 px-2 py-0.5 rounded-full border',
        deltaChipClasses[direction],
        className,
      )}
    >
      <span className="text-[12px] opacity-70 tracking-[1px]">#{from}</span>
      <span className="text-[12px] opacity-50">→</span>
      <span className="text-[12px] opacity-95 tracking-[1px]">#{to}</span>
      <span className={cx('text-[12px] font-bold', deltaTextClasses[direction])}>
        {sign}
        {Math.abs(diff)}
      </span>
    </div>
  );
}
