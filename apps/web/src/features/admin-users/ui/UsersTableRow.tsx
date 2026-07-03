'use client';
import { Avatar, Button } from '@arcadeum/ui';
import { XStack, YStack, Text } from 'tamagui';
import type { AdminUserItem } from '../api';
import type { UserRole } from '@/entities/session/model/types';
import { RoleBadge } from './RoleBadge';
import { RoleSelect } from './RoleSelect';

export interface UsersTableRowProps {
  item: AdminUserItem;
  currentUserId: string;
  onRoleChange: (userId: string, role: UserRole) => void;
  onWalletOpen: (userId: string) => void;
  onBlock: (userId: string) => void;
  onUnblock: (userId: string) => void;
  onDelete: (userId: string) => void;
  onRestore: (userId: string) => void;
  roleLabels: Record<UserRole, string>;
  selfTooltip: string;
  walletButtonLabel: string;
  blockLabel: string;
  unblockLabel: string;
  removeLabel: string;
  restoreLabel: string;
  isPending?: boolean;
  zebra?: boolean;
}

export function UsersTableRow({
  item,
  currentUserId,
  onRoleChange,
  onWalletOpen,
  onBlock,
  onUnblock,
  onDelete,
  onRestore,
  roleLabels,
  selfTooltip,
  walletButtonLabel,
  blockLabel,
  unblockLabel,
  removeLabel,
  restoreLabel,
  isPending,
  zebra,
}: UsersTableRowProps) {
  const isSelf = item.id === currentUserId;
  const isBlocked = item.isBlocked;
  const isDeleted = !!item.deletedAt;

  return (
    <XStack
      gap="$3"
      alignItems="center"
      paddingVertical="$2"
      paddingHorizontal="$3"
      backgroundColor={zebra ? '$backgroundFocus' : undefined}
      hoverStyle={{ backgroundColor: '$backgroundHover' }}
      borderBottomWidth={1}
      borderColor="$borderColor"
      opacity={isDeleted ? 0.5 : 1}
      data-testid={`user-row-${item.id}`}
    >
      <Avatar
        name={item.displayName ?? item.username}
        size="sm"
        data-testid={`user-avatar-${item.id}`}
      />
      <YStack flex={1} minWidth={0}>
        <Text fontWeight="700" numberOfLines={1}>
          {item.username}
          {isSelf && (
            <Text opacity={0.6} fontSize="$1">
              {' (you)'}
            </Text>
          )}
          {isBlocked && (
            <Text color="$red10" fontSize="$1">
              {' (blocked)'}
            </Text>
          )}
          {isDeleted && (
            <Text color="$orange10" fontSize="$1">
              {' (removed)'}
            </Text>
          )}
        </Text>
        <Text opacity={0.6} fontSize="$1" numberOfLines={1}>
          {item.email}
        </Text>
        {item.displayName && (
          <Text opacity={0.5} fontSize="$1" numberOfLines={1}>
            {item.displayName}
          </Text>
        )}
      </YStack>
      <RoleBadge role={item.role} label={roleLabels[item.role]} />
      <XStack gap="$2" alignItems="center">
        <span title={isSelf ? selfTooltip : undefined}>
          <RoleSelect
            value={item.role}
            onChange={(r) => onRoleChange(item.id, r)}
            labels={roleLabels}
            disabled={isSelf || isPending || isDeleted}
            testId={`role-select-${item.id}`}
          />
        </span>
        <Button
          variant="outline"
          size="sm"
          onPress={() => onWalletOpen(item.id)}
          disabled={isDeleted}
          data-testid={`wallet-open-${item.id}`}
        >
          {walletButtonLabel}
        </Button>
        {!isDeleted && !isSelf && (
          <>
            {isBlocked ? (
              <Button
                variant="outline"
                size="sm"
                onPress={() => onUnblock(item.id)}
                disabled={isPending}
                data-testid={`unblock-${item.id}`}
              >
                {unblockLabel}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onPress={() => onBlock(item.id)}
                disabled={isPending}
                data-testid={`block-${item.id}`}
              >
                {blockLabel}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              color="$red10"
              onPress={() => onDelete(item.id)}
              disabled={isPending}
              data-testid={`delete-${item.id}`}
            >
              {removeLabel}
            </Button>
          </>
        )}
        {isDeleted && !isSelf && (
          <Button
            variant="outline"
            size="sm"
            onPress={() => onRestore(item.id)}
            disabled={isPending}
            data-testid={`restore-${item.id}`}
          >
            {restoreLabel}
          </Button>
        )}
      </XStack>
    </XStack>
  );
}
