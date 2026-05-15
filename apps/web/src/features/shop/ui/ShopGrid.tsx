'use client';

import { useMemo, useState } from 'react';
import { ShopItemCard, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useShopFiltersStore } from '../store/shopFiltersStore';
import type {
  EffectiveShopItem,
  EquippedView,
  InventoryItemView,
  WalletBalanceView,
} from '../server/shop.types';
import {
  PurchaseConfirmDialog,
  type PurchaseConfirmLabels,
} from './PurchaseConfirmDialog';

export interface ShopGridLabels {
  emptyCategory: string;
  purchase: PurchaseConfirmLabels;
}

export interface ShopGridProps {
  catalog: EffectiveShopItem[];
  inventory: InventoryItemView[];
  equipped: EquippedView;
  balance: WalletBalanceView;
  labels: ShopGridLabels;
}

export function ShopGrid({
  catalog,
  inventory,
  equipped,
  balance,
  labels,
}: ShopGridProps) {
  const category = useShopFiltersStore((s) => s.category);
  const rarities = useShopFiltersStore((s) => s.rarities);
  const setTab = useShopFiltersStore((s) => s.setTab);
  const { t } = useTranslation();
  const [selectedItem, setSelectedItem] = useState<EffectiveShopItem | null>(
    null,
  );

  const ownedIds = useMemo(
    () =>
      new Set(
        inventory.filter((row) => row.soldAt === null).map((row) => row.itemId),
      ),
    [inventory],
  );

  const filtered = useMemo(() => {
    return catalog.filter((item) => {
      if (!item.available) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (!rarities.has(item.rarity)) return false;
      return true;
    });
  }, [catalog, category, rarities]);

  if (filtered.length === 0) {
    return (
      <YStack padding="$4" data-testid="shop-grid-empty">
        <Text fontSize="$3" color="$colorPress">
          {labels.emptyCategory}
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
        data-testid="shop-grid"
        $sm={{ justifyContent: 'center' }}
      >
        {filtered.map((item) => (
          <YStack key={item.id} width={200}>
            <ShopItemCard
              itemId={item.id}
              name={
                String(t(`pages.shop.${item.nameKey}` as TranslationKey)) ||
                item.id
              }
              rarity={item.rarity}
              assetUrl={item.assetUrl}
              colorValue={item.colorValue ?? null}
              priceAmount={item.priceAmount}
              priceCurrency={item.priceCurrency}
              owned={ownedIds.has(item.id)}
              equipped={equipped[item.category] === item.id}
              onClick={() => {
                // Already-owned items: route to Inventory instead of opening
                // a purchase dialog. The spec allows re-buying after a sell-
                // back, but a fresh duplicate buy of a still-owned item is
                // almost always an accidental click.
                if (ownedIds.has(item.id)) {
                  setTab('inventory');
                  return;
                }
                setSelectedItem(item);
              }}
            />
          </YStack>
        ))}
      </XStack>

      <PurchaseConfirmDialog
        item={selectedItem}
        itemName={
          selectedItem
            ? String(
                t(`pages.shop.${selectedItem.nameKey}` as TranslationKey),
              ) || selectedItem.id
            : ''
        }
        itemDesc={
          selectedItem
            ? String(
                t(`pages.shop.${selectedItem.descKey}` as TranslationKey),
              ) || ''
            : ''
        }
        balance={balance}
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onSuccess={() => setSelectedItem(null)}
        labels={labels.purchase}
      />
    </>
  );
}
