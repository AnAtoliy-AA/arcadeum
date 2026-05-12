'use client';
import { Button, GlassCard, YStack, XStack } from '@arcadeum/ui';
import { Spinner, Text } from 'tamagui';
import { useLanguage } from '@/shared/i18n/context';
import {
  type AdminTournamentItem,
  type TournamentGameType,
  type TournamentStatus,
} from '../api';
import { formatSchedule } from '../lib/formatSchedule';
import { getStatusChipColor } from '../lib/statusChip';
import { nextStatuses } from '../lib/transitions';

export interface AdminTournamentsTableLabels {
  empty: { noResults: string; noTournaments: string };
  pagination: { prev: string; next: string; of: string };
  totalLabel: string;
  table: {
    name: string;
    gameType: string;
    scheduled: string;
    status: string;
    registered: string;
    createdBy: string;
    actions: string;
  };
  statusLabels: Record<TournamentStatus, string>;
  gameTypeLabels: Record<TournamentGameType, string>;
  edit: string;
  delete: string;
  transition: string;
  markComplete: string;
}

export interface AdminTournamentsTableProps {
  items: AdminTournamentItem[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  hasFilter: boolean;
  onPageChange: (next: number) => void;
  onEdit: (item: AdminTournamentItem) => void;
  onDelete: (item: AdminTournamentItem) => void;
  onTransition: (item: AdminTournamentItem) => void;
  onMarkComplete: (item: AdminTournamentItem) => void;
  labels: AdminTournamentsTableLabels;
}

const truncate = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s;

export function AdminTournamentsTable({
  items,
  total,
  page,
  pageSize,
  isLoading,
  hasFilter,
  onPageChange,
  onEdit,
  onDelete,
  onTransition,
  onMarkComplete,
  labels,
}: AdminTournamentsTableProps) {
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
        data-testid="tournaments-table-empty"
      >
        <Text opacity={0.7}>
          {hasFilter ? labels.empty.noResults : labels.empty.noTournaments}
        </Text>
      </GlassCard>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <YStack gap="$3" data-testid="tournaments-table">
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
        >
          <Text flex={3} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.name}
          </Text>
          <Text flex={1} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.gameType}
          </Text>
          <Text flex={2} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.scheduled}
          </Text>
          <Text flex={1} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.status}
          </Text>
          <Text flex={1} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.registered}
          </Text>
          <Text flex={1} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.createdBy}
          </Text>
          <Text flex={2} fontWeight="700" fontSize="$1" opacity={0.85}>
            {labels.table.actions}
          </Text>
        </XStack>

        {items.map((item, i) => {
          const fullName = item.content.en.name;
          const chipColor = getStatusChipColor(item.status);
          const canTransition = nextStatuses(item.status).length > 0;
          const canDelete =
            item.status === 'scheduled' || item.status === 'cancelled';
          const canMarkComplete = item.status === 'live';
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
              data-testid={`tournament-row-${item.id}`}
            >
              <YStack flex={3}>
                <span title={fullName}>
                  <Text>{truncate(fullName, 60)}</Text>
                </span>
              </YStack>
              <Text flex={1} fontSize="$1">
                {labels.gameTypeLabels[item.gameType]}
              </Text>
              <Text flex={2} fontSize="$1">
                {formatSchedule(item.scheduledAt, locale)}
              </Text>
              <YStack flex={1}>
                <XStack
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                  backgroundColor={chipColor.bg}
                  alignSelf="flex-start"
                >
                  <Text fontSize="$1" color={chipColor.fg}>
                    {labels.statusLabels[item.status]}
                  </Text>
                </XStack>
              </YStack>
              <Text flex={1} fontSize="$1">
                {item.registeredCount}/{item.maxPlayers}
                {item.waitlistCount > 0 ? ` (+${item.waitlistCount})` : ''}
              </Text>
              <Text flex={1} fontSize="$1" opacity={0.8}>
                {item.createdBy?.displayName ?? '—'}
              </Text>
              <XStack flex={2} gap="$2" flexWrap="wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => onEdit(item)}
                  data-testid={`edit-${item.id}`}
                >
                  {labels.edit}
                </Button>
                {canTransition && (
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => onTransition(item)}
                    data-testid={`transition-${item.id}`}
                  >
                    {labels.transition}
                  </Button>
                )}
                {canMarkComplete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => onMarkComplete(item)}
                    data-testid={`mark-complete-${item.id}`}
                  >
                    {labels.markComplete}
                  </Button>
                )}
                {canDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => onDelete(item)}
                    data-testid={`delete-${item.id}`}
                  >
                    {labels.delete}
                  </Button>
                )}
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
