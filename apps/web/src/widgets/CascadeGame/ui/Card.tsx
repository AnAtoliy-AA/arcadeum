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
    disabled && !faceDown && styles.disabled,
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
      {faceDown ? null : (
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
  if (faceDown) return 'Hidden card';
  if (card.kind === 'NUMBER') return `${colorName(card.color)} ${card.value}`;
  // Action / wild cards: resolve to the per-theme name (Eclipse / Banish /
  // Firewall / Block, etc.). Wilds carry the themed name only; non-wild
  // action cards prefix the color so screen-reader users hear "Red Eclipse".
  const themed = t(themedCardKey(variant, card.kind));
  if (card.kind === 'WILD' || card.kind === 'WILD_DRAW_FOUR') {
    return themed;
  }
  return `${colorName(card.color)} ${themed}`;
}

function themedCardKey(
  variant: CascadeVariant,
  kind: Exclude<CascadeCard['kind'], 'NUMBER'>,
): TranslationKey {
  return `games.cascade_v1.themedCards.${variant}.${kind}` as TranslationKey;
}

function colorName(c: CascadeCard['color']): string {
  return { R: 'Red', Y: 'Yellow', G: 'Green', B: 'Blue', W: 'Wild' }[c];
}

export const Card = memo(CardImpl);
