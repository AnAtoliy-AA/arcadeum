'use client';
import { Text, View } from 'tamagui';
import type { UserRole } from '@/entities/session/model/types';
import { ROLE_COLORS } from '../lib/roleColors';

export function RoleBadge({ role, label }: { role: UserRole; label: string }) {
  const c = ROLE_COLORS[role];
  return (
    <View
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius="$2"
      backgroundColor={c.bg}
      alignSelf="flex-start"
      data-testid={`role-badge-${role}`}
    >
      <Text fontSize="$2" fontWeight="700" color={c.fg}>
        {label}
      </Text>
    </View>
  );
}
