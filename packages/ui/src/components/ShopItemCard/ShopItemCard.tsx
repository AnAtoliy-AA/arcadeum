'use client';

import { memo } from 'react';
import type { ReactElement } from 'react';
import { RarityBorder, type ShopRarity } from '../RarityBorder/RarityBorder';
import { cx } from '../../utils/cx';

export type ShopItemCardPriceCurrency = 'coins' | 'gems';

export interface ShopItemCardProps {
  itemId: string;
  name: string;
  rarity: ShopRarity;
  assetUrl: string;
  /**
   * Optional CSS color (hex or linear-gradient) for `name_color` items —
   * rendered as a colored preview swatch in place of the image. Other
   * categories should leave this unset and pass an asset URL instead.
   */
  colorValue?: string | null;
  priceAmount: number;
  priceCurrency: ShopItemCardPriceCurrency;
  owned?: boolean;
  equipped?: boolean;
  disabled?: boolean;
  freeLabel?: string;
  ownedLabel?: string;
  equippedLabel?: string;
  onClick?: () => void;
  className?: string;
}

function cardSurfaceClasses(disabled?: boolean): string {
  return cx(
    'flex flex-col gap-3 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] p-3 transition-[transform,background-color] duration-200 ease-out',
    disabled
      ? 'cursor-not-allowed opacity-60 hover:bg-[var(--glassBg)] active:scale-100'
      : 'cursor-pointer hover:bg-[var(--glassBgHover)] active:scale-[0.98]',
  );
}

const PreviewSlotClasses = [
  'relative',
  'flex',
  'aspect-square',
  'w-full',
  'items-center',
  'justify-center',
  'overflow-hidden',
  'rounded-lg',
  'bg-[var(--backgroundHover)]',
].join(' ');

const RarityBadgeBaseClasses = [
  'absolute',
  'left-2',
  'top-2',
  'rounded-lg',
  'px-2',
  'py-[2px]',
  'text-[10px]',
  'font-bold',
  'uppercase',
  'tracking-[0.6px]',
].join(' ');

const RarityBadgeToneClasses: Record<ShopRarity, string> = {
  common: 'bg-[rgba(120,120,120,0.85)] text-[#f5f7ff]',
  rare: 'bg-[rgba(59,130,246,0.85)] text-[#f5f7ff]',
  epic: 'bg-[rgba(168,85,247,0.85)] text-[#f5f7ff]',
  legendary: 'bg-[rgba(250,204,21,0.85)] text-[#0f172a]',
};

const StateChipBaseClasses = [
  'rounded-lg',
  'px-2',
  'py-1',
  'text-[10px]',
  'font-bold',
  'uppercase',
  'tracking-[0.6px]',
].join(' ');

const StateChipToneClasses: Record<'neutral' | 'success', string> = {
  neutral: 'bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-[var(--textSecondary)]',
  success: 'bg-[rgba(16,185,129,0.18)] text-[#10b981]',
};

const PriceCurrencyClasses: Record<ShopItemCardPriceCurrency, string> = {
  coins: 'text-[#fbbf24]',
  gems: 'text-[#a78bfa]',
};

function currencyGlyph(currency: ShopItemCardPriceCurrency): string {
  return currency === 'coins' ? '🪙' : '💎';
}

export const ShopItemCard = memo(function ShopItemCard({
  itemId,
  name,
  rarity,
  assetUrl,
  colorValue,
  priceAmount,
  priceCurrency,
  owned,
  equipped,
  disabled,
  freeLabel,
  ownedLabel,
  equippedLabel,
  onClick,
  className,
}: ShopItemCardProps): ReactElement {
  const handleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  return (
    <RarityBorder rarity={rarity}>
      <div
        onClick={handleClick}
        data-testid={`shop-item-card-${itemId}`}
        className={cx(cardSurfaceClasses(disabled), className)}
      >
        <div className={PreviewSlotClasses}>
          {colorValue ? (
            // Name-color items render the equippable color directly. The big
            // sample text doubles as a legibility check — gradients that look
            // great in the player's lobby may wash out at the chip level.
            <div
              data-testid={`shop-item-color-${itemId}`}
              style={{
                width: '70%',
                height: '70%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: '1px',
                backgroundImage: colorValue.startsWith('linear-gradient')
                  ? colorValue
                  : undefined,
                color: colorValue.startsWith('linear-gradient')
                  ? 'transparent'
                  : colorValue,
                WebkitBackgroundClip: colorValue.startsWith('linear-gradient')
                  ? 'text'
                  : undefined,
                backgroundClip: colorValue.startsWith('linear-gradient')
                  ? 'text'
                  : undefined,
                WebkitTextFillColor: colorValue.startsWith('linear-gradient')
                  ? 'transparent'
                  : undefined,
                filter: equipped
                  ? 'drop-shadow(0 0 8px rgba(16,185,129,0.6))'
                  : undefined,
              }}
            >
              Aa
            </div>
          ) : (
            <img
              src={assetUrl}
              alt={name}
              data-testid={`shop-item-image-${itemId}`}
              style={{
                width: '70%',
                height: '70%',
                objectFit: 'contain',
                filter: equipped
                  ? 'drop-shadow(0 0 8px rgba(16,185,129,0.6))'
                  : undefined,
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <span
            className={cx(RarityBadgeBaseClasses, RarityBadgeToneClasses[rarity])}
          >
            {rarity}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span
            className="line-clamp-1 text-[18px] font-bold text-[var(--color)]"
            data-testid={`shop-item-name-${itemId}`}
          >
            {name}
          </span>
          <div className="flex flex-row items-center justify-between">
            <span
              className={cx(
                'text-[18px] font-bold',
                PriceCurrencyClasses[priceCurrency],
              )}
              data-testid={`shop-item-price-${itemId}`}
            >
              {priceAmount === 0
                ? (freeLabel ?? 'Free')
                : `${currencyGlyph(priceCurrency)} ${priceAmount}`}
            </span>
            {equipped ? (
              <span
                className={cx(StateChipBaseClasses, StateChipToneClasses.success)}
                data-testid={`shop-item-state-${itemId}`}
              >
                {equippedLabel ?? 'Equipped'}
              </span>
            ) : owned ? (
              <span
                className={cx(StateChipBaseClasses, StateChipToneClasses.neutral)}
                data-testid={`shop-item-state-${itemId}`}
              >
                {ownedLabel ?? 'Owned'}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </RarityBorder>
  );
});
