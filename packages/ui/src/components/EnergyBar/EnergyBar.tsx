import { cx } from '../../utils/cx';

export type EnergyBarProps = {
  value: number;
  max: number;
  label?: string;
  height?: number;
  testID?: string;
  className?: string;
};

export function EnergyBar({
  value,
  max,
  label,
  height = 22,
  testID,
  className,
}: EnergyBarProps) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <div
      data-testid={testID}
      className={cx(
        'relative flex-1 rounded-full border border-[var(--borderColor)] bg-[rgba(255,255,255,0.04)] overflow-hidden flex flex-row items-center',
        className,
      )}
      style={{ height }}
    >
      <div
        className="absolute top-0 left-0 bottom-0"
        style={{
          width: `${ratio * 100}%`,
          background:
            'linear-gradient(90deg, rgba(236,72,153,0.15), rgba(236,72,153,0.85))',
        }}
      />
      <span className="absolute right-2 text-[14px] font-bold tracking-[1px] text-[#ffffff]">
        {label ?? value.toLocaleString()}
      </span>
    </div>
  );
}
