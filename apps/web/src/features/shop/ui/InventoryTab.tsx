'use client';

import { useMemo, useState } from 'react';
import { Button, ShopItemCard, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useEquip, useUnequip } from '../hooks/useShopMutations';
import type {
  EffectiveShopItem,
  EquippedView,
  InventoryItemView,
  WalletBalanceView,
} from '../server/shop.types';
import { SellConfirmDialog, type SellConfirmLabels } from './SellConfirmDialog';

export interface InventoryTabLabels {
  emptyInventory: string;
  equip: string;
  unequip: string;
  sell: string;
  starterTag: string;
  sell_modal: SellConfirmLabels;
}

export interface InventoryTabProps {
  catalog: EffectiveShopItem[];
  inventory: InventoryItemView[];
  equipped: EquippedView;
  balance: WalletBalanceView;
  gemToCoinRate: number;
  labels: InventoryTabLabels;
}

function refundForRow(row: InventoryItemView, gemToCoinRate: number): number {
  if (row.paidAmount === null || row.paidCurrency === null) return 0;
  if (row.paidCurrency === 'coins') return Math.floor(row.paidAmount * 0.5);
  return Math.floor(row.paidAmount * gemToCoinRate * 0.5);
}

export function InventoryTab({
  catalog,
  inventory,
  equipped,
  gemToCoinRate,
  labels,
}: InventoryTabProps) {
  const { t } = useTranslation();
  const equip = useEquip();
  const unequip = useUnequip();
  const [sellTarget, setSellTarget] = useState<InventoryItemView | null>(null);

  const catalogById = useMemo(
    () => new Map(catalog.map((item) => [item.id, item])),
    [catalog],
  );

  const live = inventory.filter((row) => row.soldAt === null);

  if (live.length === 0) {
    return (
      <YStack padding="$4" data-testid="inventory-empty">
        <Text fontSize="$3" color="$colorPress">
          {labels.emptyInventory}
        </Text>
      </YStack>
    );
  }

  return (
    <>
      <XStack
        gap="$3"
        flexWrap="wrap"
        padding="$3"
        data-testid="inventory-grid"
      >
        {live.map((row) => {
          const item = catalogById.get(row.itemId);
          if (!item) return null; // catalog-removed item; skip silently for v1
          const isEquipped = equipped[item.category] === row.itemId;
          const isStarter = item.starter === true;
          return (
            <YStack key={row.rowId} width={220} gap="$2">
              <ShopItemCard
                itemId={item.id}
                name={
                  String(t(`pages.shop.${item.nameKey}` as TranslationKey)) ||
                  item.id
                }
                rarity={item.rarity}
                assetUrl={item.assetUrl}
                priceAmount={row.paidAmount ?? item.priceAmount}
                priceCurrency={row.paidCurrency ?? item.priceCurrency}
                owned
                equipped={isEquipped}
              />
              <XStack gap="$2" justifyContent="space-between">
                {isEquipped ? (
                  <Button
                    variant="ghost"
                    onPress={() => unequip.mutate({ category: item.category })}
                    disabled={unequip.isPending}
                    data-testid={`inventory-unequip-${item.id}`}
                  >
                    {labels.unequip}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onPress={() => equip.mutate({ itemId: item.id })}
                    disabled={equip.isPending}
                    data-testid={`inventory-equip-${item.id}`}
                  >
                    {labels.equip}
                  </Button>
                )}
                {isStarter ? (
                  <Text fontSize="$1" color="$colorPress">
                    {labels.starterTag}
                  </Text>
                ) : (
                  <Button
                    variant="danger"
                    onPress={() => setSellTarget(row)}
                    disabled={isEquipped}
                    data-testid={`inventory-sell-${item.id}`}
                  >
                    {labels.sell}
                  </Button>
                )}
              </XStack>
            </YStack>
          );
        })}
      </XStack>

      <SellConfirmDialog
        inventoryItem={sellTarget}
        refundCoins={sellTarget ? refundForRow(sellTarget, gemToCoinRate) : 0}
        open={sellTarget !== null}
        onClose={() => setSellTarget(null)}
        onSuccess={() => setSellTarget(null)}
        labels={labels.sell_modal}
      />
    </>
  );
}
