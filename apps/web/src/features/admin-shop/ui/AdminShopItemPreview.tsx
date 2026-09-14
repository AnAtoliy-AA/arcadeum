'use client';

import { CosmeticSprite } from '@arcadeum/ui';
import { ItemAsset } from '@/features/shop/ui/ItemAsset';
import type {
  EffectiveShopItem,
  ShopCategory,
} from '@/features/shop/server/shop.types';

export interface AdminShopItemPreviewProps {
  item?: EffectiveShopItem | null;
  size?: number;
  colorValue?: string | null;
  assetUrl?: string | null;
  itemId?: string;
  category?: ShopCategory;
}

export function AdminShopItemPreview({
  item,
  size = 32,
  colorValue,
  assetUrl,
  itemId = '',
  category,
}: AdminShopItemPreviewProps) {
  const containerClass =
    size >= 48 ? 'w-12 h-12' : size >= 32 ? 'w-8 h-8' : 'w-6 h-6';

  if (item) {
    return (
      <div
        className={`flex flex-col bg-[var(--backgroundFocus)] rounded-lg items-center justify-center overflow-hidden shrink-0 ${containerClass}`}
      >
        <ItemAsset item={item} size={size} />
      </div>
    );
  }

  const effectiveItem: EffectiveShopItem | null = itemId
    ? {
        id: itemId,
        category: category ?? 'avatar',
        rarity: 'common',
        nameKey: '',
        descKey: '',
        assetUrl: assetUrl ?? '',
        colorValue: colorValue ?? null,
        defaultPriceAmount: 0,
        defaultPriceCurrency: 'coins',
        available: true,
        priceAmount: 0,
        priceCurrency: 'coins',
        overridden: false,
      }
    : null;

  return (
    <div
      className={`flex flex-col bg-[var(--backgroundFocus)] rounded-lg items-center justify-center overflow-hidden shrink-0 ${containerClass}`}
    >
      {effectiveItem ? (
        <ItemAsset item={effectiveItem} size={size} />
      ) : assetUrl ? (
        <CosmeticSprite src={assetUrl} alt={itemId} size={size} />
      ) : (
        <span className="text-xs text-[var(--colorTextSecondary,#a1a1aa)]">
          ?
        </span>
      )}
    </div>
  );
}
