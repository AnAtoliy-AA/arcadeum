'use client';

import { useState, useMemo } from 'react';
import { GlassCard, Spinner, Typography, Button } from '@arcadeum/ui';

export interface AdminDataTableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
}

export type AdminDataTableColumns<T> = AdminDataTableColumn<T> | AdminDataTableColumn<T>[];

export interface AdminDataTableProps<T> {
  items: T[];
  total: number;
  isLoading: boolean;
  isError?: boolean;
  columns: AdminDataTableColumn<T>[];
  keyExtractor: (item: T) => string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleAll?: () => void;
  onBulkAction?: (ids: string[], action: string) => void;
  onLoadMore?: () => void;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;
  labels?: {
    empty?: string;
    loading?: string;
    error?: string;
    retry?: string;
    selectAll?: string;
    deselectAll?: string;
    selectedCount?: string;
    loadMore?: string;
  };
  actions?: Array<{
    label: string;
    onClick: (item: T) => void;
    className?: string;
    disabled?: (item: T) => boolean;
  }>;
}

export function AdminDataTable<T>({
  items,
  total,
  isLoading,
  isError = false,
  columns,
  keyExtractor,
  selectable = false,
  selectedIds = new Set(),
  onToggleSelect,
  onToggleAll,
  onBulkAction,
  onLoadMore,
  emptyMessage = 'No items found',
  loadingMessage = 'Loading...',
  errorMessage = 'Failed to load data',
  onRetry,
  labels = {},
  actions = [],
}: AdminDataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedItems = useMemo(() => {
    if (!sortKey) return items;

    return [...items].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [items, sortKey, sortDirection]);

  const allSelected =
    selectable &&
    items.length > 0 &&
    items.every((item) => selectedIds.has(keyExtractor(item)));
  const someSelected = selectable && selectedIds.size > 0;

  if (isError) {
    return (
      <GlassCard className="p-8">
        <div className="flex flex-col items-center gap-4">
          <Typography variant="body" className="text-[var(--error)]">
            {labels.error || errorMessage}
          </Typography>
          {onRetry && (
            <Button variant="ghost" onClick={onRetry}>
              {labels.retry || 'Retry'}
            </Button>
          )}
        </div>
      </GlassCard>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <GlassCard className="p-8">
        <div className="flex items-center justify-center gap-2">
          <Spinner size="sm" />
          <Typography variant="body" className="opacity-70">
            {labels.loading || loadingMessage}
          </Typography>
        </div>
      </GlassCard>
    );
  }

  if (items.length === 0) {
    return (
      <GlassCard className="p-8">
        <div className="flex flex-col items-center gap-2">
          <Typography variant="body" className="opacity-70">
            {labels.empty || emptyMessage}
          </Typography>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      {/* Bulk actions bar */}
      {selectable && someSelected && (
        <div className="flex items-center gap-4 px-4 py-2 bg-[var(--glassBg)] border-b border-[var(--border)]">
          <Typography variant="body" className="text-sm">
            {labels.selectedCount?.replace(
              '{count}',
              String(selectedIds.size),
            ) || `${selectedIds.size} selected`}
          </Typography>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBulkAction?.(Array.from(selectedIds), 'delete')}
          >
            Delete Selected
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBulkAction?.(Array.from(selectedIds), 'deselect')}
          >
            {labels.deselectAll || 'Deselect All'}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {selectable && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={onToggleAll}
                    className="cursor-pointer"
                    aria-label={labels.selectAll || 'Select all'}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left cursor-pointer hover:bg-[var(--glassBg)] ${col.className || ''}`}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key && (
                      <span className="text-xs opacity-50">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-4 py-3 text-right">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => {
              const id = keyExtractor(item);
              return (
                <tr
                  key={id}
                  className="border-b border-[var(--border)] hover:bg-[var(--glassBg)]"
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(id)}
                        onChange={() => onToggleSelect?.(id)}
                        className="cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ${col.className || ''}`}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {actions.map((action, idx) => (
                          <Button
                            key={idx}
                            variant="ghost"
                            size="sm"
                            onClick={() => action.onClick(item)}
                            disabled={action.disabled?.(item)}
                            className={action.className}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Load more */}
      {onLoadMore && items.length < total && (
        <div className="flex justify-center p-4 border-t border-[var(--border)]">
          <Button variant="ghost" onClick={onLoadMore}>
            {labels.loadMore || 'Load More'}
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 text-sm opacity-70 border-t border-[var(--border)]">
        <span>
          Showing {items.length} of {total}
        </span>
      </div>
    </GlassCard>
  );
}
