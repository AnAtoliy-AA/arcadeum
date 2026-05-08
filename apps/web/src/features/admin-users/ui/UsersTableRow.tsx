'use client';
import { XStack, Text, View } from 'tamagui';
import type { AdminUserItem } from '../api';
import type { UserRole } from '@/entities/session/model/types';
import { RoleBadge } from './RoleBadge';
import { RoleSelect } from './RoleSelect';

export interface UsersTableRowProps {
  item: AdminUserItem;
  currentUserId: string;
  onRoleChange: (userId: string, role: UserRole) => void;
  roleLabels: Record<UserRole, string>;
  selfTooltip: string;
  isPending?: boolean;
}

export function UsersTableRow({
  item,
  currentUserId,
  onRoleChange,
  roleLabels,
  selfTooltip,
  isPending,
}: UsersTableRowProps) {
  const isSelf = item.id === currentUserId;
  return (
    <XStack
      gap="$3"
      alignItems="center"
      paddingVertical="$2"
      borderBottomWidth={1}
      borderColor="$borderColor"
      data-testid={`user-row-${item.id}`}
    >
      <View flex={1}>
        <Text fontWeight="700">{item.username}</Text>
        <Text opacity={0.6} fontSize="$1">
          {item.email}
        </Text>
        {item.displayName && (
          <Text opacity={0.5} fontSize="$1">
            {item.displayName}
          </Text>
        )}
      </View>
      <RoleBadge role={item.role} label={roleLabels[item.role]} />
      <span title={isSelf ? selfTooltip : undefined}>
        <RoleSelect
          value={item.role}
          onChange={(r) => onRoleChange(item.id, r)}
          labels={roleLabels}
          disabled={isSelf || isPending}
          testId={`role-select-${item.id}`}
        />
      </span>
    </XStack>
  );
}
