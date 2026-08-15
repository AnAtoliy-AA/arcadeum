'use client';

import Image from 'next/image';

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
  // Determine text font size based on preview square size
  const fontSize = size >= 48 ? '$5' : size >= 32 ? '$3' : '$1';

  return (
    <div className="box-border flex flex-col bg-[var(--backgroundFocus)] rounded-lg items-center justify-center overflow-hidden">
      {colorValue ? (
        <span
          className="box-border font-extrabold"
          style={{ fontSize: fontSize }}
        >
          Aa
        </span>
      ) : assetUrl ? (
        <Image
          src={assetUrl}
          alt={itemId}
          width={size}
          height={size}
          unoptimized
          style={{ objectFit: 'contain' }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span className="box-border text-[12px]">?</span>
      )}
    </div>
  );
}
