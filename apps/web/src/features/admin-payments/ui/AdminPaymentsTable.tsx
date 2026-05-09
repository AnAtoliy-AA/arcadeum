'use client';
import { Button, YStack, XStack } from '@arcadeum/ui';
import { Spinner, Text, View } from 'tamagui';
import type { AdminPaymentNoteItem } from '../api';

export interface AdminPaymentsTableLabels {
  empty: { noNotes: string; noResults: string };
  pagination: { prev: string; next: string; of: string };
  totalLabel: string;
  chipPublic: string;
  chipPrivate: string;
  anonymous: string;
}

export interface AdminPaymentsTableProps {
  items: AdminPaymentNoteItem[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  hasFilter: boolean;
  onPageChange: (next: number) => void;
  labels: AdminPaymentsTableLabels;
}

function formatAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

export function AdminPaymentsTable({
  items,
  total,
  page,
  pageSize,
  isLoading,
  hasFilter,
  onPageChange,
  labels,
}: AdminPaymentsTableProps) {
  if (isLoading && items.length === 0) {
    return (
      <YStack alignItems="center" padding="$4">
        <Spinner />
      </YStack>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <YStack
        alignItems="center"
        padding="$4"
        data-testid="admin-payments-empty"
      >
        <Text opacity={0.7}>
          {hasFilter ? labels.empty.noResults : labels.empty.noNotes}
        </Text>
      </YStack>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <YStack gap="$2" data-testid="admin-payments-table">
      <Text opacity={0.7} fontSize="$1">
        {labels.totalLabel.replace('{total}', String(total))}
      </Text>
      {items.map((it) => (
        <XStack
          key={it.id}
          gap="$3"
          alignItems="center"
          paddingVertical="$2"
          borderBottomWidth={1}
          borderColor="$borderColor"
          data-testid={`payment-row-${it.id}`}
        >
          <View flex={1}>
            <Text fontWeight="700">{it.displayName ?? labels.anonymous}</Text>
            <Text
              opacity={0.5}
              fontSize="$1"
              style={{ fontFamily: 'monospace' }}
            >
              {it.transactionId}
            </Text>
          </View>
          <Text width={120} textAlign="right">
            {formatAmount(it.amount, it.currency)}
          </Text>
          <span style={{ flex: 2 }} title={it.note}>
            <Text>{truncate(it.note, 200)}</Text>
          </span>
          <View
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$2"
            backgroundColor={it.isPublic ? '$green3' : '$gray3'}
            data-testid={`visibility-${it.id}`}
          >
            <Text
              fontSize="$1"
              fontWeight="700"
              color={it.isPublic ? '$green9' : '$gray9'}
            >
              {it.isPublic ? labels.chipPublic : labels.chipPrivate}
            </Text>
          </View>
          <Text opacity={0.6} fontSize="$1">
            {new Date(it.createdAt).toLocaleString()}
          </Text>
        </XStack>
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
