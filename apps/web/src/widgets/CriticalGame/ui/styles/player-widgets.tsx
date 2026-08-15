import type { CSSProperties, HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import { getVariantStyles } from './variants';
import { resolveVariantStyles } from './variant-styles';

type VariantProp = { $variant?: string };

export function PlayerStatsContainer({
  className,
  ...props
}: { className?: string } & VariantProp & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch gap-1 items-center',
        className,
      )}
      {...props}
    />
  );
}

export function PlayerCardCount({
  className,
  style,
  $variant,
  $isCurrentTurn,
  $type,
  ...props
}: {
  className?: string;
  style?: CSSProperties;
  $isCurrentTurn?: boolean;
  $type?: 'default' | 'stash' | 'marked';
} & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const config = getVariantStyles($variant).players;
  const variantStyles = resolveVariantStyles(
    config.getCardCountStyles?.($isCurrentTurn, $type),
  );
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch items-center gap-1 py-1 px-2 rounded-full border bg-[var(--background)] border-[var(--borderColor)] max-[800px]:py-1 max-[800px]:px-[6px]',
        $isCurrentTurn
          ? 'bg-[rgba(0,0,0,0.5)] border-[rgba(255,255,255,0.4)]'
          : undefined,
        $type === 'stash'
          ? 'bg-[var(--stashBg)] border-[var(--stashBorder)]'
          : $type === 'marked'
            ? 'bg-[var(--markedBg)] border-[var(--markedBorder)]'
            : undefined,
        className,
      )}
      style={{ ...variantStyles.style, ...style }}
      {...props}
    />
  );
}

export function TurnIndicator({
  className,
  style,
  $variant,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const config = getVariantStyles($variant).players;
  const variantStyles = resolveVariantStyles(config.getTurnIndicatorStyles?.());
  return (
    <div
      className={cx(
        'box-border flex w-[28px] h-[28px] items-center justify-center relative mb-[-10px] z-[20]',
        className,
      )}
      style={{
        textShadow:
          config.getTurnIndicatorGlow() === 'inherit'
            ? 'none'
            : `0 0 8px ${config.getTurnIndicatorGlow()}`,
        ...variantStyles.style,
        ...style,
      }}
      {...props}
    />
  );
}
