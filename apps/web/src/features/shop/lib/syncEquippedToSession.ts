'use client';

import { useSessionStore } from '@/entities/session/store/sessionStore';
import type { EquippedView } from '../server/shop.types';

/**
 * Push the BE-returned equipped state into the client session snapshot.
 *
 * The header `ProfileMenu` resolves its avatar via `useEquippedCosmetics`,
 * which reads `snapshot.equippedAvatarId` / `equippedBadgeId` from the
 * Zustand session store. Server actions update `User.equipped*Id` in Mongo
 * and `revalidatePath` re-renders /shop, but the session store is purely
 * client-side state — `router.refresh()` does NOT touch it. Without this
 * sync the header keeps the old avatar after a buy/equip/unequip until
 * the user fully reloads (cookie-driven session re-fetch).
 */
export function syncEquippedToSession(equipped: EquippedView): void {
  // `setTokens` merges its input into the existing snapshot; we only pass
  // the equipped fields so nothing else churns.
  void useSessionStore.getState().setTokens({
    equippedAvatarId: equipped.avatar,
    equippedBadgeId: equipped.badge,
    equippedNameColorId: equipped.name_color,
    equippedFrameId: equipped.frame,
    equippedAuraId: equipped.aura,
    equippedBannerId: equipped.banner,
  });
}
