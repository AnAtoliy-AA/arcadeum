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
}): EquippedCosmetics {
  const { equippedAvatarId, equippedBadgeId, equippedNameColorId } = args;
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
    return {
      avatarItem: avatar,
      avatarUrl: avatar?.assetUrl ?? null,
      badgeItem: badge,
      badgeUrl: badge?.assetUrl ?? null,
      nameColorItem: nameColor,
      nameColor: nameColor?.colorValue ?? null,
    };
  }, [equippedAvatarId, equippedBadgeId, equippedNameColorId, catalogMap]);
}
