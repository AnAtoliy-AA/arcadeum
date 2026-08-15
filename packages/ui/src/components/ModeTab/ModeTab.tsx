import type { KeyboardEvent } from 'react';
import { cx } from '../../utils/cx';

export type ModeTabProps = {
  id: string;
  name: string;
  subtitle?: string;
  icon: string;
  gradient: string;
  active?: boolean;
  onSelect?: () => void;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  testID?: string;
  className?: string;
};

const modeTabCardClasses =
  'flex flex-row items-center gap-3 px-3 py-3 rounded-xl border border-t-2 border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)] cursor-pointer min-w-[200px] hover:bg-[rgba(255,255,255,0.04)] focus:outline-none focus:border-[var(--mythicAccent)]';

const modeTabActiveClasses =
  'border-t-[var(--mythicAccent)] bg-[rgba(236,72,153,0.06)]';

export function ModeTab({
  id,
  name,
  subtitle,
  icon,
  gradient,
  active = false,
  onSelect,
  onKeyDown,
  testID,
  className,
}: ModeTabProps) {
  return (
    <div
      className={cx(
        modeTabCardClasses,
        active ? modeTabActiveClasses : 'border-t-[var(--borderColor)]',
        className,
      )}
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      data-testid={testID ?? `mode-tab-${id}`}
    >
      <div
        className="flex items-center justify-center h-9 w-9 rounded-lg"
        style={{ background: gradient }}
      >
        <span className="text-[20px]">{icon}</span>
      </div>
      <div className="flex flex-col gap-[2px] flex-1">
        <span className="text-[16px] font-bold">{name}</span>
        {subtitle ? (
          <span className="text-[12px] opacity-70">{subtitle}</span>
        ) : null}
      </div>
    </div>
  );
}
