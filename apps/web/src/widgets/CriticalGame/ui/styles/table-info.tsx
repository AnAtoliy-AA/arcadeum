import type { CSSProperties, HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import { getVariantStyles } from './variants';

type VariantProp = { variant?: string };

export function TableInfo({
  className,
  style,
  variant,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const config = getVariantStyles(variant).tableInfo;
  return (
    <div
      className={cx(
        'flex flex-col items-stretch gap-2 p-4 rounded-[16px] border border-[rgba(255,255,255,0.1)] z-[5] overflow-hidden max-[800px]:top-4 max-[800px]:left-4 max-[800px]:right-4 max-[800px]:flex-row max-[800px]:justify-center max-[800px]:gap-2 max-[800px]:p-2 max-[800px]:rounded-[12px]',
        className,
      )}
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: config.getBackground(),
        borderColor: config.getBorder(),
        boxShadow: config.getShadow(),
        backdropFilter: 'blur(12px)',
        ...config.getStyles?.(),
        ...style,
      }}
      {...props}
    />
  );
}

export function TableStat({
  className,
  style,
  variant,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const statStyles = getVariantStyles(variant).tableInfo.getTableStatStyles?.();
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-3 py-2 px-3 rounded-[10px] bg-[rgba(255,255,255,0.05)] transition-transform duration-150 hover:bg-[var(--stat-hover-bg,rgba(255,255,255,0.1))] hover:border-[var(--stat-hover-border,rgba(255,255,255,0.1))] hover:[transform:var(--stat-hover-transform,-translateX(-2px))] max-[800px]:flex-1 max-[800px]:justify-center max-[800px]:gap-[6px] max-[800px]:py-[6px] max-[800px]:px-2',
        className,
      )}
      style={{ ...statStyles, ...style }}
      {...props}
    />
  );
}

export function StatIcon({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx('flex flex-col items-center justify-center', className)}
      {...props}
    />
  );
}

export function StatValue({
  className,
  style,
  isWarning,
  variant,
  ...props
}: {
  className?: string;
  style?: CSSProperties;
  isWarning?: boolean;
} & VariantProp &
  HTMLAttributes<HTMLSpanElement>) {
  const config = getVariantStyles(variant).tableInfo;
  const glow = config.getTextGlow();
  return (
    <span
      className={cx(
        'text-[14px] font-bold',
        isWarning ? 'text-[var(--danger)]' : 'text-[var(--color)]',
        className,
      )}
      style={{
        color: config.getStatValueColor(!!isWarning),
        textShadow: glow === 'inherit' ? 'none' : `0 0 8px ${glow}`,
        ...style,
      }}
      {...props}
    />
  );
}

export * from './table-decorations';
