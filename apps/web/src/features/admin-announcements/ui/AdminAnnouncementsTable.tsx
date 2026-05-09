'use client';
import { Button, GlassCard, YStack, XStack } from '@arcadeum/ui';
import { Spinner, Text } from 'tamagui';
import { useLanguage } from '@/shared/i18n/context';
import {
  type AdminAnnouncementItem,
  type AnnouncementAudience,
  type AnnouncementSeverity,
  type AnnouncementStatus,
} from '../api';
import { formatWindow } from '../lib/formatWindow';

export interface AdminAnnouncementsTableLabels {
  empty: { noResults: string; noAnnouncements: string };
  pagination: { prev: string; next: string; of: string };
  totalLabel: string;
  table: {
    title: string;
    severity: string;
    audience: string;
    window: string;
    createdBy: string;
    actions: string;
    nowPill: string;
  };
  severityLabels: Record<AnnouncementSeverity, string>;
  audienceLabels: Record<AnnouncementAudience, string>;
  statusLabels: Record<AnnouncementStatus, string>;
  windowLabels: { now: string; forever: string; always: string };
  edit: string;
  delete: string;
}

export interface AdminAnnouncementsTableProps {
  items: AdminAnnouncementItem[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  hasFilter: boolean;
  onPageChange: (next: number) => void;
  onEdit: (item: AdminAnnouncementItem) => void;
  onDelete: (item: AdminAnnouncementItem) => void;
  labels: AdminAnnouncementsTableLabels;
}

const SEVERITY_COLOR: Record<AnnouncementSeverity, string> = {
  info: '$infoBgSoft',
  warning: '$warningBgSoft',
  critical: '$errorBgSoft',
};

const truncate = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s;

export function AdminAnnouncementsTable({
  items,
  total,
  page,
  pageSize,
  isLoading,
  hasFilter,
  onPageChange,
  onEdit,
  onDelete,
  labels,
}: AdminAnnouncementsTableProps) {
  const { locale } = useLanguage();

  if (isLoading && items.length === 0) {
    return (
      <YStack alignItems="center" padding="$5">
        <Spinner />
      </YStack>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <GlassCard
        p="$5"
        alignItems="center"
        data-testid="announcements-table-empty"
      >
        <Text opacity={0.7}>
          {hasFilter ? labels.empty.noResults : labels.empty.noAnnouncements}
        </Text>
      </GlassCard>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <YStack gap="$3" data-testid="announcements-table">
      <Text opacity={0.7} fontSize="$1" paddingHorizontal="$1">
        {labels.totalLabel
          .replace('{start}', String(start))
          .replace('{end}', String(end))
          .replace('{total}', String(total))}
      </Text>

      <GlassCard p="$0" overflow="hidden">
        <XStack
          paddingVertical="$2"
          paddingHorizontal="$3"
          backgroundColor="$backgroundFocus"
          borderBottomWidth={1}
          borderColor="$borderColor"
          gap="$3"
          data-testid="announcements-table-header"
        >
          <Text flex={3} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.title}
          </Text>
          <Text flex={1} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.severity}
          </Text>
          <Text flex={1} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.audience}
          </Text>
          <Text flex={2} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.window}
          </Text>
          <Text flex={1} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.createdBy}
          </Text>
          <Text flex={1} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.actions}
          </Text>
        </XStack>

        {items.map((item, i) => {
          const fullTitle = item.content.en.title;
          return (
            <XStack
              key={item.id}
              paddingVertical="$2"
              paddingHorizontal="$3"
              gap="$3"
              alignItems="center"
              backgroundColor={i % 2 === 1 ? '$backgroundFocus' : undefined}
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
              borderBottomWidth={1}
              borderColor="$borderColor"
              data-testid={`announcement-row-${item.id}`}
            >
              <YStack flex={3}>
                <span title={fullTitle}>
                  <Text>{truncate(fullTitle, 60)}</Text>
                </span>
              </YStack>
              <YStack flex={1}>
                <XStack
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                  backgroundColor={SEVERITY_COLOR[item.severity]}
                  alignSelf="flex-start"
                >
                  <Text fontSize="$1">
                    {labels.severityLabels[item.severity]}
                  </Text>
                </XStack>
              </YStack>
              <Text flex={1}>{labels.audienceLabels[item.audience]}</Text>
              <YStack flex={2} gap="$1">
                <Text fontSize="$1">
                  {formatWindow(
                    item.startsAt,
                    item.endsAt,
                    locale,
                    labels.windowLabels,
                  )}
                </Text>
                {item.status === 'active' && (
                  <XStack
                    paddingHorizontal="$2"
                    paddingVertical={2}
                    borderRadius="$2"
                    backgroundColor="$successBgSoft"
                    alignSelf="flex-start"
                  >
                    <Text fontSize="$1" fontWeight="600">
                      {labels.table.nowPill}
                    </Text>
                  </XStack>
                )}
              </YStack>
              <Text flex={1} fontSize="$1" opacity={0.8}>
                {item.createdBy?.displayName ?? '—'}
              </Text>
              <XStack flex={1} gap="$2">
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => onEdit(item)}
                  data-testid={`edit-${item.id}`}
                >
                  {labels.edit}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => onDelete(item)}
                  data-testid={`delete-${item.id}`}
                >
                  {labels.delete}
                </Button>
              </XStack>
            </XStack>
          );
        })}
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
