'use client';

import { useState } from 'react';
import {
  Button,
  GlassCard,
  Spinner,
  Typography,
  InfiniteScroll,
} from '@arcadeum/ui';
import type { AdminUserItem } from '../api';
import type { UserRole } from '@/entities/session/model/types';
import { UsersTableRow } from './UsersTableRow';

export interface UsersTableLabels {
  empty: { noUsers: string; noResults: string };
  table: {
    username: string;
    email: string;
    role: string;
    actions: string;
    selectAll: string;
    selectedCount: string;
    deleteSelected: string;
    deselectAll: string;
  };
  pagination?: { prev: string; next: string; of: string };
  totalLabel: string;
  roleLabels: Record<UserRole, string>;
  selfTooltip: string;
  walletButtonLabel: string;
  blockLabel: string;
  unblockLabel: string;
  removeLabel: string;
  restoreLabel: string;
}

export interface UsersTableProps {
  items: AdminUserItem[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  currentUserId: string;
  hasFilter: boolean;
  onRoleChange: (userId: string, role: UserRole) => void;
  onWalletOpen: (userId: string) => void;
  onBlock: (userId: string) => void;
  onUnblock: (userId: string) => void;
  onDelete: (userId: string) => void;
  onRestore: (userId: string) => void;
  onBulkDelete: (userIds: string[]) => void;
  onLoadMore?: () => void;
  onPageChange?: (next: number) => void;
  pendingUserId?: string;
  labels: UsersTableLabels;
}

export function UsersTable({
  items,
  total,
  isLoading,
  currentUserId,
  hasFilter,
  onRoleChange,
  onWalletOpen,
  onBlock,
  onUnblock,
  onDelete,
  onRestore,
  onBulkDelete,
  onLoadMore,
  pendingUserId,
  labels,
}: UsersTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const hasMore = items.length < total;

  const handleToggleSelect = (userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    const selectableIds = items
      .filter((it) => !it.deletedAt && it.id !== currentUserId)
      .map((it) => it.id);

    if (selectableIds.length === 0) return;

    setSelectedIds((prev) => {
      const allSelected = selectableIds.every((id) => prev.has(id));
      if (allSelected) {
        return new Set();
      }
      return new Set(selectableIds);
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <GlassCard
        className="p-8 items-center justify-center border border-[var(--borderColor)]"
        data-testid="users-table-empty"
      >
        <Typography variant="body" uiSize="md" alpha="medium">
          {hasFilter ? labels.empty.noResults : labels.empty.noUsers}
        </Typography>
      </GlassCard>
    );
  }

  const selectableCount = items.filter(
    (it) => !it.deletedAt && it.id !== currentUserId,
  ).length;
  const allSelectableSelected =
    selectableCount > 0 &&
    items
      .filter((it) => !it.deletedAt && it.id !== currentUserId)
      .every((it) => selectedIds.has(it.id));

  return (
    <InfiniteScroll
      hasMore={hasMore}
      isLoading={isLoading}
      onLoadMore={onLoadMore ?? (() => {})}
      allLoadedText={`All ${total} users loaded`}
      className="gap-4"
      data-testid="users-table"
    >
      <div className="flex flex-row items-center justify-between px-1">
        <Typography variant="heading" uiSize="sm" weight="700">
          Showing {items.length} of {total} users
        </Typography>
      </div>

      <GlassCard className="p-0 overflow-hidden border border-[var(--borderColor)]">
        <div
          className="flex flex-row gap-3 items-center py-2.5 px-3 bg-[var(--backgroundFocus)] border-b border-[var(--borderColor)]"
          data-testid="users-table-header"
        >
          <div className="flex flex-col w-[32px] items-center">
            <input
              type="checkbox"
              checked={allSelectableSelected}
              onChange={handleToggleAll}
              data-testid="select-all-checkbox"
            />
          </div>
          <span className="flex-1 font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
            {labels.table.username}
          </span>
          <span className="w-[120px] font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
            {labels.table.role}
          </span>
          <span className="w-[150px] font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)] text-right">
            {labels.table.actions}
          </span>
        </div>

        {items.map((it, i) => (
          <UsersTableRow
            key={it.id}
            item={it}
            currentUserId={currentUserId}
            onRoleChange={onRoleChange}
            onWalletOpen={onWalletOpen}
            onBlock={onBlock}
            onUnblock={onUnblock}
            onDelete={onDelete}
            onRestore={onRestore}
            roleLabels={labels.roleLabels}
            selfTooltip={labels.selfTooltip}
            walletButtonLabel={labels.walletButtonLabel}
            blockLabel={labels.blockLabel}
            unblockLabel={labels.unblockLabel}
            removeLabel={labels.removeLabel}
            restoreLabel={labels.restoreLabel}
            isPending={pendingUserId === it.id}
            zebra={i % 2 === 1}
            isSelected={selectedIds.has(it.id)}
            onSelectToggle={handleToggleSelect}
          />
        ))}
      </GlassCard>

      {selectedIds.size > 0 && (
        <div
          className="flex flex-row gap-3 items-center justify-between p-3 rounded-xl bg-[var(--backgroundFocus)] border border-[var(--borderColor)]"
          data-testid="bulk-actions-bar"
        >
          <Typography variant="body" uiSize="sm" weight="700">
            {labels.table.selectedCount.replace(
              '{count}',
              String(selectedIds.size),
            )}
          </Typography>
          <div className="flex flex-row items-stretch gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              {labels.table.deselectAll}
            </Button>
            <Button
              variant="danger"
              outline
              size="sm"
              onClick={handleBulkDelete}
              data-testid="bulk-delete-button"
            >
              {labels.table.deleteSelected}
            </Button>
          </div>
        </div>
      )}
    </InfiniteScroll>
  );
}
