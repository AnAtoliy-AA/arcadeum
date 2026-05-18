'use client';

import { useMemo } from 'react';
import { XStack, YStack } from '@arcadeum/ui';
import { Text, styled, YStack as Stack } from 'tamagui';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import { ShopCard, type ShopCardLabels } from './ShopCard';
import type {
  EffectiveShopItem,
  EquippedView,
  InventoryItemView,
  ShopCategory,
  WalletBalanceView,
} from '../server/shop.types';

export interface ShopRowLabels {
  title: string;
  eyebrow: string;
  viewAll: string;
}

export interface ShopRowProps {
  id: string;
  sectionKey?: ShopCategory;
  items: EffectiveShopItem[];
  inventory: InventoryItemView[];
  equipped: EquippedView;
  balance: WalletBalanceView;
  small?: boolean;
  highlight?: boolean;
  /**
   * Eager-load the first N card images in this row. Set on the first
   * catalog row only — its leading cards sit just below the hero and can
   * become LCP on tall viewports; lazy loading them triggers a Next/Image
   * "loading=eager" warning.
   */
  priorityCount?: number;
  labels: ShopRowLabels;
  cardLabels: ShopCardLabels;
  onPurchaseFallback: (item: EffectiveShopItem) => void;
}

const RowHost = styled(Stack, {
  name: 'ShopRowHost',
  width: '100%',
  borderRadius: '$5',
  paddingHorizontal: '$4',
  paddingVertical: '$4',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
  backgroundColor: 'rgba(255,255,255,0.015)',

  variants: {
    active: {
      true: {
        borderColor: 'rgba(96,165,250,0.45)',
        backgroundColor: 'rgba(96,165,250,0.06)',
      },
    },
    highlight: {
      true: {
        borderColor: 'rgba(250,204,21,0.30)',
        backgroundColor: 'rgba(250,204,21,0.04)',
      },
    },
  } as const,
});

const Scroller = styled(Stack, {
  name: 'ShopRowScroller',
  flexDirection: 'row',
  alignItems: 'stretch',
  gap: 12,
  width: '100%',
  overflow: 'scroll',
  paddingVertical: 4,
});

export function ShopRow({
  id,
  sectionKey,
  items,
  inventory,
  equipped,
  balance,
  small,
  highlight,
  priorityCount = 0,
  labels,
  cardLabels,
  onPurchaseFallback,
}: ShopRowProps) {
  const activeSlot = useShopPreviewStore((s) => s.activeSlot);

  const ownedIds = useMemo(
    () =>
      new Set(
        inventory.filter((row) => row.soldAt === null).map((row) => row.itemId),
      ),
    [inventory],
  );

  if (items.length === 0) return null;

  const isActive = Boolean(sectionKey && activeSlot === sectionKey);

  return (
    <YStack
      id={id}
      gap="$3"
      width="100%"
      style={{ scrollMarginTop: 32 }}
      data-testid={`shop-row-${id}`}
      data-section={sectionKey ?? ''}
      data-active={isActive ? 'true' : 'false'}
    >
      <RowHost active={isActive} highlight={highlight}>
        <XStack
          width="100%"
          alignItems="flex-end"
          justifyContent="space-between"
          marginBottom="$3"
        >
          <YStack gap={2}>
            <Text
              fontSize={10}
              letterSpacing={2}
              textTransform="uppercase"
              color="$gray11"
            >
              {labels.eyebrow.replace('{count}', String(items.length))}
            </Text>
            <Text fontSize="$6" fontWeight="800" letterSpacing={-0.3}>
              {labels.title}
            </Text>
          </YStack>
          <Text
            fontSize={11}
            letterSpacing={1}
            textTransform="uppercase"
            fontWeight="700"
            color="$gray11"
          >
            {labels.viewAll}
          </Text>
        </XStack>

        <Scroller>
          {items.map((item, index) => (
            <ShopCard
              key={item.id}
              item={item}
              owned={ownedIds.has(item.id)}
              equipped={equipped[item.category] === item.id}
              balance={balance}
              small={small}
              priority={index < priorityCount}
              labels={cardLabels}
              onPurchaseFallback={onPurchaseFallback}
            />
          ))}
        </Scroller>
      </RowHost>
    </YStack>
  );
}
