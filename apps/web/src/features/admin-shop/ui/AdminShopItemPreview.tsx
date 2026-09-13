'use client';

import { CosmeticSprite } from '@arcadeum/ui';

interface Props {
  size: number;
  colorValue?: string | null;
  assetUrl?: string | null;
  itemId: string;
}

export function AdminShopItemPreview({
  size,
  colorValue,
  assetUrl,
  itemId,
}: Props) {
  const fontSize = size >= 48 ? '20px' : size >= 32 ? '16px' : '12px';

  return (
    <div className="flex flex-col bg-[var(--backgroundFocus)] rounded-lg items-center justify-center overflow-hidden">
      {colorValue ? (
        <span className="font-extrabold" style={{ fontSize }}>
          Aa
        </span>
      ) : assetUrl ? (
        <CosmeticSprite src={assetUrl} alt={itemId} size={size} />
      ) : (
        <span className="text-[12px]">?</span>
      )}
    </div>
  );
}
