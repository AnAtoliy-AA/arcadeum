'use client';
import { Button, GlassCard, YStack, XStack } from '@arcadeum/ui';
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
  walletButtonLabel: string;
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
  onPageChange,
  pendingUserId,
  labels,
}: UsersTableProps) {
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
          <YStack width={32} />
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
            roleLabels={labels.roleLabels}
            selfTooltip={labels.selfTooltip}
            walletButtonLabel={labels.walletButtonLabel}
            isPending={pendingUserId === it.id}
            zebra={i % 2 === 1}
          />
        ))}
      </GlassCard>

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
