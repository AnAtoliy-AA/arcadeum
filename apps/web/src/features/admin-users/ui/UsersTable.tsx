'use client';
import { useState } from 'react';
import { Button, GlassCard, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
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
      <YStack alignItems="center" padding="$5">
        <Spinner />
      </YStack>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <GlassCard p="$5" alignItems="center" data-testid="users-table-empty">
        <Text opacity={0.7}>
          {hasFilter ? labels.empty.noResults : labels.empty.noUsers}
        </Text>
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
    <YStack gap="$3" data-testid="users-table">
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$1"
      >
        <Text opacity={0.7} fontSize="$1">
          {labels.totalLabel.replace('{total}', String(total))}
        </Text>
      </XStack>

      <GlassCard p="$0" overflow="hidden">
        <XStack
          gap="$3"
          alignItems="center"
          paddingVertical="$2"
          paddingHorizontal="$3"
          backgroundColor="$backgroundFocus"
          borderBottomWidth={1}
          borderColor="$borderColor"
          data-testid="users-table-header"
        >
          <YStack width={32} alignItems="center">
            <input
              type="checkbox"
              checked={allSelectableSelected}
              onChange={handleToggleAll}
              data-testid="select-all-checkbox"
            />
          </YStack>
          <Text flex={1} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.username}
          </Text>
          <Text width={120} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.role}
          </Text>
          <Text width={150} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.actions}
          </Text>
        </XStack>

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
        <XStack
          gap="$3"
          alignItems="center"
          justifyContent="space-between"
          padding="$3"
          borderRadius="$3"
          backgroundColor="$backgroundFocus"
          data-testid="bulk-actions-bar"
        >
          <Text fontSize="$2" opacity={0.8}>
            {labels.table.selectedCount.replace(
              '{count}',
              String(selectedIds.size),
            )}
          </Text>
          <XStack gap="$2">
            <Button
              variant="outline"
              size="sm"
              onPress={() => setSelectedIds(new Set())}
            >
              {labels.table.deselectAll}
            </Button>
            <Button
              variant="outline"
              size="sm"
              color="$red10"
              onPress={handleBulkDelete}
              data-testid="bulk-delete-button"
            >
              {labels.table.deleteSelected}
            </Button>
          </XStack>
        </XStack>
      )}

      <XStack
        gap="$3"
        alignItems="center"
        justifyContent="center"
        paddingTop="$2"
      >
        <Button
          variant="outline"
          size="sm"
          onPress={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          {labels.pagination.prev}
        </Button>
        <Text opacity={0.8} fontSize="$2">
          {labels.pagination.of
            .replace('{current}', String(page))
            .replace('{total}', String(totalPages))}
        </Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          {labels.pagination.next}
        </Button>
      </XStack>
    </YStack>
  );
}
