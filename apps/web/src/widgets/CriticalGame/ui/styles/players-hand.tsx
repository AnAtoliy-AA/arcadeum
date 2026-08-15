import type { CSSProperties, HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import { Button, type GameVariant } from '@arcadeum/ui';
import { Card as BaseCard } from './cards-base';
import { ActionButton, type ActionButtonProps } from './cards';
import { getVariantStyles } from './variants';
import { resolveVariantStyles } from './variant-styles';

type VariantProp = { $variant?: string };

// Hand Components
export function HandHeader({
  className,
  ...props
}: { className?: string } & VariantProp & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch justify-between items-center mb-4 flex-wrap gap-2',
        className,
      )}
      {...props}
    />
  );
}

export function HandTitle({
  className,
  ...props
}: { className?: string } & VariantProp & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cx(
        'box-border mr-auto text-[14px] font-extrabold text-[var(--color)] uppercase tracking-[1px]',
        className,
      )}
      {...props}
    />
  );
}

export function HandControls({
  className,
  ...props
}: { className?: string } & VariantProp & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch flex-wrap gap-2',
        className,
      )}
      {...props}
    />
  );
}

export const HandToggleButton = (props: ActionButtonProps) => (
  <ActionButton
    className="py-2 px-4 text-[12px] min-w-[auto] w-auto"
    {...props}
  />
);

export function DropdownContainer({
  className,
  ...props
}: { className?: string } & VariantProp & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch relative',
        className,
      )}
      {...props}
    />
  );
}

export const DropdownTrigger = ({
  variant,
  isOpen,
  $isOpen,
  ...props
}: {
  variant?: GameVariant;
  isOpen?: boolean;
  $isOpen?: boolean;
  [key: string]: unknown;
}) => (
  <Button
    className="min-w-[120px] justify-start"
    variant="chip"
    size="sm"
    active={isOpen || $isOpen}
    gameVariant={variant as GameVariant}
    {...props}
  />
);

export function DropdownList({
  className,
  style,
  $variant,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  // Re-using tableInfo or chat variants for dropdown list as they are similar
  const config = getVariantStyles($variant).chat;
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch absolute top-full right-0 mt-1 z-[100] min-w-full rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)]',
        className,
      )}
      style={{
        backgroundColor: config.getBackground(),
        borderColor: config.getBorder() || 'rgba(255, 255, 255, 0.1)',
        boxShadow: `0 5px 10px rgba(0, 0, 0, 0.3), ${config.getShadow()}`,
        ...style,
      }}
      {...props}
    />
  );
}

export const DropdownItem = ({
  isActive,
  $isActive,
  variant,
  ...props
}: {
  isActive?: boolean;
  $isActive?: boolean;
  variant?: GameVariant;
  [key: string]: unknown;
}) => (
  <Button
    variant="listItem"
    size="sm"
    active={isActive || $isActive}
    gameVariant={variant as GameVariant}
    {...props}
  />
);

// Gold (yellow-400) ring + layered drop-shadow + soft glow used when a hand
// card is hovered/focused ("selected"). Spec: 2px gold border + triple-stack
// shadow from Task 12.
export const HAND_CARD_SELECTED_SHADOW =
  '0 2px 4px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.4), 0 0 24px rgba(250, 204, 21, 0.4)';
export const HAND_CARD_SELECTED_BORDER_COLOR = 'rgba(250, 204, 21, 1)';

const HAND_CARD_HOVER_CLASS =
  'hover:border-[rgba(250,204,21,1)] hover:border-2 hover:shadow-[0_2px_4px_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.4),0_0_24px_rgba(250,204,21,0.4)]';

const HAND_CARD_SIZE_CLASS = {
  desktopFan: cx(
    'w-[82px] h-[114px]',
    'hover:translate-y-[-26px]',
    HAND_CARD_HOVER_CLASS,
  ),
  mobileFlat: cx(
    'w-[104px] h-[142px]',
    'active:translate-y-[-14px]',
    HAND_CARD_HOVER_CLASS.replaceAll('hover:', 'active:'),
  ),
} as const;

export function HandCard({
  className,
  $variant,
  $clickable,
  $dimmed,
  $size,
  ...props
}: {
  className?: string;
  $clickable?: boolean;
  $dimmed?: boolean;
  $size?: 'desktopFan' | 'mobileFlat';
} & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const config = getVariantStyles($variant).cards;
  const variantStyles = resolveVariantStyles(config.getCardStyles?.());
  return (
    <BaseCard
      className={cx(
        'shrink-0 w-[110px]',
        $clickable === false ? 'cursor-default' : 'cursor-pointer opacity-[1]',
        $dimmed ? 'opacity-[0.7]' : undefined,
        $size ? HAND_CARD_SIZE_CLASS[$size] : undefined,
        className,
      )}
      $variant={$variant}
      style={variantStyles.style}
      {...props}
    />
  );
}
