import type { CSSProperties, HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import { Button, type ButtonProps, type GameVariant } from '@arcadeum/ui';
import { getVariantStyles } from './variants';
import { resolveVariantStyles } from './variant-styles';

type VariantProp = { $variant?: string };

export function InfoTitle({
  className,
  style,
  $variant,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  HTMLAttributes<HTMLSpanElement>) {
  const config = getVariantStyles($variant).table.actions;
  const variantStyles = resolveVariantStyles(config?.getTitleStyles?.());
  return (
    <span
      className={cx(
        'box-border relative pb-2 text-[14px] font-extrabold uppercase tracking-[1px] text-[var(--color)] max-[800px]:text-[12px] max-[800px]:mb-[6px]',
        className,
      )}
      style={{ ...variantStyles.style, ...style }}
      {...props}
    />
  );
}

export function ActionsHeader({
  className,
  style,
  $variant,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const config = getVariantStyles($variant).table.actions;
  const variantStyles = resolveVariantStyles(config?.getContainerStyles?.());
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch justify-between items-center relative mb-6',
        className,
      )}
      style={{ ...variantStyles.style, ...style }}
      {...props}
    />
  );
}

interface ActionsToggleButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: string;
  $variant?: string;
}

export const ActionsToggleButton = ({
  variant,
  $variant,
  ...props
}: ActionsToggleButtonProps) => (
  <Button
    variant="icon"
    size="sm"
    gameVariant={(variant || $variant) as GameVariant}
    {...props}
  />
);
