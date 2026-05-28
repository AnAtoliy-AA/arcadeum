'use client';

import { useEffect, useMemo, useState } from 'react';
import { loadCatalog } from '../lib/catalogCache';
import type { EffectiveShopItem } from '../server/shop.types';

export interface EquippedCosmetics {
  avatarUrl: string | null;
  avatarItem: EffectiveShopItem | null;
  badgeUrl: string | null;
  badgeItem: EffectiveShopItem | null;
  /**
   * Resolved CSS color for the equipped name color (hex or linear-gradient).
   * Apply as `color={nameColor}` on plain hex, or as a `background` clip-text
   * style on gradients — see `applyNameColor` in the name-color helper for
   * the canonical render strategy.
   */
  nameColor: string | null;
  nameColorItem: EffectiveShopItem | null;
  /** CSS color (hex or linear-gradient) for the equipped frame ring. */
  frameColor: string | null;
  frameItem: EffectiveShopItem | null;
  /** CSS color (hex or linear-gradient) for the equipped aura halo. */
  auraColor: string | null;
  auraItem: EffectiveShopItem | null;
  /** CSS color (hex or linear-gradient) for the equipped banner backdrop. */
  bannerColor: string | null;
  bannerItem: EffectiveShopItem | null;
  /** Catalog item for the equipped game skin (used for SKIN chip rendering). */
  skinItem: EffectiveShopItem | null;
  /** Pre-shaped skin chip prop ready for `<PlayerAvatar skinChip={…} />`.
   *  `label` is the raw i18n key — consumers translate it. */
  skinChip: { id: string; label: string } | null;
  /** Catalog item for the equipped avatar background. */
  backgroundItem: EffectiveShopItem | null;
  /** CSS color (hex or linear-gradient) for the equipped avatar background. */
  backgroundColor: string | null;
}

const EMPTY_MAP: ReadonlyMap<string, EffectiveShopItem> = new Map();

/**
 * Resolve a user's equipped item ids (from the session snapshot or any
 * user-view payload) to their asset URLs via the public shop catalog.
 *
 * Returns nulls until the catalog has loaded, then derives the resolved
 * values at render time. Catalog is module-level cached (see
 * `catalogCache.ts`) so this hook does at most one fetch per page
 * session even with many consumers.
 */
export function useEquippedCosmetics(args: {
  equippedAvatarId: string | null | undefined;
  equippedBadgeId: string | null | undefined;
  equippedNameColorId?: string | null | undefined;
  equippedFrameId?: string | null | undefined;
  equippedAuraId?: string | null | undefined;
  equippedBannerId?: string | null | undefined;
  equippedGameSkinId?: string | null | undefined;
  equippedBackgroundId?: string | null | undefined;
}): EquippedCosmetics {
  const {
    equippedAvatarId,
    equippedBadgeId,
    equippedNameColorId,
    equippedFrameId,
    equippedAuraId,
    equippedBannerId,
    equippedGameSkinId,
    equippedBackgroundId,
  } = args;
  const [catalogMap, setCatalogMap] =
    useState<ReadonlyMap<string, EffectiveShopItem>>(EMPTY_MAP);

  useEffect(() => {
    let mounted = true;
    void loadCatalog().then((catalog) => {
      if (!mounted) return;
      setCatalogMap(new Map(catalog.map((item) => [item.id, item])));
    });
    return () => {
      mounted = false;
    };
  }, []);

  return useMemo<EquippedCosmetics>(() => {
    const avatar = equippedAvatarId
      ? (catalogMap.get(equippedAvatarId) ?? null)
      : null;
    const badge = equippedBadgeId
      ? (catalogMap.get(equippedBadgeId) ?? null)
      : null;
    const nameColor = equippedNameColorId
      ? (catalogMap.get(equippedNameColorId) ?? null)
      : null;
    const frame = equippedFrameId
      ? (catalogMap.get(equippedFrameId) ?? null)
      : null;
    const aura = equippedAuraId
      ? (catalogMap.get(equippedAuraId) ?? null)
      : null;
    const banner = equippedBannerId
      ? (catalogMap.get(equippedBannerId) ?? null)
      : null;
    const skin = equippedGameSkinId
      ? (catalogMap.get(equippedGameSkinId) ?? null)
      : null;
    const background = equippedBackgroundId
      ? (catalogMap.get(equippedBackgroundId) ?? null)
      : null;
    return {
      avatarItem: avatar,
      avatarUrl: avatar?.assetUrl ?? null,
      badgeItem: badge,
      badgeUrl: badge?.assetUrl ?? null,
      nameColorItem: nameColor,
      nameColor: nameColor?.colorValue ?? null,
      frameItem: frame,
      frameColor: frame?.colorValue ?? null,
      auraItem: aura,
      auraColor: aura?.colorValue ?? null,
      bannerItem: banner,
      bannerColor: banner?.colorValue ?? null,
      skinItem: skin,
      skinChip: skin ? { id: skin.id, label: skin.nameKey } : null,
      backgroundItem: background,
      backgroundColor: background?.colorValue ?? null,
    };
  }, [
    equippedAvatarId,
    equippedBadgeId,
    equippedNameColorId,
    equippedFrameId,
    equippedAuraId,
    equippedBannerId,
    equippedGameSkinId,
    equippedBackgroundId,
    catalogMap,
  ]);
}
