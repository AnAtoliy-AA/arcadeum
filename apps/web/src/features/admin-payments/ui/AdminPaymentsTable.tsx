'use client';
import { Button, GlassCard, YStack, XStack } from '@arcadeum/ui';
import { Spinner, Text, View } from 'tamagui';
import type { AdminPaymentNoteItem } from '../api';

export interface AdminPaymentsTableLabels {
  empty: { noNotes: string; noResults: string };
  pagination: { prev: string; next: string; of: string };
  totalLabel: string;
  chipPublic: string;
  chipPrivate: string;
  anonymous: string;
  header?: {
    user: string;
    amount: string;
    note: string;
    visibility: string;
    createdAt: string;
  };
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
      <YStack alignItems="center" padding="$5">
        <Spinner />
      </YStack>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <GlassCard p="$5" alignItems="center" data-testid="admin-payments-empty">
        <Text opacity={0.7}>
          {hasFilter ? labels.empty.noResults : labels.empty.noNotes}
        </Text>
      </GlassCard>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <YStack gap="$3" data-testid="admin-payments-table">
      <Text opacity={0.7} fontSize="$1" paddingHorizontal="$1">
        {labels.totalLabel.replace('{total}', String(total))}
      </Text>

      <GlassCard p="$0" overflow="hidden">
        {labels.header && (
          <XStack
            gap="$3"
            alignItems="center"
            paddingVertical="$2"
            paddingHorizontal="$3"
            backgroundColor="$backgroundFocus"
            borderBottomWidth={1}
            borderColor="$borderColor"
            data-testid="admin-payments-header"
          >
            <Text flex={1} fontWeight="700" fontSize="$1" opacity={0.85}>
              {labels.header.user}
            </Text>
            <Text
              width={120}
              textAlign="right"
              fontWeight="700"
              fontSize="$1"
              opacity={0.85}
            >
              {labels.header.amount}
            </Text>
            <Text
              style={{ flex: 2 }}
              fontWeight="700"
              fontSize="$1"
              opacity={0.85}
            >
              {labels.header.note}
            </Text>
            <Text width={88} fontWeight="700" fontSize="$1" opacity={0.85}>
              {labels.header.visibility}
            </Text>
            <Text width={140} fontWeight="700" fontSize="$1" opacity={0.85}>
              {labels.header.createdAt}
            </Text>
          </XStack>
        )}

        {items.map((it, i) => (
          <XStack
            key={it.id}
            gap="$3"
            alignItems="center"
            paddingVertical="$2"
            paddingHorizontal="$3"
            backgroundColor={i % 2 === 1 ? '$backgroundFocus' : undefined}
            hoverStyle={{ backgroundColor: '$backgroundHover' }}
            borderBottomWidth={1}
            borderColor="$borderColor"
            data-testid={`payment-row-${it.id}`}
          >
            <View flex={1} minWidth={0}>
              <Text fontWeight="700" numberOfLines={1}>
                {it.displayName ?? labels.anonymous}
              </Text>
              <Text
                opacity={0.5}
                fontSize="$1"
                numberOfLines={1}
                style={{ fontFamily: 'monospace' }}
              >
                {it.transactionId}
              </Text>
            </View>
            <Text width={120} textAlign="right" fontWeight="600">
              {formatAmount(it.amount, it.currency)}
            </Text>
            <span style={{ flex: 2 }} title={it.note}>
              <Text>{truncate(it.note, 200)}</Text>
            </span>
            <View
              width={88}
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$2"
              backgroundColor={it.isPublic ? '$green3' : '$gray3'}
              alignSelf="center"
              data-testid={`visibility-${it.id}`}
            >
              <Text
                fontSize="$1"
                fontWeight="700"
                color={it.isPublic ? '$green9' : '$gray9'}
                textAlign="center"
              >
                {it.isPublic ? labels.chipPublic : labels.chipPrivate}
              </Text>
            </View>
            <Text width={140} opacity={0.6} fontSize="$1">
              {new Date(it.createdAt).toLocaleString()}
            </Text>
          </XStack>
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
