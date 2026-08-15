'use client';
import { useState } from 'react';
import { Button, GlassCard } from '@arcadeum/ui';
import { Spinner } from '@/shared/ui/CSSSpinner';
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
  pagination: { prev: string; next: string; of: string };
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
  page: number;
  pageSize: number;
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
  onPageChange: (next: number) => void;
  pendingUserId?: string;
  labels: UsersTableLabels;
}

export function UsersTable({
  items,
  total,
  page,
  pageSize,
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
  onPageChange,
  pendingUserId,
  labels,
}: UsersTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
      <div className="box-border flex flex-col items-center p-5">
        <Spinner />
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <GlassCard className={'p-5 items-center'} data-testid="users-table-empty">
        <span className="box-border opacity-[0.7]">
          {hasFilter ? labels.empty.noResults : labels.empty.noUsers}
        </span>
      </GlassCard>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const selectableCount = items.filter(
    (it) => !it.deletedAt && it.id !== currentUserId,
  ).length;
  const allSelectableSelected =
    selectableCount > 0 &&
    items
      .filter((it) => !it.deletedAt && it.id !== currentUserId)
      .every((it) => selectedIds.has(it.id));

  return (
    <div
      className="box-border flex flex-col items-stretch gap-3"
      data-testid="users-table"
    >
      <div className="box-border flex flex-row items-center justify-between px-1">
        <span className="box-border opacity-[0.7] text-[12px]">
          {labels.totalLabel.replace('{total}', String(total))}
        </span>
      </div>

      <GlassCard className={'p-0 overflow-hidden'}>
        <div
          className="box-border flex flex-row gap-3 items-center py-2 px-3 bg-[var(--backgroundFocus)] border-b border-[var(--borderColor)]"
          data-testid="users-table-header"
        >
          <div className="box-border flex flex-col w-[32px] items-center">
            <input
              type="checkbox"
              checked={allSelectableSelected}
              onChange={handleToggleAll}
              data-testid="select-all-checkbox"
            />
          </div>
          <span className="box-border flex-1 font-bold text-[12px] opacity-[0.85]">
            {labels.table.username}
          </span>
          <span className="box-border w-[120px] font-bold text-[12px] opacity-[0.85]">
            {labels.table.role}
          </span>
          <span className="box-border w-[150px] font-bold text-[12px] opacity-[0.85]">
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
          className="box-border flex flex-row gap-3 items-center justify-between p-3 rounded-xl bg-[var(--backgroundFocus)]"
          data-testid="bulk-actions-bar"
        >
          <span className="box-border text-[14px] opacity-[0.8]">
            {labels.table.selectedCount.replace(
              '{count}',
              String(selectedIds.size),
            )}
          </span>
          <div className="box-border flex flex-row items-stretch gap-2">
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

      <div className="box-border flex flex-row gap-3 items-center justify-center pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          {labels.pagination.prev}
        </Button>
        <span className="box-border opacity-[0.8] text-[14px]">
          {labels.pagination.of
            .replace('{current}', String(page))
            .replace('{total}', String(totalPages))}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          {labels.pagination.next}
        </Button>
      </div>
    </div>
  );
}
