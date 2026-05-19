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
  SellConfirmDialog,
  type SellConfirmLabels,
} from './SellConfirmDialog';
import { Text } from 'tamagui';

// Map ShopCategory → labels.row.* slice key. The shop catalog rows hardcode
// each pairing (e.g. `labels.row.colors` for name_color), but the inventory
// section iterates over categories dynamically so it needs this lookup. Keys
// must stay in sync with ShopPageLabels.row.
type ShopRowLabelKey =
  | 'avatars'
  | 'badges'
  | 'colors'
  | 'skins'
  | 'banners'
  | 'auras'
  | 'frames';
const CATEGORY_TO_ROW_LABEL_KEY: Record<ShopCategory, ShopRowLabelKey> = {
  avatar: 'avatars',
  badge: 'badges',
  name_color: 'colors',
  game_skin: 'skins',
  banner: 'banners',
  aura: 'auras',
  frame: 'frames',
};

// Refund formula mirrors ShopActionPanel.refundForRow — kept duplicated
// rather than shared because the function is tiny and each surface owns
// its own sell flow; pulling it into a lib would create a one-call-site
// helper and a circular-feeling import from ui/ → lib/ for a 3-liner.
function refundForRow(
  row: InventoryItemView,
  gemToCoinRate: number,
): number {
  if (row.paidAmount === null || row.paidCurrency === null) return 0;
  if (row.paidCurrency === 'coins') return Math.floor(row.paidAmount * 0.5);
  return Math.floor(row.paidAmount * gemToCoinRate * 0.5);
}
import {
  ShopSignInBanner,
  type ShopSignInBannerLabels,
} from './ShopSignInBanner';
import {
  ShopCatalogEmpty,
  type ShopCatalogEmptyLabels,
} from './ShopCatalogEmpty';
import type { ShopCardLabels } from './ShopCard';
import type {
  EffectiveShopItem,
  FeaturedDropView,
  InventoryItemView,
  InventoryView,
  NextGemPackView,
  ShopCategory,
  WalletBalanceView,
} from '../server/shop.types';

// The page-level `hero` slice comes straight from i18n (`pages.shop.hero`)
// and only carries the hero's own strings. The Equip/Unequip/Equipped strings
// reuse the existing `card.*` keys (same affordance), so the full
// `ShopHeroLabels` is composed below in ShopPageView, not declared here.
type ShopPageHeroLabels = Omit<
  ShopHeroLabels,
  'equip' | 'unequip' | 'equipped'
>;

export interface ShopInventorySectionLabels {
  title: string;
  eyebrow: string;
  empty: string;
}

export interface ShopPageLabels {
  meta: { title: string; description: string };
  topBar: ShopTopBarLabels;
  signIn: ShopSignInBannerLabels;
  hero: ShopPageHeroLabels;
  mannequin: ShopMannequinLabels;
  row: {
    avatars: ShopRowLabels;
    badges: ShopRowLabels;
    colors: ShopRowLabels;
    skins: ShopRowLabels;
    banners: ShopRowLabels;
    auras: ShopRowLabels;
    frames: ShopRowLabels;
    legendary: ShopRowLabels;
  };
  card: ShopCardLabels;
  rarities: Record<string, string>;
  inventory: ShopInventorySectionLabels;
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
  const [sellTarget, setSellTarget] = useState<InventoryItemView | null>(null);

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
  const banners = useMemo(
    () => liveCatalog.filter((c) => c.category === 'banner'),
    [liveCatalog],
  );
  const auras = useMemo(
    () => liveCatalog.filter((c) => c.category === 'aura'),
    [liveCatalog],
  );
  const frames = useMemo(
    () => liveCatalog.filter((c) => c.category === 'frame'),
    [liveCatalog],
  );
  const legendaries = useMemo(
    () => liveCatalog.filter((c) => c.rarity === 'legendary'),
    [liveCatalog],
  );

  // Owned-items derivation for the Inventory section. Build a Set of owned
  // itemIds from live inventory rows, then filter the catalog per category
  // to only those entries. Reusing the catalog keeps the card visuals
  // identical to the shop rows — the inventory section is the same UI
  // showing a different slice, not a separate component tree.
  const ownedItemIds = useMemo(
    () =>
      new Set(
        inventory.items
          .filter((row) => row.soldAt === null)
          .map((row) => row.itemId),
      ),
    [inventory.items],
  );
  const inventoryByCategory = useMemo(() => {
    const filterOwned = (cat: ShopCategory) =>
      catalog.filter((c) => c.category === cat && ownedItemIds.has(c.id));
    return {
      avatar: filterOwned('avatar'),
      badge: filterOwned('badge'),
      name_color: filterOwned('name_color'),
      game_skin: filterOwned('game_skin'),
      banner: filterOwned('banner'),
      aura: filterOwned('aura'),
      frame: filterOwned('frame'),
    } satisfies Record<ShopCategory, EffectiveShopItem[]>;
  }, [catalog, ownedItemIds]);
  const totalOwned = ownedItemIds.size;

