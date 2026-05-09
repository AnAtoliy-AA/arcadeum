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
  roleLabels: Record<UserRole, string>;
  selfTooltip: string;
  walletButtonLabel: string;
  isPending?: boolean;
  zebra?: boolean;
}

export function UsersTableRow({
  item,
  currentUserId,
  onRoleChange,
  onWalletOpen,
  roleLabels,
  selfTooltip,
  walletButtonLabel,
  isPending,
  zebra,
}: UsersTableRowProps) {
  const isSelf = item.id === currentUserId;
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
            disabled={isSelf || isPending}
            testId={`role-select-${item.id}`}
          />
        </span>
        <Button
          variant="outline"
          size="sm"
          onPress={() => onWalletOpen(item.id)}
          data-testid={`wallet-open-${item.id}`}
        >
          {walletButtonLabel}
        </Button>
      </XStack>
    </XStack>
  );
}
