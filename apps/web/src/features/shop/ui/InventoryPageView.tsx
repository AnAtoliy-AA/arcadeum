'use client';

import { useEffect, useMemo, useState } from 'react';
import { XStack, YStack } from '@arcadeum/ui';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import { Text } from 'tamagui';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import { ShopTopBar } from './ShopTopBar';
import { ShopRow } from './ShopRow';
import { ShopMannequinRail } from './ShopMannequinRail';
import { ShopSignInBanner } from './ShopSignInBanner';
import { SellConfirmDialog } from './SellConfirmDialog';
import { PurchaseConfirmDialog } from './PurchaseConfirmDialog';
import {
  CATEGORY_TO_ROW_LABEL_KEY,
  ownedByCategory,
  refundForRow,
} from '../lib/inventoryViewHelpers';
import type { ShopPageLabels } from './ShopPageView';
import type {
  EffectiveShopItem,
  InventoryItemView,
  InventoryView,
  NextGemPackView,
  ShopCategory,
  WalletBalanceView,
} from '../server/shop.types';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';

export interface InventoryPageViewProps {
  catalog: EffectiveShopItem[];
  inventory: InventoryView;
  balance: WalletBalanceView;
  nextGemPack: NextGemPackView | null;
  gemToCoinRate: number;
  isAuthenticated?: boolean;
  /**
   * Reuses the full shop labels object — the inventory page only renders
   * row + card + topBar + mannequin + inventory + sell + purchase slices,
   * but keeping a single labels shape across both pages means /shop/page.tsx
   * and /shop/inventory/page.tsx can pass the exact same prop without a
   * per-page translation lookup.
   */
  labels: ShopPageLabels;
}

export function InventoryPageView({
  catalog,
  inventory,
  balance,
  nextGemPack,
  gemToCoinRate,
  isAuthenticated = true,
  labels,
}: InventoryPageViewProps) {
  const { t } = useTranslation();
  const [purchaseTarget, setPurchaseTarget] =
    useState<EffectiveShopItem | null>(null);
  const [sellTarget, setSellTarget] = useState<InventoryItemView | null>(null);

  useEffect(() => {
    return () => {
      const store = useShopPreviewStore.getState();
      store.setHover(null);
      store.clearActiveSlot();
    };
  }, []);

  const ownedRows = useMemo(
    () => ownedByCategory(catalog, inventory.items),
    [catalog, inventory.items],
  );

  const totalOwned = useMemo(
    () => Object.values(ownedRows).reduce((sum, list) => sum + list.length, 0),
    [ownedRows],
  );

  const purchaseName = purchaseTarget
    ? String(t(`pages.shop.${purchaseTarget.nameKey}` as TranslationKey))
    : '';
  const purchaseDesc = purchaseTarget
    ? String(t(`pages.shop.${purchaseTarget.descKey}` as TranslationKey))
    : '';

  return (
    <PageLayout>
      <YStack
        maxWidth={1280}
        marginHorizontal="auto"
        paddingHorizontal="$4"
        paddingVertical="$5"
        gap="$5"
        width="100%"
      >
        <ShopTopBar balance={balance} labels={labels.topBar} />

        {!isAuthenticated ? <ShopSignInBanner labels={labels.signIn} /> : null}

        <XStack
          gap="$5"
          width="100%"
          alignItems="flex-start"
          $sm={{ flexDirection: 'column' }}
        >
          <ShopMannequinRail
            catalog={catalog}
            inventory={inventory}
            balance={balance}
            nextGemPack={nextGemPack}
            gemToCoinRate={gemToCoinRate}
            labels={labels.mannequin}
            sellLabels={labels.sell}
          />

          <YStack flex={1} width="100%" gap="$5" minWidth={0}>
            <YStack gap={2}>
              <Text
                fontSize={10}
                letterSpacing={2}
                textTransform="uppercase"
                color="$gray11"
              >
                {labels.inventory.eyebrow.replace(
                  '{count}',
                  String(totalOwned),
                )}
              </Text>
              <Text fontSize="$9" fontWeight="900" letterSpacing={-0.5}>
                {labels.inventory.title}
              </Text>
            </YStack>

            {totalOwned === 0 ? (
              <YStack
                padding="$5"
                borderRadius="$4"
                borderWidth={1}
                borderColor="rgba(255,255,255,0.08)"
                backgroundColor="rgba(255,255,255,0.02)"
                alignItems="center"
                data-testid="inventory-empty"
              >
                <Text fontSize="$4" color="$gray11" textAlign="center">
                  {labels.inventory.empty}
                </Text>
              </YStack>
            ) : (
              (Object.keys(ownedRows) as ShopCategory[])
                .filter((cat) => ownedRows[cat].length > 0)
                .map((cat) => (
                  <ShopRow
                    key={`inv-${cat}`}
                    id={`row-${cat}`}
                    sectionKey={cat}
                    mode="inventory"
                    items={ownedRows[cat]}
                    inventory={inventory.items}
                    equipped={inventory.equipped}
                    labels={labels.row[CATEGORY_TO_ROW_LABEL_KEY[cat]]}
                    cardLabels={labels.card}
                    balance={balance}
                    onPurchaseFallback={(item) => setPurchaseTarget(item)}
                    onSellRequest={(row) => setSellTarget(row)}
                  />
                ))
            )}
          </YStack>
        </XStack>

        <PurchaseConfirmDialog
          item={purchaseTarget}
          itemName={purchaseName}
          itemDesc={purchaseDesc}
          balance={balance}
          open={purchaseTarget !== null}
          onClose={() => setPurchaseTarget(null)}
          onSuccess={() => setPurchaseTarget(null)}
          labels={labels.purchase}
        />

        <SellConfirmDialog
          inventoryItem={sellTarget}
          refundCoins={sellTarget ? refundForRow(sellTarget, gemToCoinRate) : 0}
          open={sellTarget !== null}
          onClose={() => setSellTarget(null)}
          onSuccess={() => setSellTarget(null)}
          labels={labels.sell}
        />
      </YStack>
    </PageLayout>
  );
}
