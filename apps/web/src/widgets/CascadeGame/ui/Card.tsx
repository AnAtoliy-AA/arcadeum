'use client';

import { memo } from 'react';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useCascadeTheme } from '../lib/CascadeThemeContext';
import type { CascadeCard, CascadeVariant } from '../types';
import styles from './CascadeGame.module.css';

interface CardProps {
  card: CascadeCard;
  faceDown?: boolean;
  playable?: boolean;
  selected?: boolean;
  disabled?: boolean;
  /**
   * Visually muted but still interactive — used for unplayable cards on the
   * player's turn so a click can trigger the "illegal move" shake.
   */
  dimmed?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

const SIZES: Record<
  NonNullable<CardProps['size']>,
  { w: number; h: number; glyph: number; corner: number }
> = {
  sm: { w: 50, h: 74, glyph: 22, corner: 12 },
  md: { w: 66, h: 98, glyph: 30, corner: 15 },
  lg: { w: 92, h: 138, glyph: 42, corner: 19 },
};

function CardImpl({
  card,
  faceDown = false,
  playable = false,
  selected = false,
  disabled = false,
  dimmed = false,
  onClick,
  size = 'md',
  ariaLabel,
}: CardProps) {
  const theme = useCascadeTheme();
  const { t } = useTranslation();
  const dims = SIZES[size];

  const isClickable = !!onClick && !disabled;
  const isWild =
    !faceDown && (card.kind === 'WILD' || card.kind === 'WILD_DRAW_FOUR');
  const faceColor = faceDown ? theme.surface : theme.palette[card.color];
  const symbol = renderSymbol(card, theme.symbols);
  const resolvedLabel =
    ariaLabel ?? describeCard(card, faceDown, theme.variant, t);

  // Action/wild glyphs are wider than digits, so they're set a touch smaller;
  // the ghost layer scales off that same base so depth stays proportional.
  const glyphSize = card.kind === 'NUMBER' ? dims.glyph : dims.glyph * 0.82;

  const className = [
    styles.card,
    faceDown && styles.faceDown,
    isWild && styles.wild,
    isClickable && styles.clickable,
    playable && styles.playable,
    selected && styles.selected,
    !faceDown && (dimmed || disabled) && styles.disabled,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={disabled || !isClickable}
      aria-label={resolvedLabel}
      aria-pressed={selected || undefined}
      className={className}
      style={
        {
          width: dims.w,
          height: dims.h,
          '--card-bg': faceColor,
        } as React.CSSProperties
      }
    >
      {faceDown ? (
        <span aria-hidden="true" className={styles.backMark}>
          <span style={{ fontSize: glyphSize * 0.7 }}>
            {theme.symbols.WILD}
          </span>
        </span>
      ) : (
        <>
          <span
            aria-hidden="true"
            className={styles.ghost}
            style={{ fontSize: glyphSize * 1.9 }}
          >
            {symbol}
          </span>
          <span
            aria-hidden="true"
            className={`${styles.corner} ${styles.cornerTL}`}
            style={{ fontSize: dims.corner }}
          >
            {symbol}
          </span>
          <span
            aria-hidden="true"
            className={styles.centerGlyph}
            style={{ fontSize: glyphSize }}
          >
            {symbol}
          </span>
          <span
            aria-hidden="true"
            className={`${styles.corner} ${styles.cornerBR}`}
            style={{ fontSize: dims.corner }}
          >
            {symbol}
          </span>
        </>
      )}
    </button>
  );
}

function renderSymbol(
  card: CascadeCard,
  symbols: ReturnType<typeof useCascadeTheme>['symbols'],
): string {
  if (card.kind === 'NUMBER') return String(card.value ?? '');
  return symbols[card.kind];
}

function describeCard(
  card: CascadeCard,
  faceDown: boolean,
  variant: CascadeVariant,
  t: (key: TranslationKey) => string,
): string {
  if (faceDown) return t('games.cascade_v1.hiddenCard');
  if (card.kind === 'NUMBER')
    return `${t(`games.cascade_v1.cardColors.${card.color}` as TranslationKey)} ${card.value}`;
  const themed = t(themedCardKey(variant, card.kind));
  if (card.kind === 'WILD' || card.kind === 'WILD_DRAW_FOUR') {
    return themed;
  }
  return `${t(`games.cascade_v1.cardColors.${card.color}` as TranslationKey)} ${themed}`;
}

function themedCardKey(
  variant: CascadeVariant,
  kind: Exclude<CascadeCard['kind'], 'NUMBER'>,
): TranslationKey {
  return `games.cascade_v1.themedCards.${variant}.${kind}` as TranslationKey;
}

export const Card = memo(CardImpl);
