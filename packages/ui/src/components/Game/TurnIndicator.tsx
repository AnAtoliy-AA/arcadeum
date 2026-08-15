import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export interface TurnIndicatorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  isYourTurn: boolean;
  children: string;
}

export function TurnIndicator({
  isYourTurn,
  children,
  className,
  style,
  ...props
}: TurnIndicatorProps) {
  return (
    <div
      className={cx(
        'flex flex-row items-center justify-center gap-2 rounded-full border px-6 py-2 z-[90] backdrop-blur-[20px] min-w-[240px]',
        'max-[1150px]:min-w-0 max-[1150px]:px-4 max-[1150px]:py-1',
        isYourTurn
          ? 'border-[rgba(16,185,129,0.5)] bg-[rgba(16,185,129,0.45)]'
          : 'border-[rgba(255,255,255,0.2)] bg-[rgba(0,0,0,0.75)]',
        className,
      )}
      style={{ maxWidth: 'fit-content', ...style }}
      {...props}
    >
      <span className="text-[18px]">{isYourTurn ? '🎯' : '⏳'}</span>
      <span className="text-[14px] font-extrabold uppercase tracking-[0.8px] text-white">
        {children}
      </span>
    </div>
  );
}
