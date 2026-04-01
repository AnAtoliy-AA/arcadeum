import React from 'react';
import { CARD_SPRITE_MAP } from './card-sprites';
import { getVariantStyles } from './variants';

const GRID_SIZE = 7;

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

  // Use percentage-based sizing so sprite renders correctly at any card size.
  // backgroundSize: 700% means the full sheet is 7× the card's width/height.
  // backgroundPosition %: CSS maps 0%→0, 100%→(bgSize - containerSize),
  // so col/(GRID_SIZE-1)*100% correctly selects each column.
  const colPct = GRID_SIZE > 1 ? (col / (GRID_SIZE - 1)) * 100 : 0;
  const rowPct = GRID_SIZE > 1 ? (row / (GRID_SIZE - 1)) * 100 : 0;
  const sheetPct = GRID_SIZE * 100; // 700%

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
