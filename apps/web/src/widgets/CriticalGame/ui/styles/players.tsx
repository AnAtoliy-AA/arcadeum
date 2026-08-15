import type { CSSProperties, HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import { getVariantStyles } from './variants';
import { resolveVariantStyles, useVariantTheme } from './variant-styles';

type VariantProp = { $variant?: string };

export function PlayerCard({
  className,
  style,
  $variant,
  $animate: _animate,
  $isCurrentTurn,
  $isCurrentUser,
  $isAlive,
  ...props
}: {
  className?: string;
  style?: CSSProperties;
  $animate?: boolean;
  $isCurrentTurn?: boolean;
  $isCurrentUser?: boolean;
  $isAlive?: boolean;
} & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const theme = useVariantTheme();
  const config = getVariantStyles($variant).players;
  const dimensions = config.getCardDimensions();
  const variantStyles = resolveVariantStyles(config.getStyles?.());
  return (
    <div
      className={cx(
        'box-border flex flex-col items-center justify-center relative max-[800px]:min-w-[80px] max-[800px]:max-w-[100px] max-[800px]:p-2 max-[800px]:gap-1',
        className,
      )}
      style={{
        backgroundColor: config.getCardBackground(
          $isCurrentTurn,
          $isCurrentUser,
          $isAlive,
          theme,
        ),
        borderColor: config.getCardBorder($isCurrentTurn, $isCurrentUser),
        boxShadow: config.getCardShadow($isCurrentTurn, $isCurrentUser),
        gap: config.getCardGap(),
        padding: config.getCardPadding(),
        borderRadius: config.getCardBorderRadius(),
        clipPath: config.getCardClipPath(),
        minWidth: dimensions.minWidth,
        maxWidth: dimensions.maxWidth,
        ...variantStyles.style,
        ...style,
      }}
      {...props}
    />
  );
}

export function PlayerAvatar({
  className,
  style,
  $variant,
  $animate: _animate,
  $isCurrentTurn,
  $isAlive: _isAlive,
  ...props
}: {
  className?: string;
  style?: CSSProperties;
  $animate?: boolean;
  $isCurrentTurn?: boolean;
  $isAlive?: boolean;
} & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const theme = useVariantTheme();
  const config = getVariantStyles($variant).players;
  const variantStyles = resolveVariantStyles(config.getAvatarStyles?.());
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch relative border-2',
        className,
      )}
      style={{
        backgroundColor: config.getAvatarBackground($isCurrentTurn, theme),
        borderColor: config.getAvatarBorder($isCurrentTurn, theme),
        boxShadow: config.getAvatarShadow(!!$isCurrentTurn),
        ...variantStyles.style,
        ...style,
      }}
      {...props}
    />
  );
}

export function AvatarRing({
  className,
  style,
  $variant,
  $isMyTurn,
  $isCurrentTurn,
  $isEliminated,
  ...props
}: {
  className?: string;
  style?: CSSProperties;
  $isMyTurn?: boolean;
  $isCurrentTurn?: boolean;
  $isEliminated?: boolean;
} & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const config = getVariantStyles($variant).players;
  return (
    <div
      className={cx(
        'box-border flex flex-col items-stretch absolute inset-[-4px] rounded-full border-2 z-[1]',
        className,
      )}
      style={{
        border: config.getAvatarRing(!!$isCurrentTurn, !!$isEliminated),
        animation: $isMyTurn ? 'pulse 2s infinite' : undefined,
        ...style,
      }}
      {...props}
    />
  );
}

export function PlayerName({
  className,
  style,
  $variant,
  $isCurrentTurn,
  ...props
}: {
  className?: string;
  style?: CSSProperties;
  $isCurrentTurn?: boolean;
} & VariantProp &
  HTMLAttributes<HTMLSpanElement>) {
  const config = getVariantStyles($variant).players;
  const variantStyles = resolveVariantStyles(config.getNameStyles?.());
  return (
    <span
      className={cx(
        'box-border text-[14px] font-semibold text-[var(--color)] text-center max-w-[120px] max-[800px]:text-[11px] max-[800px]:max-w-[70px] max-[800px]:whitespace-nowrap max-[800px]:overflow-hidden max-[800px]:text-ellipsis',
        className,
      )}
      style={{
        textShadow: config.getNameShadow(!!$isCurrentTurn),
        ...variantStyles.style,
        ...style,
      }}
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
        'box-border flex w-[12px] h-[12px] rounded-[6px] absolute top-[-4px] right-[-4px] z-[2]',
        className,
      )}
      style={{ ...variantStyles.style, ...style }}
      {...props}
    />
  );
}
