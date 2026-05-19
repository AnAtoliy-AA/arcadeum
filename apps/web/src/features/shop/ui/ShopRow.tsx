'use client';

import { useMemo, useState } from 'react';
import { XStack, YStack } from '@arcadeum/ui';
import { Text, styled, YStack as Stack } from 'tamagui';
import { track } from '@/shared/lib/analytics';
import { useShopPreviewStore } from '../store/shopPreviewStore';
import { ShopCard, type ShopCardLabels, type ShopCardMode } from './ShopCard';
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
  collapse: string;
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
  /**
   * 'shop' (default) renders the full catalog with Buy/Equip affordances.
   * 'inventory' is used by the owned-items section — cards render Sell as a
   * secondary action and the upstream caller is expected to feed only items
   * the user owns.
   */
  mode?: ShopCardMode;
  labels: ShopRowLabels;
  cardLabels: ShopCardLabels;
  onPurchaseFallback: (item: EffectiveShopItem) => void;
  onSellRequest?: (row: InventoryItemView) => void;
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

  variants: {
    expanded: {
      // Wrap the cards into a grid that fills the row width so every item
      // is visible without horizontal scrolling. Scroll mode is the default
      // (compact, leaves room for many rows on the page).
      true: {
        flexWrap: 'wrap',
        overflow: 'visible',
      },
    },
  } as const,
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
  mode = 'shop',
  labels,
  cardLabels,
  onPurchaseFallback,
  onSellRequest,
}: ShopRowProps) {
  const activeSlot = useShopPreviewStore((s) => s.activeSlot);
  const [expanded, setExpanded] = useState(false);

  const ownedIds = useMemo(
    () =>
      new Set(
        inventory.filter((row) => row.soldAt === null).map((row) => row.itemId),
      ),
    [inventory],
  );

  // Map itemId → live inventory row so the inventory-mode Sell button can
  // pass the right purchaseId into SellConfirmDialog without a per-card
  // scan. Falls back to null when not in inventory mode (catalog cards
  // ignore the prop).
  const liveRowByItemId = useMemo(
    () =>
      new Map(
        inventory.filter((row) => row.soldAt === null).map((row) => [row.itemId, row]),
      ),
    [inventory],
  );

  if (items.length === 0) return null;

  const isActive = Boolean(sectionKey && activeSlot === sectionKey);

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      track('shop.row.viewAll', {
        rowId: id,
        section: sectionKey ?? null,
        expanded: next,
      });
      return next;
    });
  };

  const expandLabel = expanded ? labels.collapse : labels.viewAll;

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
            cursor="pointer"
            role="button"
            tabIndex={0}
            aria-expanded={expanded}
            onPress={toggleExpanded}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleExpanded();
              }
            }}
            hoverStyle={{ color: '$white' }}
            data-testid={`shop-row-${id}-toggle`}
            data-expanded={expanded ? 'true' : 'false'}
          >
            {expandLabel}
          </Text>
        </XStack>

        <Scroller expanded={expanded}>
          {items.map((item, index) => (
            <ShopCard
              key={item.id}
              item={item}
              owned={ownedIds.has(item.id)}
              equipped={equipped[item.category] === item.id}
              balance={balance}
              small={small}
              priority={index < priorityCount}
              mode={mode}
              inventoryRow={
                mode === 'inventory'
                  ? (liveRowByItemId.get(item.id) ?? null)
                  : null
              }
              labels={cardLabels}
              onPurchaseFallback={onPurchaseFallback}
              onSellRequest={onSellRequest}
            />
          ))}
        </Scroller>
      </RowHost>
    </YStack>
  );
}
