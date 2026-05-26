'use client';

import { memo } from 'react';
import { useCascadeTheme } from '../lib/CascadeThemeContext';
import type { CascadeCard } from '../types';

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

const SIZES: Record<NonNullable<CardProps['size']>, { w: number; h: number; font: number }> = {
  sm: { w: 48, h: 70, font: 14 },
  md: { w: 64, h: 96, font: 18 },
  lg: { w: 88, h: 132, font: 24 },
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
  const dims = SIZES[size];

  const isClickable = !!onClick && !disabled;
  const bg = faceDown ? theme.surface : theme.palette[card.color];
  const symbol = renderSymbol(card, theme.symbols);

  return (
    <button
      type="button"
      onClick={isClickable ? onClick : undefined}
      disabled={disabled || !isClickable}
      aria-label={ariaLabel ?? describeCard(card, faceDown)}
      aria-pressed={selected || undefined}
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: Math.round(dims.w * 0.14),
        background: bg,
        color: theme.cardText,
        border: `2px solid ${
          selected
            ? '#fbbf24'
            : playable
              ? 'rgba(255, 255, 255, 0.85)'
              : theme.cardBorder
        }`,
        boxShadow: playable
          ? '0 0 0 2px rgba(251, 191, 36, 0.4), 0 4px 12px rgba(0,0,0,0.35)'
          : '0 2px 8px rgba(0,0,0,0.25)',
        cursor: isClickable ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: dims.font,
        fontWeight: 800,
        letterSpacing: -0.5,
        padding: 0,
        transition:
          'transform 120ms ease, box-shadow 200ms ease, border-color 120ms ease',
        transform: selected ? 'translateY(-8px)' : 'translateY(0)',
        opacity: disabled && !faceDown ? 0.55 : 1,
        userSelect: 'none',
      }}
    >
      <span aria-hidden="true">{faceDown ? '✦' : symbol}</span>
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

function describeCard(card: CascadeCard, faceDown: boolean): string {
  if (faceDown) return 'Hidden card';
  if (card.kind === 'NUMBER') return `${colorName(card.color)} ${card.value}`;
  if (card.kind === 'WILD') return 'Wild';
  if (card.kind === 'WILD_DRAW_FOUR') return 'Wild draw four';
  return `${colorName(card.color)} ${card.kind.replace('_', ' ').toLowerCase()}`;
}

function colorName(c: CascadeCard['color']): string {
  return { R: 'Red', Y: 'Yellow', G: 'Green', B: 'Blue', W: 'Wild' }[c];
}

export const Card = memo(CardImpl);
