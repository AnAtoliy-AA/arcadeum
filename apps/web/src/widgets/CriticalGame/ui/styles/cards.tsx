import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import { Button, type ButtonProps, type GameVariant } from '@arcadeum/ui';
import { Card as BaseCard, CARD_SURFACE_CLASS } from './cards-base';
import { getVariantStyles } from './variants';
import { resolveVariantStyles } from './variant-styles';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

export * from './cards-base';

export type ActionButtonProps = ButtonProps & {
  variant?: string;
  $variant?: string;
};

export const ActionButton = ({
  variant,
  $variant,
  ...props
}: ActionButtonProps) => {
  const media = useMediaQuery();
  return (
    <Button
      variant={(variant || 'primary') as ButtonProps['variant']}
      size={media.sm ? 'sm' : 'md'}
      gameVariant={(variant || $variant) as GameVariant}
      {...props}
    />
  );
};

type VariantProp = { $variant?: string };

export function LastPlayedCard({
  className,
  style,
  $isAnimating = false,
  $variant,
  $cardType: _cardType,
  children,
  ...props
}: {
  className?: string;
  style?: CSSProperties;
  $isAnimating?: boolean;
  $cardType?: unknown;
  children?: ReactNode;
} & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const config = getVariantStyles($variant).cards;
  const borderColor = config.borderEffect.split(' ')[2] || config.borderEffect;
  const variantStyles = resolveVariantStyles(config.getCardStyles?.());
  return (
    <div
      className={cx(
        'box-border absolute left-0 top-0 w-full h-full z-[10] cursor-default transition-transform duration-150 ease-out hover:scale-[1.05]',
        className,
      )}
      style={{
        boxShadow: `0 10px 30px rgba(0,0,0,0.5), ${config.glowEffect}`,
        ...style,
      }}
      {...props}
    >
      <div
        className={cx(
          CARD_SURFACE_CLASS,
          'w-full h-full bg-[var(--background)]',
        )}
        style={{
          borderColor,
          borderWidth: 2,
          transform: $isAnimating ? 'rotateY(180deg) scale(1.1)' : undefined,
          ...variantStyles.style,
        }}
      >
        {children}
      </div>
    </div>
  );
}

const CARDS_GRID_LAYOUT_CLASS = {
  grid: 'flex flex-row flex-wrap',
  'grid-3': 'grid grid-cols-3',
  'grid-4': 'grid grid-cols-4',
  'grid-5': 'grid grid-cols-5',
  'grid-6': 'grid grid-cols-6',
  linear: 'flex flex-row flex-nowrap overflow-x-auto pb-2 justify-start gap-2',
  list: 'flex-col gap-2',
} as const;

export function CardsGrid({
  className,
  $layout,
  ...props
}: {
  className?: string;
  $layout?: keyof typeof CARDS_GRID_LAYOUT_CLASS;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'box-border flex flex-row items-stretch flex-wrap gap-3 justify-center p-2 max-[800px]:flex-row max-[800px]:flex-nowrap max-[800px]:overflow-x-auto max-[800px]:py-2 max-[800px]:px-2 max-[800px]:gap-2 max-[800px]:justify-start',
        $layout ? CARDS_GRID_LAYOUT_CLASS[$layout] : undefined,
        className,
      )}
      {...props}
    />
  );
}

export function DeckCard({
  className,
  style,
  $variant,
  ...props
}: { className?: string; style?: CSSProperties } & VariantProp &
  HTMLAttributes<HTMLDivElement>) {
  const config = getVariantStyles($variant).cards;
  const variantStyles = resolveVariantStyles(config.getDeckStyles?.());
  return (
    <BaseCard
      className={cx(
        'w-full h-full border-solid opacity-[1] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)]',
        className,
      )}
      style={
        {
          '--card-hover-scale': '1.02',
          '--card-press-scale': '1',
          borderColor: config.deckBorderColor,
          boxShadow: `3px 3px 0 ${config.deckBorderColor}40, 6px 6px 0 ${config.deckBorderColor}20`,
          ...variantStyles.style,
          ...style,
        } as CSSProperties
      }
      $variant={$variant}
      {...props}
    />
  );
}
