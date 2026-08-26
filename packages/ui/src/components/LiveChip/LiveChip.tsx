import { cx } from '../../utils/cx';

export type LiveChipProps = {
  label?: string;
  testID?: string;
  className?: string;
};

const PULSE_STYLE_ID = '__arcadeum-live-pulse';
const PULSE_KEYFRAMES = `
@keyframes arcadeum-live-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
`;

if (typeof document !== 'undefined' && !document.getElementById(PULSE_STYLE_ID)) {
  const styleEl = document.createElement('style');
  styleEl.id = PULSE_STYLE_ID;
  styleEl.textContent = PULSE_KEYFRAMES;
  document.head.appendChild(styleEl);
}

export function LiveChip({ label = 'Live', testID, className }: LiveChipProps) {
  return (
    <div
      data-testid={testID}
      className={cx(
        'flex flex-row items-center gap-[6px] px-[10px] py-1 rounded-full border border-[rgba(239,68,68,0.5)] bg-[rgba(239,68,68,0.12)]',
        className,
      )}
    >
      <div className="h-2 w-2 animate-[arcadeum-live-pulse_1.6s_ease-in-out_infinite] rounded bg-[#ef4444]" />
      <span className="text-[12px] font-bold tracking-[1px] text-[#ef4444]">
        {label.toUpperCase()}
      </span>
    </div>
  );
}
