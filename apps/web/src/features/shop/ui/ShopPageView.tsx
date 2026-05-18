'use client';

import { useEffect, useMemo, useState } from 'react';
import { XStack, YStack } from '@arcadeum/ui';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import { ShopTopBar, type ShopTopBarLabels } from './ShopTopBar';
import { ShopHero, type ShopHeroLabels } from './ShopHero';
import { ShopRow, type ShopRowLabels } from './ShopRow';
import {
  ShopMannequinRail,
  type ShopMannequinLabels,
} from './ShopMannequinRail';
import {
  PurchaseConfirmDialog,
  type PurchaseConfirmLabels,
} from './PurchaseConfirmDialog';
import {
  ShopSignInBanner,
  type ShopSignInBannerLabels,
} from './ShopSignInBanner';
import {
  ShopCatalogEmpty,
  type ShopCatalogEmptyLabels,
} from './ShopCatalogEmpty';
import type { ShopCardLabels } from './ShopCard';
import type { SellConfirmLabels } from './SellConfirmDialog';
import type {
  EffectiveShopItem,
  FeaturedDropView,
  InventoryView,
  NextGemPackView,
  WalletBalanceView,
} from '../server/shop.types';

export interface ShopPageLabels {
  meta: { title: string; description: string };
  topBar: ShopTopBarLabels;
  signIn: ShopSignInBannerLabels;
  hero: ShopHeroLabels;
  mannequin: ShopMannequinLabels;
  row: {
    avatars: ShopRowLabels;
    badges: ShopRowLabels;
    colors: ShopRowLabels;
    skins: ShopRowLabels;
    legendary: ShopRowLabels;
  };
  card: ShopCardLabels;
  rarities: Record<string, string>;
  purchase: PurchaseConfirmLabels;
  sell: SellConfirmLabels;
  empty: ShopCatalogEmptyLabels;
}

export interface ShopPageViewProps {
  catalog: EffectiveShopItem[];
  inventory: InventoryView;
  balance: WalletBalanceView;
  nextGemPack: NextGemPackView | null;
  featuredDrop: FeaturedDropView | null;
  gemToCoinRate: number;
  isAuthenticated?: boolean;
  labels: ShopPageLabels;
}

export function ShopPageView({
  catalog,
  inventory,
  balance,
  nextGemPack,
  featuredDrop,
  gemToCoinRate,
  isAuthenticated = true,
  labels,
}: ShopPageViewProps) {
  const { t } = useTranslation();
  const [purchaseTarget, setPurchaseTarget] =
    useState<EffectiveShopItem | null>(null);

  // The preview store is module-level (Zustand singleton). Without an unmount
  // reset, a user who hovers a card here, navigates to /profile, and comes
  // back lands on a rail still previewing a stale item. Clear hover and
  // active-slot on unmount so each shop visit starts from idle.
  useEffect(() => {
    return () => {
      const store = useShopPreviewStore.getState();
      store.setHover(null);
      store.clearActiveSlot();
    };
  }, []);

  const liveCatalog = useMemo(
    () => catalog.filter((item) => item.available),
    [catalog],
  );

  // Each category list intentionally still contains items that also appear
  // in the Legendary row — Legendary is a curated cross-cut, not a dedup of
  // categories. Don't fold these together.
  const avatars = useMemo(
    () => liveCatalog.filter((c) => c.category === 'avatar'),
    [liveCatalog],
  );
  const badges = useMemo(
    () => liveCatalog.filter((c) => c.category === 'badge'),
    [liveCatalog],
  );
  const nameColors = useMemo(
    () => liveCatalog.filter((c) => c.category === 'name_color'),
    [liveCatalog],
  );
  const skins = useMemo(
    () => liveCatalog.filter((c) => c.category === 'game_skin'),
    [liveCatalog],
  );
  const legendaries = useMemo(
    () => liveCatalog.filter((c) => c.rarity === 'legendary'),
    [liveCatalog],
  );

  // The previous build also rendered a "New drops · This week" row keyed on
  // `rarity === 'epic' || 'legendary'`. That selector was a Legendary alias
  // (same items shown twice) and the "this week" claim is impossible without
  // a real createdAt on shop items. The BE catalog is hardcoded today, so
  // the row is gone until BE surfaces a real timestamp or admin-curated drop
  // flag. See PR-689 follow-ups doc §1a / §6c.

  const featuredItem = featuredDrop
    ? (catalog.find((c) => c.id === featuredDrop.itemId) ?? null)
    : null;

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

        {liveCatalog.length === 0 ? (
          <ShopCatalogEmpty labels={labels.empty} />
        ) : null}

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
            {featuredItem ? (
              <ShopHero
                item={featuredItem}
                labels={labels.hero}
                onBuyClick={(item) => setPurchaseTarget(item)}
              />
            ) : null}

            <ShopRow
              id="row-avatars"
              sectionKey="avatar"
              items={avatars}
              inventory={inventory.items}
              equipped={inventory.equipped}
              labels={labels.row.avatars}
              cardLabels={labels.card}
              balance={balance}
              onPurchaseFallback={(item) => setPurchaseTarget(item)}
            />
            <ShopRow
              id="row-badges"
              sectionKey="badge"
              items={badges}
              inventory={inventory.items}
              equipped={inventory.equipped}
              labels={labels.row.badges}
              cardLabels={labels.card}
              balance={balance}
              onPurchaseFallback={(item) => setPurchaseTarget(item)}
            />
            <ShopRow
              id="row-colors"
              sectionKey="name_color"
              items={nameColors}
              inventory={inventory.items}
              equipped={inventory.equipped}
              small
              labels={labels.row.colors}
              cardLabels={labels.card}
              balance={balance}
              onPurchaseFallback={(item) => setPurchaseTarget(item)}
            />
            <ShopRow
              id="row-skins"
              sectionKey="game_skin"
              items={skins}
              inventory={inventory.items}
              equipped={inventory.equipped}
              labels={labels.row.skins}
              cardLabels={labels.card}
              balance={balance}
              onPurchaseFallback={(item) => setPurchaseTarget(item)}
            />
            <ShopRow
              id="row-legendary"
              items={legendaries}
              inventory={inventory.items}
              equipped={inventory.equipped}
              highlight
              labels={labels.row.legendary}
              cardLabels={labels.card}
              balance={balance}
              onPurchaseFallback={(item) => setPurchaseTarget(item)}
            />
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
      </YStack>
    </PageLayout>
  );
}
