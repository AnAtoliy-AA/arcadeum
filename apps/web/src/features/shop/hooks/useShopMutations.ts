'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  equipItemAction,
  purchaseItemAction,
  sellItemAction,
  unequipItemAction,
  type ShopActionResult,
} from '../server/shop.actions';
import type {
  EquippedView,
  PurchaseResult,
  SellResult,
  ShopCategory,
} from '../server/shop.types';

const INVENTORY_KEY = ['shop', 'inventory'] as const;
const BALANCE_KEY = ['wallet', 'balance'] as const;

export function usePurchase() {
  const qc = useQueryClient();
  return useMutation<
    ShopActionResult<PurchaseResult>,
    Error,
    { itemId: string; purchaseId: string }
  >({
    mutationFn: ({ itemId, purchaseId }) =>
      purchaseItemAction(itemId, purchaseId),
    onSuccess: (result) => {
      if (result.ok) {
        void qc.invalidateQueries({ queryKey: INVENTORY_KEY });
        void qc.invalidateQueries({ queryKey: BALANCE_KEY });
      }
    },
  });
}

export function useSellBack() {
  const qc = useQueryClient();
  return useMutation<
    ShopActionResult<SellResult>,
    Error,
    { purchaseId: string }
  >({
    mutationFn: ({ purchaseId }) => sellItemAction(purchaseId),
    onSuccess: (result) => {
      if (result.ok) {
        void qc.invalidateQueries({ queryKey: INVENTORY_KEY });
        void qc.invalidateQueries({ queryKey: BALANCE_KEY });
      }
    },
  });
}

export function useEquip() {
  const qc = useQueryClient();
  return useMutation<
    ShopActionResult<{ equipped: EquippedView }>,
    Error,
    { itemId: string }
  >({
    mutationFn: ({ itemId }) => equipItemAction(itemId),
    onSuccess: (result) => {
      if (result.ok) {
        void qc.invalidateQueries({ queryKey: INVENTORY_KEY });
      }
    },
  });
}

export function useUnequip() {
  const qc = useQueryClient();
  return useMutation<
    ShopActionResult<{ equipped: EquippedView }>,
    Error,
    { category: ShopCategory }
  >({
    mutationFn: ({ category }) => unequipItemAction(category),
    onSuccess: (result) => {
      if (result.ok) {
        void qc.invalidateQueries({ queryKey: INVENTORY_KEY });
      }
    },
  });
}
