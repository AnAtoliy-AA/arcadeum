'use client';
import { Button, YStack, XStack } from '@arcadeum/ui';
import { Spinner, Text } from 'tamagui';
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
  };
  pagination: { prev: string; next: string; of: string };
  totalLabel: string;
  roleLabels: Record<UserRole, string>;
  selfTooltip: string;
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
  onPageChange,
  pendingUserId,
  labels,
}: UsersTableProps) {
  if (isLoading && items.length === 0) {
    return (
      <YStack alignItems="center" padding="$4">
        <Spinner />
      </YStack>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <YStack alignItems="center" padding="$4" data-testid="users-table-empty">
        <Text opacity={0.7}>
          {hasFilter ? labels.empty.noResults : labels.empty.noUsers}
        </Text>
      </YStack>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <YStack gap="$2" data-testid="users-table">
      <Text opacity={0.7} fontSize="$1">
        {labels.totalLabel.replace('{total}', String(total))}
      </Text>
      {items.map((it) => (
        <UsersTableRow
          key={it.id}
          item={it}
          currentUserId={currentUserId}
          onRoleChange={onRoleChange}
          roleLabels={labels.roleLabels}
          selfTooltip={labels.selfTooltip}
          isPending={pendingUserId === it.id}
        />
      ))}
      <XStack
        gap="$3"
        alignItems="center"
        justifyContent="center"
        paddingTop="$3"
      >
        <Button onPress={() => onPageChange(page - 1)} disabled={page <= 1}>
          {labels.pagination.prev}
        </Button>
        <Text>
          {labels.pagination.of
            .replace('{current}', String(page))
            .replace('{total}', String(totalPages))}
        </Text>
        <Button
          onPress={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          {labels.pagination.next}
        </Button>
      </XStack>
    </YStack>
  );
}
