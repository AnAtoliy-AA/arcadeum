'use client';

import {
  Button,
  GlassCard,
  Spinner,
  Typography,
  InfiniteScroll,
} from '@arcadeum/ui';
import { useLanguage } from '@/shared/i18n/context';
import {
  type AdminTournamentItem,
  type TournamentGameType,
  type TournamentStatus,
} from '../api';
import { formatSchedule } from '../lib/formatSchedule';
import { nextStatuses } from '../lib/transitions';

export interface AdminTournamentsTableLabels {
  empty: { noResults: string; noTournaments: string };
  pagination?: { prev: string; next: string; of: string };
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
  isLoading: boolean;
  hasFilter: boolean;
  onLoadMore?: () => void;
  onEdit: (item: AdminTournamentItem) => void;
  onDelete: (item: AdminTournamentItem) => void;
  onTransition: (item: AdminTournamentItem) => void;
  onMarkComplete: (item: AdminTournamentItem) => void;
  labels: AdminTournamentsTableLabels;
}

const truncate = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s;

function getStatusBadgeStyle(status: TournamentStatus): string {
  switch (status) {
    case 'live':
      return 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400';
    case 'scheduled':
      return 'bg-sky-950/50 border-sky-500/30 text-sky-400';
    case 'completed':
      return 'bg-purple-950/50 border-purple-500/30 text-purple-400';
    case 'cancelled':
      return 'bg-rose-950/50 border-rose-500/30 text-rose-400';
    default:
      return 'bg-zinc-800/50 border-zinc-500/30 text-zinc-400';
  }
}

export function AdminTournamentsTable({
  items,
  total,
  isLoading,
  hasFilter,
  onLoadMore,
  onEdit,
  onDelete,
  onTransition,
  onMarkComplete,
  labels,
}: AdminTournamentsTableProps) {
  const { locale } = useLanguage();
  const hasMore = items.length < total;

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <GlassCard
        className="p-8 items-center justify-center border border-[var(--borderColor)]"
        data-testid="tournaments-table-empty"
      >
        <Typography variant="body" uiSize="md" alpha="medium">
          {hasFilter ? labels.empty.noResults : labels.empty.noTournaments}
        </Typography>
      </GlassCard>
    );
  }

  return (
    <InfiniteScroll
      hasMore={hasMore}
      isLoading={isLoading}
      onLoadMore={onLoadMore ?? (() => {})}
      allLoadedText={`All ${total} tournaments loaded`}
      className="gap-4"
      data-testid="tournaments-table"
    >
      <div className="flex flex-row items-center justify-between px-1">
        <Typography variant="heading" uiSize="sm" weight="700">
          Showing {items.length} of {total} tournaments
        </Typography>
      </div>

      <GlassCard className="p-0 overflow-hidden border border-[var(--borderColor)]">
        <div className="flex flex-row items-center py-2.5 px-3 bg-[var(--backgroundFocus)] border-b border-[var(--borderColor)] gap-3">
          <span className="flex-[3] font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
            {labels.table.name}
          </span>
          <span className="flex-1 font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
            {labels.table.gameType}
          </span>
          <span className="flex-[2] font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
            {labels.table.scheduled}
          </span>
          <span className="flex-1 font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
            {labels.table.status}
          </span>
          <span className="flex-1 font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
            {labels.table.registered}
          </span>
          <span className="flex-1 font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
            {labels.table.createdBy}
          </span>
          <span className="flex-[2] font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)] text-right">
            {labels.table.actions}
          </span>
        </div>

        <div className="divide-y divide-[var(--borderColor)]">
          {items.map((item, i) => {
            const fullName = item.content.en.name;
            const badgeClass = getStatusBadgeStyle(item.status);
            const canTransition = nextStatuses(item.status).length > 0;
            const canDelete =
              item.status === 'scheduled' || item.status === 'cancelled';
            const canMarkComplete = item.status === 'live';

            return (
              <div
                className={`flex flex-row py-3 px-3 gap-3 items-center hover:bg-[rgba(255,255,255,0.03)] transition-colors ${
                  i % 2 === 1 ? 'bg-[var(--backgroundFocus)]' : ''
                }`}
                key={item.id}
                data-testid={`tournament-row-${item.id}`}
              >
                <div className="flex flex-col items-stretch flex-[3]">
                  <span
                    title={fullName}
                    className="text-sm font-semibold text-[var(--colorText)]"
                  >
                    {truncate(fullName, 60)}
                  </span>
                </div>
                <span className="flex-1 text-xs text-[var(--colorTextSecondary,#d4d4d8)] capitalize">
                  {labels.gameTypeLabels[item.gameType] ?? item.gameType}
                </span>
                <span className="flex-[2] text-xs text-[var(--colorTextSecondary,#d4d4d8)] font-mono">
                  {formatSchedule(item.scheduledAt, locale)}
                </span>
                <div className="flex flex-col items-stretch flex-1">
                  <div
                    className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold border self-start ${badgeClass}`}
                  >
                    <span>
                      {labels.statusLabels[item.status] ?? item.status}
                    </span>
                  </div>
                </div>
                <span className="flex-1 text-xs text-[var(--colorText)] font-mono">
                  {item.registeredCount}/{item.maxPlayers}
                  {item.waitlistCount > 0 ? ` (+${item.waitlistCount})` : ''}
                </span>
                <span className="flex-1 text-xs text-[var(--colorTextSecondary,#a1a1aa)] truncate">
                  {item.createdBy?.displayName ?? '—'}
                </span>
                <div className="flex flex-row items-center justify-end flex-[2] gap-1.5 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(item)}
                    data-testid={`edit-${item.id}`}
                  >
                    {labels.edit}
                  </Button>
                  {canTransition && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onTransition(item)}
                      data-testid={`transition-${item.id}`}
                    >
                      {labels.transition}
                    </Button>
                  )}
                  {canMarkComplete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMarkComplete(item)}
                      data-testid={`mark-complete-${item.id}`}
                    >
                      {labels.markComplete}
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(item)}
                      data-testid={`delete-${item.id}`}
                    >
                      {labels.delete}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </InfiniteScroll>
  );
}