  // The previous build also rendered a "New drops · This week" row keyed on
  // `rarity === 'epic' || 'legendary'`. That selector was a Legendary alias
  // (same items shown twice) and the "this week" claim is impossible without
  // a real createdAt on shop items. The BE catalog is hardcoded today, so
  // the row is gone until BE surfaces a real timestamp or admin-curated drop
  // flag. See PR-689 follow-ups doc §1a / §6c.

  const featuredItem = featuredDrop
    ? (catalog.find((c) => c.id === featuredDrop.itemId) ?? null)
    : null;

  const featuredOwned = featuredItem
    ? inventory.items.some(
        (row) => row.itemId === featuredItem.id && row.soldAt === null,
      )
    : false;
  const featuredEquipped =
    featuredItem !== null &&
    inventory.equipped[featuredItem.category] === featuredItem.id;

  // The hero reuses card.equip / card.unequip / card.equipped to avoid
  // adding parallel translation entries — same affordance, different layout.
  const heroLabels = useMemo(
    () => ({
      ...labels.hero,
      equip: labels.card.equip,
      unequip: labels.card.unequip,
      equipped: labels.card.equipped,
    }),
    [labels.hero, labels.card],
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
                owned={featuredOwned}
                equipped={featuredEquipped}
                labels={heroLabels}
                onBuyClick={(item) => setPurchaseTarget(item)}
              />
            ) : null}

            {/* Inventory block — same row/card layout as the shop, but
                filtered to items the user owns. The Inventory nav link
                in ShopTopBar scrolls to the id below. Hidden when the
                user owns nothing so the empty section doesn't push the
                catalog down. */}
            {isAuthenticated && totalOwned > 0 ? (
              <YStack id="shop-inventory" gap="$3" style={{ scrollMarginTop: 32 }}>
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
                  <Text fontSize="$8" fontWeight="900" letterSpacing={-0.4}>
                    {labels.inventory.title}
                  </Text>
                </YStack>
                {(Object.keys(inventoryByCategory) as ShopCategory[])
                  .filter((cat) => inventoryByCategory[cat].length > 0)
                  .map((cat) => (
                    <ShopRow
                      key={`inv-${cat}`}
                      id={`row-inv-${cat}`}
                      sectionKey={cat}
                      mode="inventory"
                      items={inventoryByCategory[cat]}
                      inventory={inventory.items}
                      equipped={inventory.equipped}
                      labels={labels.row[CATEGORY_TO_ROW_LABEL_KEY[cat]]}
                      cardLabels={labels.card}
                      balance={balance}
                      onPurchaseFallback={(item) => setPurchaseTarget(item)}
                      onSellRequest={(row) => setSellTarget(row)}
                    />
                  ))}
              </YStack>
            ) : null}

            <ShopRow
              id="row-legendary"
              items={legendaries}
              inventory={inventory.items}
              equipped={inventory.equipped}
              highlight
              labels={labels.row.legendary}
              cardLabels={labels.card}
              balance={balance}
              priorityCount={3}
              onPurchaseFallback={(item) => setPurchaseTarget(item)}
            />
            <ShopRow
              id="row-avatars"
              sectionKey="avatar"
              items={avatars}
              inventory={inventory.items}
              equipped={inventory.equipped}
              labels={labels.row.avatars}
              cardLabels={labels.card}
              balance={balance}
              priorityCount={2}
              onPurchaseFallback={(item) => setPurchaseTarget(item)}
            />
            <ShopRow
              id="row-frames"
              sectionKey="frame"
              items={frames}
              inventory={inventory.items}
              equipped={inventory.equipped}
              labels={labels.row.frames}
              cardLabels={labels.card}
              balance={balance}
              priorityCount={2}
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
              priorityCount={2}
              onPurchaseFallback={(item) => setPurchaseTarget(item)}
            />
            <ShopRow
              id="row-banners"
              sectionKey="banner"
              items={banners}
              inventory={inventory.items}
              equipped={inventory.equipped}
              labels={labels.row.banners}
              cardLabels={labels.card}
              balance={balance}
              priorityCount={2}
              onPurchaseFallback={(item) => setPurchaseTarget(item)}
            />
            <ShopRow
              id="row-auras"
              sectionKey="aura"
              items={auras}
              inventory={inventory.items}
              equipped={inventory.equipped}
              labels={labels.row.auras}
              cardLabels={labels.card}
              balance={balance}
              priorityCount={2}
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
              priorityCount={2}
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
              priorityCount={2}
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

        {/* Page-level sell dialog driven by the inventory cards. The
            mannequin-rail sell flow uses its own dialog instance inside
            ShopActionPanel — kept separate so each surface controls its
            own open/close lifecycle without shared state. */}
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
