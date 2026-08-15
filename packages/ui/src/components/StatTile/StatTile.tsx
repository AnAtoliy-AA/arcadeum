'use client';

import type { ReactNode, CSSProperties } from 'react';
import { cx } from '../../utils/cx';

export type StatTileProps = {
  value: ReactNode;
  label: string;
  sparkline?: boolean;
  'data-testid'?: string;
  className?: string;
};

const statTileCellClasses =
  'box-border flex flex-col items-start relative flex-1 min-w-[140px] py-[18px] px-[18px] gap-[6px]';

const sparkStyle: CSSProperties = {
  marginTop: 4,
  height: 2,
  width: '60%',
  maxWidth: 120,
  background:
    'linear-gradient(90deg, transparent 0%, var(--accent) 35%, var(--accent) 65%, transparent 100%)',
  opacity: 0.55,
  borderRadius: 2,
  pointerEvents: 'none',
};

export function StatTile({
  value,
  label,
  sparkline = true,
  'data-testid': testId,
  className,
}: StatTileProps) {
  return (
    <div data-testid={testId} className={cx(statTileCellClasses, className)}>
      <span className="text-[28px] font-semibold tracking-[-0.5px] text-[var(--color)]">
        {value}
      </span>
      <span className="text-[11px] uppercase tracking-[1.4px] text-[var(--textSecondary)]">
        {label}
      </span>
      {sparkline ? <span aria-hidden="true" style={sparkStyle} /> : null}
    </div>
  );
}

StatTile.displayName = 'StatTile';
