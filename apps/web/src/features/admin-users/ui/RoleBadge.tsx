'use client';
import { Text, View } from 'tamagui';
import type { UserRole } from '@/entities/session/model/types';
import { ROLE_COLORS } from '../lib/roleColors';

const FALLBACK_COLOR = { fg: '$gray9', bg: '$gray3' };

export function RoleBadge({ role, label }: { role: UserRole; label: string }) {
  const c = ROLE_COLORS[role] ?? FALLBACK_COLOR;
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
