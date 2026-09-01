'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
import type { SellConfirmLabels } from './SellConfirmDialog';
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
  InventoryView,
  NextGemPackView,
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
  freeRewardsBanner?: { title: string; subtitle: string; cta: string };
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
    backgrounds: ShopRowLabels;
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
  const backgrounds = useMemo(
    () => liveCatalog.filter((c) => c.category === 'background'),
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
      <div className="flex flex-col items-stretch max-w-[1280px] px-4 py-5 gap-5 w-full">
        <ShopTopBar balance={balance} labels={labels.topBar} />

        {!isAuthenticated ? <ShopSignInBanner labels={labels.signIn} /> : null}

        {liveCatalog.length === 0 ? (
          <ShopCatalogEmpty labels={labels.empty} />
        ) : null}

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

          <div className="flex flex-col items-stretch flex-1 w-full gap-5 min-w-0 max-[800px]:grow-[0] max-[800px]:basis-[auto]">
            {featuredItem ? (
              <ShopHero
                item={featuredItem}
                owned={featuredOwned}
                equipped={featuredEquipped}
                labels={heroLabels}
                onBuyClick={(item) => setPurchaseTarget(item)}
              />
            ) : null}

            <div
              data-testid="shop-free-rewards-banner"
              className="rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-amber-500/10 p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-xl border border-amber-400/30">
                  💎
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-amber-300">
                    {labels.freeRewardsBanner?.title ?? 'Free Rewards & Quests'}
                  </span>
                  <span className="text-xs text-slate-300">
                    {labels.freeRewardsBanner?.subtitle ??
                      'Subscribe to our official social networks to earn free gems and bonus coins!'}
                  </span>
                </div>
              </div>
              <Link
                href="/rewards"
                data-testid="shop-rewards-cta"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/20 hover:bg-amber-300 no-underline transition-all active:scale-[0.98]"
              >
                {labels.freeRewardsBanner?.cta ?? 'Claim Free Gems'} →
              </Link>
            </div>

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
              id="row-backgrounds"
              sectionKey="background"
              items={backgrounds}
              inventory={inventory.items}
              equipped={inventory.equipped}
              labels={labels.row.backgrounds}
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
      </div>
    </PageLayout>
  );
}
