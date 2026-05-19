'use client';

import Image from 'next/image';
import { YStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
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
      <YStack
        width={size}
        height={size}
        alignItems="center"
        justifyContent="center"
        data-testid={`shop-asset-${item.id}`}
      >
        <Text
          fontWeight="900"
          fontSize={Math.round(size * 0.55)}
          {...props}
          color={props.color}
        >
          Aa
        </Text>
      </YStack>
    );
  }

  if (item.category === 'banner') {
    // Banner preview: a wide rounded panel — banners now fill the full
    // mannequin stage backdrop, so the catalog tile mirrors that shape
    // rather than the avatar disc. Solid hex → backgroundColor;
    // gradient string → backgroundImage.
    const value = item.colorValue ?? '#1e293b';
    const isGradient = value.includes('gradient');
    return (
      <YStack
        width={size}
        height={size}
        alignItems="center"
        justifyContent="center"
        data-testid={`shop-asset-${item.id}`}
      >
        <YStack
          width={size}
          height={Math.round(size * 0.62)}
          borderRadius={Math.round(size * 0.12)}
          borderWidth={1}
          borderColor="rgba(255,255,255,0.18)"
          style={
            isGradient ? { backgroundImage: value } : { backgroundColor: value }
          }
        />
      </YStack>
    );
  }

  if (item.category === 'frame') {
    // Frame preview: a donut/ring — frames wrap the avatar disc on the
    // mannequin stage. Outer circle picks up the colorValue, inner circle
    // punches out a dark hole so the ring reads as a border, not a fill.
    const value = item.colorValue ?? '#94a3b8';
    const isGradient = value.includes('gradient');
    return (
      <YStack
        width={size}
        height={size}
        alignItems="center"
        justifyContent="center"
        data-testid={`shop-asset-${item.id}`}
        style={{ position: 'relative' }}
      >
        <YStack
          width={size}
          height={size}
          borderRadius={size / 2}
          style={{
            ...(isGradient
              ? { backgroundImage: value }
              : { backgroundColor: value }),
            position: 'absolute',
            inset: 0,
          }}
        />
        <YStack
          width={Math.round(size * 0.7)}
          height={Math.round(size * 0.7)}
          borderRadius={Math.round(size * 0.7) / 2}
          backgroundColor="rgba(15,23,42,0.95)"
          style={{ position: 'relative', zIndex: 1 }}
        />
      </YStack>
    );
  }

  if (item.category === 'aura') {
    // Aura preview: a soft glow ring driven by colorValue. Solid hex
    // becomes a radial halo; a gradient is rendered behind a translucent
    // disc so the gradient bleeds through as the aura color.
    const value = item.colorValue ?? '#cbd5e1';
    const isGradient = value.includes('gradient');
    const haloStyle: React.CSSProperties = isGradient
      ? { backgroundImage: value, filter: 'blur(8px)', opacity: 0.65 }
      : {
          backgroundImage: `radial-gradient(circle, ${value} 0%, transparent 70%)`,
          opacity: 0.85,
        };
    return (
      <YStack
        width={size}
        height={size}
        alignItems="center"
        justifyContent="center"
        data-testid={`shop-asset-${item.id}`}
        style={{ position: 'relative' }}
      >
        <YStack
          width={size}
          height={size}
          borderRadius={size / 2}
          style={{ ...haloStyle, position: 'absolute', inset: 0 }}
        />
        <YStack
          width={Math.round(size * 0.55)}
          height={Math.round(size * 0.55)}
          borderRadius={Math.round(size * 0.55) / 2}
          borderWidth={1}
          borderColor="rgba(255,255,255,0.22)"
          backgroundColor="rgba(15,23,42,0.85)"
          style={{ position: 'relative', zIndex: 1 }}
        />
      </YStack>
    );
  }

  return (
    <YStack
      width={size}
      height={size}
      alignItems="center"
      justifyContent="center"
      data-testid={`shop-asset-${item.id}`}
    >
      <Image
        src={item.assetUrl}
        alt=""
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
        priority={priority}
        unoptimized
      />
    </YStack>
  );
}
