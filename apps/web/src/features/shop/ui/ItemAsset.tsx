'use client';

import Image from 'next/image';
import { AVATAR_SPRITE_MAP, BADGE_SPRITE_MAP } from '@arcadeum/ui';
import { nameColorRenderProps } from '../lib/nameColor';
import type { EffectiveShopItem } from '../server/shop.types';

export interface ItemAssetProps {
  item: EffectiveShopItem;
  size: number;
  /**
   * Set on the hero / mannequin stage where the asset is above the fold —
   * forwards to next/image's `priority`, which sets `loading="eager"` and
   * pre-warms LCP. Default `false` so the catalog cards stay lazy.
   */
  priority?: boolean;
}

// Every image-bearing catalog entry ships with an `assetUrl` today (audited
// against apps/be/src/shop/lib/shop-catalog.ts). Categories that render from
// a `colorValue` swatch instead — name_color (a glyph), banner (a wide
// gradient tile), and aura (a soft glow ring) — branch above the Image
// fallback. If a future image-bearing item lands without an asset, the
// developer should see an empty tile in QA and fix the seed data rather
// than ship a placeholder that looks intentional.

export function ItemAsset({ item, size, priority = false }: ItemAssetProps) {
  if (item.category === 'name_color') {
    const props = nameColorRenderProps(item.colorValue ?? null);
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center"
        data-testid={`shop-asset-${item.id}`}
      >
        <span
          className="font-black"
          style={{ fontSize: Math.round(size * 0.55), color: props.color }}
          {...props}
        >
          Aa
        </span>
      </div>
    );
  }

  if (item.category === 'banner') {
    const value = item.colorValue ?? '#1e293b';
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center"
        data-testid={`shop-asset-${item.id}`}
      >
        <div
          className="border border-[rgba(255,255,255,0.18)]"
          style={{
            width: '100%',
            height: Math.round(size * 0.62),
            borderRadius: Math.round(size * 0.12),
            ...(value.includes('gradient')
              ? { backgroundImage: value }
              : { backgroundColor: value }),
          }}
        />
      </div>
    );
  }

  if (item.category === 'frame') {
    const value = item.colorValue ?? '#94a3b8';
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center"
        style={{ position: 'relative' }}
        data-testid={`shop-asset-${item.id}`}
      >
        <div
          className="absolute"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            ...(value.includes('gradient')
              ? { backgroundImage: value }
              : { backgroundColor: value }),
          }}
        />
        <div
          className="relative z-[1] bg-[rgba(15,23,42,0.95)]"
          style={{
            width: Math.round(size * 0.7),
            height: Math.round(size * 0.7),
            borderRadius: Math.round(size * 0.7) / 2,
          }}
        />
      </div>
    );
  }

  if (item.category === 'game_skin') {
    const value = item.colorValue ?? '#1e293b';
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center"
        data-testid={`shop-asset-${item.id}`}
      >
        <div
          className="border border-[rgba(255,255,255,0.18)] overflow-hidden"
          style={{
            width: '100%',
            borderRadius: Math.round(size * 0.16),
            ...(value.includes('gradient')
              ? { backgroundImage: value }
              : { backgroundColor: value }),
          }}
        >
          <div
            className="w-full bg-[rgba(0,0,0,0.35)]"
            style={{ height: Math.round(size * 0.16) }}
          />
        </div>
      </div>
    );
  }

  if (item.category === 'aura') {
    const value = item.colorValue ?? '#cbd5e1';
    const haloStyle: React.CSSProperties = value.includes('gradient')
      ? { backgroundImage: value, filter: 'blur(8px)', opacity: 0.65 }
      : {
          backgroundImage: `radial-gradient(circle, ${value} 0%, transparent 70%)`,
          opacity: 0.85,
        };
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center"
        style={{ position: 'relative' }}
        data-testid={`shop-asset-${item.id}`}
      >
        <div
          style={{
            ...haloStyle,
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
        <div
          className="absolute z-[1] border border-[rgba(255,255,255,0.22)] bg-[rgba(15,23,42,0.85)]"
          style={{
            width: Math.round(size * 0.55),
            height: Math.round(size * 0.55),
            borderRadius: Math.round(size * 0.55) / 2,
          }}
        />
      </div>
    );
  }

  if (item.category === 'background') {
    const value = item.colorValue ?? '#1e293b';
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center"
        data-testid={`shop-asset-${item.id}`}
      >
        <div
          className="border border-[rgba(255,255,255,0.18)]"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            ...(value.includes('gradient')
              ? { backgroundImage: value }
              : { backgroundColor: value }),
          }}
        />
      </div>
    );
  }

  const isAvatar = item.category === 'avatar';
  const isBadge = item.category === 'badge';
  const sprite = isAvatar
    ? AVATAR_SPRITE_MAP[item.assetUrl]
    : isBadge
      ? BADGE_SPRITE_MAP[item.assetUrl]
      : null;

  if (sprite) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center"
        data-testid={`shop-asset-${item.id}`}
      >
        <div
          style={{
            width: size,
            height: size,
            backgroundImage: `url(${sprite.spritesheet})`,
            backgroundSize: `${size * sprite.cols}px auto`,
            backgroundPosition: `-${(sprite.index % sprite.cols) * size}px -${Math.floor(sprite.index / sprite.cols) * size}px`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center"
      data-testid={`shop-asset-${item.id}`}
    >
      <Image
        src={item.assetUrl}
        alt={`${item.nameKey} preview`}
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
        priority={priority}
      />
    </div>
  );
}
