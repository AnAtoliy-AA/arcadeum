'use client';

import { useState, useCallback } from 'react';
import {
  Button,
  GlassCard,
  Badge,
  Typography,
  InfiniteScroll,
} from '@arcadeum/ui';
import type { EffectiveShopItem } from '@/features/shop/server/shop.types';
import type { adminShopEn } from '@/shared/i18n/messages/pages/admin-shop/en';
import { AdminShopEditDialog } from './AdminShopEditDialog';
import { AdminShopGrantDialog } from './AdminShopGrantDialog';
import { AdminShopItemPreview } from './AdminShopItemPreview';

type Labels = typeof adminShopEn;

interface Props {
  catalog: EffectiveShopItem[];
  labels: Labels;
  initialBatchSize?: number;
  batchSize?: number;
}

export function AdminShopTable({
  catalog,
  labels,
  initialBatchSize = 10,
  batchSize = 10,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(catalog.length, initialBatchSize),
  );
  const [editing, setEditing] = useState<EffectiveShopItem | null>(null);
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantDefaultItemId, setGrantDefaultItemId] = useState<
    string | undefined
  >(undefined);

  const hasMore = visibleCount < catalog.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(catalog.length, prev + batchSize));
  }, [catalog.length, batchSize]);

  if (catalog.length === 0) {
    return (
      <GlassCard
        className="flex flex-col items-center justify-center p-8 border border-[var(--borderColor)]"
        data-testid="admin-shop-empty"
      >
        <Typography variant="body" uiSize="md" alpha="medium">
          {labels.empty}
        </Typography>
      </GlassCard>
    );
  }

  const visibleItems = catalog.slice(0, visibleCount);

  const openGrantForItem = (itemId?: string) => {
    setGrantDefaultItemId(itemId);
    setGrantOpen(true);
  };

  const countText = (
    labels.showingCount ?? 'Showing {current} of {total} items'
  )
    .replace('{current}', String(visibleItems.length))
    .replace('{total}', String(catalog.length));

  const allLoadedText = (
    labels.allLoaded ?? 'All {total} items loaded'
  ).replace('{total}', String(catalog.length));

  return (
    <InfiniteScroll
      hasMore={hasMore}
      onLoadMore={loadMore}
      loadMoreText={labels.loadMore ?? 'Load more'}
      allLoadedText={allLoadedText}
      className="gap-4"
      data-testid="admin-shop-container"
    >
      <div className="flex flex-row justify-between items-center">
        <Typography
          variant="heading"
          uiSize="sm"
          weight="700"
          data-testid="admin-shop-count-header"
        >
          {countText}
        </Typography>
        <Button
          onClick={() => openGrantForItem(undefined)}
          data-testid="admin-shop-grant-open"
        >
          {labels.buttons.grant}
        </Button>
      </div>

      <GlassCard className="p-0 overflow-hidden border border-[var(--borderColor)]">
        <div className="overflow-x-auto">
          <table
            className="w-full text-left border-collapse text-sm"
            data-testid="admin-shop-table"
          >
            <thead>
              <tr className="border-b border-[var(--borderColor)] bg-[var(--backgroundFocus)] text-[var(--colorTextSecondary,#a1a1aa)] text-xs uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">{labels.columns.id}</th>
                <th className="py-3 px-4 font-bold">
                  {labels.columns.category}
                </th>
                <th className="py-3 px-4 font-bold">{labels.columns.rarity}</th>
                <th className="py-3 px-4 font-bold">
                  {labels.columns.defaultPrice}
                </th>
                <th className="py-3 px-4 font-bold">
                  {labels.columns.effectivePrice}
                </th>
                <th className="py-3 px-4 font-bold text-center">
                  {labels.columns.available}
                </th>
                <th className="py-3 px-4 font-bold text-right">
                  {labels.columns.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--borderColor)]">
              {visibleItems.map((item) => {
                const overridden = item.overridden;
                return (
                  <tr
                    key={item.id}
                    data-testid={`admin-shop-row-${item.id}`}
                    className="hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex flex-row items-center gap-3">
                        <AdminShopItemPreview
                          size={32}
                          colorValue={item.colorValue}
                          assetUrl={item.assetUrl}
                          itemId={item.id}
                        />
                        <code className="text-xs bg-[rgba(255,255,255,0.08)] px-1.5 py-0.5 rounded font-mono text-[var(--colorText)]">
                          {item.id}
                        </code>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--colorText)]">
                      {labels.category[item.category] ?? item.category}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="neutral"
                        size="sm"
                        className="capitalize text-[10px]"
                      >
                        {labels.rarity[item.rarity] ?? item.rarity}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-[var(--colorTextSecondary,#a1a1aa)] font-mono text-xs">
                      {item.defaultPriceAmount} {item.defaultPriceCurrency}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-row items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-[var(--colorText)]">
                          {item.priceAmount} {item.priceCurrency}
                        </span>
                        {overridden ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[rgba(167,139,250,0.18)] text-[#a78bfa] border border-[rgba(167,139,250,0.3)]">
                            {labels.columns.overridden}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.available ? (
                        <span className="text-emerald-400 font-bold">✓</span>
                      ) : (
                        <span className="text-[var(--colorTextSecondary,#71717a)]">
                          —
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex flex-row items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(item)}
                          data-testid={`admin-shop-edit-${item.id}`}
                        >
                          {labels.buttons.edit}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openGrantForItem(item.id)}
                          data-testid={`admin-shop-grant-row-${item.id}`}
                        >
                          {labels.buttons.grant}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <AdminShopEditDialog
        item={editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
        labels={labels}
      />
      <AdminShopGrantDialog
        open={grantOpen}
        onClose={() => setGrantOpen(false)}
        labels={labels}
        defaultItemId={grantDefaultItemId}
        catalog={catalog}
      />
    </InfiniteScroll>
  );
}
