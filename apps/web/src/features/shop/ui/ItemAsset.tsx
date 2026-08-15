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
        className="flex flex-col items-center justify-center"
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
    // Banner preview: a wide rounded panel — banners now fill the full
    // mannequin stage backdrop, so the catalog tile mirrors that shape
    // rather than the avatar disc. Solid hex → backgroundColor;
    // gradient string → backgroundImage.
    const value = item.colorValue ?? '#1e293b';
    return (
      <div
        className="flex flex-col items-center justify-center"
        data-testid={`shop-asset-${item.id}`}
      >
        <div
          className="flex flex-col items-stretch border border-[rgba(255,255,255,0.18)]"
          style={{
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
    // Frame preview: a donut/ring — frames wrap the avatar disc on the
    // mannequin stage. Outer circle picks up the colorValue, inner circle
    // punches out a dark hole so the ring reads as a border, not a fill.
    const value = item.colorValue ?? '#94a3b8';
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ position: 'relative' }}
        data-testid={`shop-asset-${item.id}`}
      >
        <div
          className="flex flex-col items-stretch absolute inset-0"
          style={{
            borderRadius: size / 2,
            ...(value.includes('gradient')
              ? { backgroundImage: value }
              : { backgroundColor: value }),
          }}
        />
        <div
          className="flex flex-col items-stretch bg-[rgba(15,23,42,0.95)] relative z-[1]"
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
    // Game skin preview: a rounded square swatch with the colorValue,
    // styled like a mini "game panel" with a thin top stripe to suggest
    // a window chrome. game_skin has no live render path yet (schema-
    // only), so the catalog tile is the only place it surfaces and a
    // plain colored panel reads clearly.
    const value = item.colorValue ?? '#1e293b';
    return (
      <div
        className="flex flex-col items-center justify-center"
        data-testid={`shop-asset-${item.id}`}
      >
        <div
          className="flex flex-col items-stretch border border-[rgba(255,255,255,0.18)] overflow-hidden"
          style={{
            borderRadius: Math.round(size * 0.16),
            ...(value.includes('gradient')
              ? { backgroundImage: value }
              : { backgroundColor: value }),
          }}
        >
          <div
            className="flex flex-col items-stretch w-full bg-[rgba(0,0,0,0.35)]"
            style={{ height: Math.round(size * 0.16) }}
          />
        </div>
      </div>
    );
  }

  if (item.category === 'aura') {
    // Aura preview: a soft glow ring driven by colorValue. Solid hex
    // becomes a radial halo; a gradient is rendered behind a translucent
    // disc so the gradient bleeds through as the aura color.
    const value = item.colorValue ?? '#cbd5e1';
    const haloStyle: React.CSSProperties = value.includes('gradient')
      ? { backgroundImage: value, filter: 'blur(8px)', opacity: 0.65 }
      : {
          backgroundImage: `radial-gradient(circle, ${value} 0%, transparent 70%)`,
          opacity: 0.85,
        };
    return (
      <div
        className="flex flex-col items-center justify-center"
        style={{ position: 'relative' }}
        data-testid={`shop-asset-${item.id}`}
      >
        <div
          className="flex flex-col items-stretch"
          style={{ ...haloStyle, borderRadius: size / 2 }}
        />
        <div
          className="flex flex-col items-stretch border border-[rgba(255,255,255,0.22)] bg-[rgba(15,23,42,0.85)]"
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
    // Background preview: a filled rounded disc showing the colorValue wash
    // (solid hex or gradient) the way it sits behind the avatar art.
    const value = item.colorValue ?? '#1e293b';
    return (
      <div
        className="flex flex-col items-center justify-center"
        data-testid={`shop-asset-${item.id}`}
      >
        <div
          className="flex flex-col items-stretch border border-[rgba(255,255,255,0.18)]"
          style={{
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
        className="flex flex-col items-center justify-center"
        data-testid={`shop-asset-${item.id}`}
      >
        <div
          className="flex flex-col items-stretch"
          style={{
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
      className="flex flex-col items-center justify-center"
      data-testid={`shop-asset-${item.id}`}
    >
      <Image
        src={item.assetUrl}
        alt={`${item.nameKey} preview`}
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
        priority={priority}
        unoptimized
      />
    </div>
  );
}
