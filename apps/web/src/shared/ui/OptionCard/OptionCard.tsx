'use client';

import type React from 'react';
import { type ReactNode } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';

export interface OptionCardProps {
  label: ReactNode;
  description?: ReactNode;
  isActive?: boolean;
  /** @deprecated Use onClick instead */
  onPress?: () => void;
  onClick?: () => void;
  icon?: ReactNode;
  'data-testid'?: string;
  className?: string;
  style?: React.CSSProperties;
}

function ActiveIndicator({ visible }: { visible?: boolean }) {
  return (
    <span
      aria-hidden
      className={cx(
        'box-border absolute top-[10px] right-[10px] w-2 h-2 rounded-[4px] bg-[var(--primary)] shadow-[0_0_10px_var(--primary)] opacity-0',
        visible && 'opacity-100',
      )}
    />
  );
}

export function OptionCard({
  label,
  description,
  isActive,
  onPress,
  onClick,
  icon,
  'data-testid': dataTestId,
  className,
  style,
  ...rest
}: OptionCardProps) {
  return (
    <button
      className={cx(
        'box-border relative flex w-full flex-col items-stretch overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] p-5 gap-2 cursor-pointer text-left transition-all duration-300 ease-out',
        isActive
          ? 'bg-[rgba(87,195,255,0.1)] border-[var(--primary)] shadow-[0_0_15px_var(--primary)]'
          : 'hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(255,255,255,0.2)] hover:-translate-y-0.5',
        className,
      )}
      style={{
        scrollMarginTop: 100,
        ...style,
      }}
      type="button"
      onClick={onClick ?? onPress}
      data-testid={dataTestId}
      aria-pressed={isActive ? 'true' : 'false'}
      role="button"
      tabIndex={0}
      {...rest}
    >
      <ActiveIndicator visible={isActive} />
      <div className="box-border flex flex-col items-stretch gap-1">
        <div className="box-border flex flex-row items-center gap-3">
          {icon}
          <span className="box-border text-[20px] leading-[28px] font-semibold text-[var(--color)]">
            {label}
          </span>
        </div>
        {description && (
          <span className="box-border text-[16px] leading-[18px] opacity-[0.7] text-[var(--color)]">
            {description}
          </span>
        )}
      </div>
    </button>
  );
}
