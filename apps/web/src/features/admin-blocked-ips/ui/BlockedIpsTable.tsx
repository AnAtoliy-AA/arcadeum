'use client';

import { Button, GlassCard, YStack, XStack } from '@arcadeum/ui';
import { Spinner, Text } from 'tamagui';
import type { BlockedIp } from '../api';

export interface BlockedIpsTableLabels {
  empty: string;
  table: {
    ip: string;
    reason: string;
    expiresAt: string;
    actions: string;
  };
  unblock: string;
  clearAll: string;
  totalLabel: string;
  confirmClearAll: string;
}

export interface BlockedIpsTableProps {
  items: BlockedIp[];
  isLoading: boolean;
  labels: BlockedIpsTableLabels;
  onUnblock: (ip: string) => void;
  onClearAll: () => void;
  pendingIp?: string;
}

function formatExpiry(expiresAt: number): string {
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) return 'Expired';
  const minutes = Math.ceil(remaining / 60_000);
  if (minutes < 60) return `${minutes}m remaining`;
  const hours = Math.ceil(minutes / 60);
  return `${hours}h remaining`;
}

export function BlockedIpsTable({
  items,
  isLoading,
  labels,
  onUnblock,
  onClearAll,
  pendingIp,
}: BlockedIpsTableProps) {
  if (isLoading && items.length === 0) {
    return (
      <YStack alignItems="center" padding="$5">
        <Spinner />
      </YStack>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <GlassCard p="$5" alignItems="center" data-testid="blocked-ips-empty">
        <Text opacity={0.7}>{labels.empty}</Text>
      </GlassCard>
    );
  }

  return (
    <YStack gap="$3" data-testid="blocked-ips-table">
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$1"
      >
        <Text opacity={0.7} fontSize="$1">
          {labels.totalLabel.replace('{total}', String(items.length))}
        </Text>
        <Button
          variant="outline"
          size="sm"
          onPress={onClearAll}
          data-testid="blocked-ips-clear-all"
        >
          {labels.clearAll}
        </Button>
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
          data-testid="blocked-ips-header"
        >
          <Text flex={1} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.ip}
          </Text>
          <Text flex={1} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.reason}
          </Text>
          <Text width={120} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.expiresAt}
          </Text>
          <Text width={100} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.actions}
          </Text>
        </XStack>

        {items.map((item, i) => (
          <XStack
            key={item.ip}
            gap="$3"
            alignItems="center"
            paddingVertical="$2"
            paddingHorizontal="$3"
            backgroundColor={i % 2 === 1 ? '$backgroundFocus' : undefined}
            borderBottomWidth={1}
            borderColor="$borderColor"
            opacity={pendingIp === item.ip ? 0.5 : 1}
            data-testid={`blocked-ip-row-${item.ip}`}
          >
            <Text flex={1} fontSize="$2">
              {item.ip}
            </Text>
            <Text flex={1} fontSize="$2" opacity={0.8}>
              {item.reason}
            </Text>
            <Text width={120} fontSize="$2" opacity={0.7}>
              {formatExpiry(item.expiresAt)}
            </Text>
            <Button
              variant="outline"
              size="sm"
              onPress={() => onUnblock(item.ip)}
              disabled={pendingIp === item.ip}
              data-testid={`blocked-ip-unblock-${item.ip}`}
            >
              {labels.unblock}
            </Button>
          </XStack>
        ))}
      </GlassCard>
    </YStack>
  );
}
