import React from 'react';
import { CARD_SPRITE_MAP } from './card-sprites';
import { getVariantStyles } from './variants';

const TILE_SIZE = 171;
const GRID_SIZE = 7;
const SHEET_SIZE = TILE_SIZE * GRID_SIZE; // 1197

interface CardImageProps {
  variant: string;
  cardType?: string;
  faceDown?: boolean;
}

export function CardImage({ variant, cardType = '', faceDown = false }: CardImageProps) {
  const spriteUrl = getVariantStyles(variant).cards.getCardSpriteUrl?.(variant);

  // No sprite sheet for this variant (e.g. default/unthemed) — render nothing
  if (!spriteUrl) return null;

  const spriteIndex = faceDown ? 0 : (CARD_SPRITE_MAP[cardType] ?? 0);
  const col = spriteIndex % GRID_SIZE;
  const row = Math.floor(spriteIndex / GRID_SIZE);

  const style: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    backgroundImage: `url(${spriteUrl})`,
    backgroundSize: `${SHEET_SIZE}px ${SHEET_SIZE}px`,
    backgroundPosition: `-${col * TILE_SIZE}px -${row * TILE_SIZE}px`,
    backgroundRepeat: 'no-repeat',
  };

  return <div style={style} />;
}
