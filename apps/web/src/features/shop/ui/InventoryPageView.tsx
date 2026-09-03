'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
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
      <div className="flex flex-col items-stretch max-w-[1280px] px-4 py-5 gap-5 w-full">
        <ShopTopBar balance={balance} labels={labels.topBar} />

        {!isAuthenticated ? <ShopSignInBanner labels={labels.signIn} /> : null}

        <div className="flex flex-row gap-5 w-full items-start max-[800px]:flex-col">
          <ShopMannequinRail
            catalog={catalog}
            inventory={inventory}
            balance={balance}
            nextGemPack={nextGemPack}
            gemToCoinRate={gemToCoinRate}
            labels={labels.mannequin}
            sellLabels={labels.sell}
          />

          <div className="flex flex-col items-stretch flex-1 w-full gap-5 min-w-0">
            <div className="flex flex-col items-stretch gap-2">
              <span className="text-[48px] tracking-[2px] uppercase text-[var(--textSecondary)]">
                {labels.inventory.eyebrow.replace(
                  '{count}',
                  String(totalOwned),
                )}
              </span>
              <span className="text-[40px] font-black tracking-[-0.5px] text-[var(--color)]">
                {labels.inventory.title}
              </span>
            </div>

            {totalOwned === 0 ? (
              <div
                className="flex flex-col p-5 rounded-2xl border border-[var(--glassBorder)] bg-[var(--glassBg)] items-center"
                data-testid="inventory-empty"
              >
                <span className="text-[18px] text-[var(--textSecondary)] text-center">
                  {labels.inventory.empty}
                </span>
              </div>
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
          </div>
        </div>

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
      </div>
    </PageLayout>
  );
}
