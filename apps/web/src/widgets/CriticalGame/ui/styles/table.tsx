import type { CSSProperties, HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import { getVariantStyles } from './variants';
import { legacyStylePropsToCss, type LegacyStyleProps } from './shared';

type VariantProp = { $variant?: string };

export function GameTable({
  className,
  style,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-center justify-start gap-6 pt-[36px] pb-4 px-[28px] relative w-full shrink-0 min-h-[500px] overflow-hidden max-[800px]:pt-2 max-[800px]:pb-2 max-[800px]:px-2 max-[800px]:min-h-[320px] max-[800px]:overflow-visible',
        className,
      )}
      style={style}
      {...props}
    />
  );
}

export function TableBackground({
  className,
  style,
  $variant,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const config = getVariantStyles($variant).table;
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch absolute inset-0 rounded-[20px] overflow-hidden z-[0] max-[800px]:rounded-[14px]',
        className,
      )}
      style={{
        backgroundColor: config.getBackground(),
        borderColor: config.getBorder(),
        borderWidth: 1,
        boxShadow: `0 7.5px 15px ${config.getShadow()}`,
        ...style,
      }}
      {...props}
    />
  );
}

export function PlayersRing({
  className,
  ...props
}: { className?: string } & VariantProp & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center relative w-full flex-1 min-h-[450px] justify-center max-[800px]:flex-row max-[800px]:flex-wrap max-[800px]:justify-center max-[800px]:items-center max-[800px]:min-h-auto max-[800px]:gap-2 max-[800px]:p-2 max-[800px]:grow-0 max-[800px]:shrink-0',
        className,
      )}
      {...props}
    />
  );
}

export function PlayerPositionWrapper({
  className,
  ...props
}: { className?: string } & VariantProp & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch absolute z-[5] max-[800px]:relative max-[800px]:transform-none max-[800px]:w-auto max-[800px]:items-center max-[800px]:shrink-0',
        className,
      )}
      {...props}
    />
  );
}

const CARD_SLOT_CLASS = {
  deck: 'w-[74px] h-[102px] max-[800px]:w-[58px] max-[800px]:h-[80px]',
  lastPlayed: 'w-[92px] h-[126px] max-[800px]:w-[72px] max-[800px]:h-[100px]',
} as const;

export function CardSlot({
  className,
  style,
  $role,
  width,
  height,
  ...props
}: {
  className?: string;
  style?: CSSProperties;
  $role?: 'deck' | 'lastPlayed';
} & LegacyStyleProps &
  HTMLAttributes<HTMLDivElement>) {
  const legacyCss = legacyStylePropsToCss({ width, height });
  return (
    <div
      className={cx(
        'box-border flex flex-col items-center justify-center relative z-[2]',
        $role ? CARD_SLOT_CLASS[$role] : undefined,
        className,
      )}
      style={legacyCss ? { ...legacyCss, ...style } : style}
      {...props}
    />
  );
}

export function CenterTable({
  className,
  style,
  $variant,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const config = getVariantStyles($variant).table.center;
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center justify-center gap-8 p-4 rounded-full w-[340px] h-[340px] relative z-[1] max-[800px]:hidden',
        className,
      )}
      style={{
        backgroundColor: config.getBackground(),
        borderColor: config.getBorder(),
        borderWidth: 2,
        boxShadow: `0 20px 40px ${config.getGlow()}, 0 5px 10px rgba(0, 0, 0, 0.3)`,
        ...style,
      }}
      {...props}
    />
  );
}

export function OpponentStrip({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center overflow-x-auto overflow-y-hidden gap-3 px-3 py-2 h-[110px] w-full min-w-0 shrink-0 relative z-[10] max-[800px]:h-[110px] max-[800px]:gap-2 max-[800px]:overflow-x-auto max-[800px]:overflow-y-hidden max-[800px]:px-0 max-[800px]:justify-start max-[800px]:flex-nowrap',
        className,
      )}
      {...props}
    />
  );
}

export function CenterTableRow({
  className,
  ...props
}: { className?: string } & VariantProp & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-center justify-around gap-3 px-3 h-[150px] w-full relative z-[1] hidden max-[800px]:flex',
        className,
      )}
      {...props}
    />
  );
}
