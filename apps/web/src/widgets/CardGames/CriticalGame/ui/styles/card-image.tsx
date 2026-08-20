import React from 'react';
import { CARD_SPRITE_MAP, SPRITE_GRID_SIZE } from '../../lib/constants';
import { getVariantStyles } from './variants';

interface CardImageProps {
  variant: string;
  cardType?: string;
  faceDown?: boolean;
}

/**
 * True when the given variant ships a sprite sheet AND the cardType has a
 * mapped sprite index. Callers (e.g. `HandCard`) use this to choose between
 * rendering the sprite and a role-keyed fallback glyph, so the two never
 * stack and bleed through each other.
 */
export function hasArtFor(
  variant: string | undefined,
  cardType: string,
): boolean {
  const spriteUrl = getVariantStyles(variant).cards.getCardSpriteUrl?.(
    variant ?? '',
  );
  if (!spriteUrl) return false;
  return Object.prototype.hasOwnProperty.call(CARD_SPRITE_MAP, cardType);
}

export function CardImage({
  variant,
  cardType = '',
  faceDown = false,
}: CardImageProps) {
  const spriteUrl = getVariantStyles(variant).cards.getCardSpriteUrl?.(variant);

  // No sprite sheet for this variant (e.g. default/unthemed) — render nothing
  if (!spriteUrl) return null;

  const spriteIndex = faceDown ? 0 : (CARD_SPRITE_MAP[cardType] ?? 0);
  const col = spriteIndex % SPRITE_GRID_SIZE;
  const row = Math.floor(spriteIndex / SPRITE_GRID_SIZE);

  // Use percentage-based sizing so sprite renders correctly at any card size.
  // backgroundSize: 700% means the full sheet is 7× the card's width/height.
  // backgroundPosition %: CSS maps 0%→0, 100%→(bgSize - containerSize),
  // so col/(SPRITE_GRID_SIZE-1)*100% correctly selects each column.
  const colPct =
    SPRITE_GRID_SIZE > 1 ? (col / (SPRITE_GRID_SIZE - 1)) * 100 : 0;
  const rowPct =
    SPRITE_GRID_SIZE > 1 ? (row / (SPRITE_GRID_SIZE - 1)) * 100 : 0;
  const sheetPct = SPRITE_GRID_SIZE * 100; // 700%

  const style: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    backgroundImage: `url(${spriteUrl})`,
    backgroundSize: `${sheetPct}% ${sheetPct}%`,
    backgroundPosition: `${colPct}% ${rowPct}%`,
    backgroundRepeat: 'no-repeat',
  };

  return <div style={style} />;
}
