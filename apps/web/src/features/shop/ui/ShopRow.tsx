'use client';

import { useMemo, useState } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { Typography } from '@arcadeum/ui';
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

function RowHost({
  active,
  highlight,
  className,
  children,
}: {
  active?: boolean;
  highlight?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        'w-full px-4 py-4 rounded-3xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)]',
        active && 'border-[rgba(96,165,250,0.45)] bg-[rgba(96,165,250,0.06)]',
        highlight &&
          'border-[rgba(250,204,21,0.30)] bg-[rgba(250,204,21,0.04)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Scroller({
  expanded,
  className,
  children,
}: {
  expanded?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-row items-stretch gap-3 w-full overflow-scroll py-1',
        expanded && 'flex-wrap overflow-visible',
        className,
      )}
    >
      {children}
    </div>
  );
}

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
        inventory
          .filter((row) => row.soldAt === null)
          .map((row) => [row.itemId, row]),
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
    <div
      className="flex flex-col items-stretch gap-3 w-full"
      style={{ scrollMarginTop: 32 }}
      id={id}
      data-testid={`shop-row-${id}`}
      data-section={sectionKey ?? ''}
      data-active={isActive ? 'true' : 'false'}
    >
      <RowHost active={isActive} highlight={highlight}>
        <div className="flex flex-row w-full items-end justify-between px-1">
          <div className="flex flex-col items-stretch gap-0">
            <Typography uiSize="2xl" variant="heading">
              {labels.title}
            </Typography>
            <Typography
              uiSize="xs"
              variant="heading"
              color="#94a3b8"
              tracking="lg"
              className="uppercase"
            >
              {labels.eyebrow.replace('{count}', String(items.length))}
            </Typography>
          </div>
          <Typography
            uiSize="xs"
            weight="700"
            tracking="md"
            color="#94a3b8"
            className="uppercase cursor-pointer hover:text-[#f5f7ff]"
            onClick={toggleExpanded}
            role="button"
            tabIndex={0}
            aria-expanded={expanded}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleExpanded();
              }
            }}
            data-testid={`shop-row-${id}-toggle`}
            data-expanded={expanded ? 'true' : 'false'}
          >
            {expandLabel}
          </Typography>
        </div>

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
    </div>
  );
}
