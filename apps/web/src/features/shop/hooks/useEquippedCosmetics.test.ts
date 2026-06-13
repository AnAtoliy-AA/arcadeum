import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEquippedCosmetics } from './useEquippedCosmetics';
import * as catalogCache from '../lib/catalogCache';
import type { EffectiveShopItem } from '../server/shop.types';

vi.mock('../lib/catalogCache');

function item(
  id: string,
  category: EffectiveShopItem['category'],
  colorValue: string,
): EffectiveShopItem {
  return {
    id,
    category,
    rarity: 'common',
    nameKey: `items.${category}.${id}.name`,
    descKey: `items.${category}.${id}.desc`,
    assetUrl: `/assets/${id}.png`,
    colorValue,
    defaultPriceAmount: 0,
    defaultPriceCurrency: 'coins',
    available: true,
    priceAmount: 0,
    priceCurrency: 'coins',
    overridden: false,
  };
}

describe('useEquippedCosmetics', () => {
  beforeEach(() => {
    vi.mocked(catalogCache.loadCatalog).mockResolvedValue([
      item('avatar-1', 'avatar', ''),
      item('badge-1', 'badge', ''),
      item('frame-1', 'frame', '#abcdef'),
      item('aura-1', 'aura', 'linear-gradient(135deg, #1e293b, #334155)'),
      item('banner-1', 'banner', '#0f172a'),
      item('nc-1', 'name_color', '#ff00ff'),
      item('skin-neon', 'game_skin', '#0ff'),
    ]);
  });

  it('returns nulls while catalog is loading', () => {
    const { result } = renderHook(() =>
      useEquippedCosmetics({
        equippedAvatarId: 'avatar-1',
        equippedBadgeId: 'badge-1',
      }),
    );
    expect(result.current.avatarUrl).toBeNull();
    expect(result.current.frameColor).toBeNull();
  });

  it('resolves frame/aura/banner colors from the catalog', async () => {
    const { result } = renderHook(() =>
      useEquippedCosmetics({
        equippedAvatarId: 'avatar-1',
        equippedBadgeId: 'badge-1',
        equippedFrameId: 'frame-1',
        equippedAuraId: 'aura-1',
        equippedBannerId: 'banner-1',
      }),
    );
    await waitFor(() => {
      expect(result.current.frameColor).toBe('#abcdef');
    });
    expect(result.current.auraColor).toContain('linear-gradient');
    expect(result.current.bannerColor).toBe('#0f172a');
    expect(result.current.frameItem?.id).toBe('frame-1');
  });

  it('resolves equippedGameSkinId to skinItem + skinChip label', async () => {
    const { result } = renderHook(() =>
      useEquippedCosmetics({
        equippedAvatarId: null,
        equippedBadgeId: null,
        equippedGameSkinId: 'skin-neon',
      }),
    );
    await waitFor(() => {
      expect(result.current.skinItem?.id).toBe('skin-neon');
    });
    expect(result.current.skinChip).toEqual({
      id: 'skin-neon',
      label: 'items.game_skin.skin-neon.name',
    });
  });

  it('returns null for ids not in the catalog', async () => {
    const { result } = renderHook(() =>
      useEquippedCosmetics({
        equippedAvatarId: null,
        equippedBadgeId: null,
        equippedFrameId: 'missing-id',
      }),
    );
    await waitFor(() => {
      expect(result.current.frameColor).toBeNull();
    });
    expect(result.current.frameItem).toBeNull();
  });
});
