'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, XStack, YStack } from '@arcadeum/ui';
import { PageLayout } from '@arcadeum/ui/components/PageLayout/PageLayout';
import { Text, YStack as Stack } from 'tamagui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
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
import type { ShopCardLabels } from './ShopCard';
import type { SellConfirmLabels } from './SellConfirmDialog';
import type {
  EffectiveShopItem,
  FeaturedDropView,
  InventoryView,
  NextGemPackView,
  WalletBalanceView,
} from '../server/shop.types';

export interface ShopSignInLabels {
  title: string;
  body: string;
  cta: string;
}

export interface ShopPageLabels {
  meta: { title: string; description: string };
  topBar: ShopTopBarLabels;
  signIn: ShopSignInLabels;
  hero: ShopHeroLabels;
  mannequin: ShopMannequinLabels;
  row: {
    avatars: ShopRowLabels;
    badges: ShopRowLabels;
    colors: ShopRowLabels;
    skins: ShopRowLabels;
    legendary: ShopRowLabels;
    newdrops: ShopRowLabels;
  };
  card: ShopCardLabels;
  rarities: Record<string, string>;
  purchase: PurchaseConfirmLabels;
  sell: SellConfirmLabels;
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

  const liveCatalog = useMemo(
    () => catalog.filter((item) => item.available),
    [catalog],
  );

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
  const newDrops = useMemo(
    () =>
      liveCatalog
        .filter((c) => c.rarity === 'epic' || c.rarity === 'legendary')
        .slice(0, 10),
    [liveCatalog],
  );

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

        {!isAuthenticated ? (
          <Stack
            flexDirection="column"
            gap={6}
            padding="$4"
            borderRadius="$4"
            borderWidth={1}
            borderColor="rgba(96,165,250,0.35)"
            backgroundColor="rgba(59,130,246,0.08)"
            data-testid="shop-signin-banner"
          >
            <Text fontSize="$5" fontWeight="700">
              {labels.signIn.title}
            </Text>
            <Text fontSize="$3" color="$gray11">
              {labels.signIn.body}
            </Text>
            <XStack>
              <Link href="/auth">
                <Button variant="primary" data-testid="shop-signin-cta">
                  {labels.signIn.cta}
                </Button>
              </Link>
            </XStack>
          </Stack>
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
            onPurchase={(item) => setPurchaseTarget(item)}
          />

          <YStack flex={1} width="100%" gap="$5" minWidth={0}>
            {featuredItem ? (
              <ShopHero
                item={featuredItem}
                endsAtIso={featuredDrop?.endsAtIso ?? null}
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
              onPurchase={(item) => setPurchaseTarget(item)}
            />
            <ShopRow
              id="row-badges"
              sectionKey="badge"
              items={badges}
              inventory={inventory.items}
              equipped={inventory.equipped}
              labels={labels.row.badges}
              cardLabels={labels.card}
              onPurchase={(item) => setPurchaseTarget(item)}
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
              onPurchase={(item) => setPurchaseTarget(item)}
            />
            <ShopRow
              id="row-skins"
              sectionKey="game_skin"
              items={skins}
              inventory={inventory.items}
              equipped={inventory.equipped}
              labels={labels.row.skins}
              cardLabels={labels.card}
              onPurchase={(item) => setPurchaseTarget(item)}
            />
            <ShopRow
              id="row-legendary"
              items={legendaries}
              inventory={inventory.items}
              equipped={inventory.equipped}
              highlight
              labels={labels.row.legendary}
              cardLabels={labels.card}
              onPurchase={(item) => setPurchaseTarget(item)}
            />
            <ShopRow
              id="row-newdrops"
              items={newDrops}
              inventory={inventory.items}
              equipped={inventory.equipped}
              labels={labels.row.newdrops}
              cardLabels={labels.card}
              onPurchase={(item) => setPurchaseTarget(item)}
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
