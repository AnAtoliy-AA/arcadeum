'use client';

import { useState, useCallback } from 'react';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { apiClient } from '@/shared/lib/api-client';
import type { EquippedView } from '@/features/shop/server/shop.types';
import {
  equipItemAction,
  unequipItemAction,
} from '@/features/shop/server/shop.actions';
import { syncEquippedToSession } from '@/features/shop/lib/syncEquippedToSession';

export function useMilestoneBadgeEquip() {
  const { snapshot } = useSessionTokens();
  const [pendingBadgeId, setPendingBadgeId] = useState<string | null>(null);

  const handleEquip = useCallback(
    async (badgeId: string) => {
      setPendingBadgeId(badgeId);
      try {
        const data = await apiClient.fetch<EquippedView>('/shop/equip', {
          method: 'POST',
          data: { itemId: badgeId },
          token: snapshot.accessToken ?? undefined,
        });
        syncEquippedToSession(data);
      } catch {
        const res = await equipItemAction(badgeId);
        if (res.ok) {
          syncEquippedToSession(res.data);
        }
      } finally {
        setPendingBadgeId(null);
      }
    },
    [snapshot.accessToken],
  );

  const handleUnequip = useCallback(async () => {
    setPendingBadgeId('unequip');
    try {
      const data = await apiClient.fetch<EquippedView>('/shop/unequip', {
        method: 'POST',
        data: { category: 'badge' },
        token: snapshot.accessToken ?? undefined,
      });
      syncEquippedToSession(data);
    } catch {
      const res = await unequipItemAction('badge');
      if (res.ok) {
        syncEquippedToSession(res.data);
      }
    } finally {
      setPendingBadgeId(null);
    }
  }, [snapshot.accessToken]);

  return {
    equippedBadgeId: snapshot.equippedBadgeId,
    pendingBadgeId,
    handleEquip,
    handleUnequip,
    isLoggedIn: !!snapshot.accessToken,
  };
}
