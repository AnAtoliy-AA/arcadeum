import type { CSSProperties, ReactNode } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';
import { Button, type ButtonProps, type GameVariant } from '@arcadeum/ui';
import { Card as BaseCard, CARD_SURFACE_CLASS } from './cards-base';
import { getVariantStyles } from './variants';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

export * from './cards-base';

export type ActionButtonProps = ButtonProps & {
  variant?: string;
  accent?: string;
};

export const ActionButton = ({
  variant,
  accent,
  disabled,
  onClick,
  children,
  'data-testid': testId,
}: ActionButtonProps) => {
  const media = useMediaQuery();
  return (
    <Button
      variant={(variant || 'primary') as ButtonProps['variant']}
      size={media.sm ? 'sm' : 'md'}
      gameVariant={(variant || accent) as GameVariant}
      disabled={disabled}
      onClick={onClick}
      data-testid={testId}
    >
      {children}
    </Button>
  );
};

export function LastPlayedCard({
  className,
  style,
  isAnimating = false,
  variant,
  cardType: _cardType,
  'data-testid': testId,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  isAnimating?: boolean;
  variant?: string;
  cardType?: unknown;
  'data-testid'?: string;
  children?: ReactNode;
}) {
  const cards = getVariantStyles(variant).cards;
  return (
    <div
      className={cx(
        'absolute left-0 top-0 w-full h-full z-[10] cursor-default transition-transform duration-150 ease-out hover:scale-[1.05]',
        className,
      )}
      style={{
        boxShadow: `0 10px 30px rgba(0,0,0,0.5), ${cards.glowEffect}`,
        ...style,
      }}
      data-testid={testId}
    >
      <div
        className={cx(
          CARD_SURFACE_CLASS,
          'w-full h-full bg-[var(--background)]',
        )}
        style={{
          border: cards.borderEffect,
          transform: isAnimating ? 'rotateY(180deg) scale(1.1)' : undefined,
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
  layout,
  children,
}: {
  className?: string;
  layout?: keyof typeof CARDS_GRID_LAYOUT_CLASS;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-row items-stretch flex-wrap gap-3 justify-center p-2 max-[800px]:flex-row max-[800px]:flex-nowrap max-[800px]:overflow-x-auto max-[800px]:py-2 max-[800px]:px-2 max-[800px]:gap-2 max-[800px]:justify-start',
        layout ? CARDS_GRID_LAYOUT_CLASS[layout] : undefined,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DeckCard({
  className,
  style,
  variant,
  'data-testid': testId,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  variant?: string;
  'data-testid'?: string;
  children?: ReactNode;
}) {
  const config = getVariantStyles(variant).cards;
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
          ...style,
        } as CSSProperties
      }
      variant={variant}
      data-testid={testId}
    >
      {children}
    </BaseCard>
  );
}
