'use client';

import { memo } from 'react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { cx } from '../../utils/cx';

export type ShopRarity = 'common' | 'rare' | 'epic' | 'legendary';

const RARITY_BORDER: Record<ShopRarity, string> = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#facc15',
};

const RARITY_SHADOW: Record<ShopRarity, string> = {
  common: '',
  rare: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]',
  epic: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]',
  legendary: 'shadow-[0_0_12px_rgba(250,204,21,0.4)]',
};

export type RarityBorderProps = {
  rarity: ShopRarity;
  children: ReactNode;
  className?: string;
  testID?: string;
  'data-testid'?: string;
  style?: CSSProperties;
};

export const RarityBorder = memo(function RarityBorder({
  rarity,
  children,
  className,
  testID,
  'data-testid': dataTestId,
  style,
}: RarityBorderProps): ReactElement {
  return (
    <div
      data-testid={dataTestId ?? testID}
      className={cx(
        'flex flex-col rounded-2xl border-2 p-2',
        RARITY_SHADOW[rarity],
        className,
      )}
      style={{ ...style, borderColor: RARITY_BORDER[rarity] }}
    >
      {children}
    </div>
  );
});
