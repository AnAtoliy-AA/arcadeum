'use client';
import { Button, GlassCard } from '@arcadeum/ui';
import { Spinner } from '@/shared/ui/CSSSpinner';
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
      <div className="box-border flex flex-col items-center p-5">
        <Spinner />
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <GlassCard
        className={'p-5 items-center'}
        data-testid="tournaments-table-empty"
      >
        <span className="box-border opacity-[0.7]">
          {hasFilter ? labels.empty.noResults : labels.empty.noTournaments}
        </span>
      </GlassCard>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div
      className="box-border flex flex-col items-stretch gap-3"
      data-testid="tournaments-table"
    >
      <span className="box-border opacity-[0.7] text-[12px] px-1">
        {labels.totalLabel
          .replace('{start}', String(start))
          .replace('{end}', String(end))
          .replace('{total}', String(total))}
      </span>

      <GlassCard className={'p-0 overflow-hidden'}>
        <div className="box-border flex flex-row items-stretch py-2 px-3 bg-[var(--backgroundFocus)] border-b border-[var(--borderColor)] gap-3">
          <span className="box-border flex-[3] font-bold text-[12px] opacity-[0.85]">
            {labels.table.name}
          </span>
          <span className="box-border flex-1 font-bold text-[12px] opacity-[0.85]">
            {labels.table.gameType}
          </span>
          <span className="box-border flex-[2] font-bold text-[12px] opacity-[0.85]">
            {labels.table.scheduled}
          </span>
          <span className="box-border flex-1 font-bold text-[12px] opacity-[0.85]">
            {labels.table.status}
          </span>
          <span className="box-border flex-1 font-bold text-[12px] opacity-[0.85]">
            {labels.table.registered}
          </span>
          <span className="box-border flex-1 font-bold text-[12px] opacity-[0.85]">
            {labels.table.createdBy}
          </span>
          <span className="box-border flex-[2] font-bold text-[12px] opacity-[0.85]">
            {labels.table.actions}
          </span>
        </div>

        {items.map((item, i) => {
          const fullName = item.content.en.name;
          const chipColor = getStatusChipColor(item.status);
          const canTransition = nextStatuses(item.status).length > 0;
          const canDelete =
            item.status === 'scheduled' || item.status === 'cancelled';
          const canMarkComplete = item.status === 'live';
          return (
            <div
              className="box-border flex flex-row py-2 px-3 gap-3 items-center hover:bg-[var(--backgroundHover)] border-b border-[var(--borderColor)]"
              style={{
                backgroundColor: i % 2 === 1 ? '$backgroundFocus' : undefined,
              }}
              key={item.id}
              data-testid={`tournament-row-${item.id}`}
            >
              <div className="box-border flex flex-col items-stretch flex-[3]">
                <span title={fullName}>
                  <span className="box-border">{truncate(fullName, 60)}</span>
                </span>
              </div>
              <span className="box-border flex-1 text-[12px]">
                {labels.gameTypeLabels[item.gameType]}
              </span>
              <span className="box-border flex-[2] text-[12px]">
                {formatSchedule(item.scheduledAt, locale)}
              </span>
              <div className="box-border flex flex-col items-stretch flex-1">
                <div
                  className="box-border flex flex-row items-stretch px-2 py-1 rounded-lg self-start"
                  style={{ backgroundColor: chipColor.bg }}
                >
                  <span
                    className="box-border text-[12px]"
                    style={{ color: chipColor.fg }}
                  >
                    {labels.statusLabels[item.status]}
                  </span>
                </div>
              </div>
              <span className="box-border flex-1 text-[12px]">
                {item.registeredCount}/{item.maxPlayers}
                {item.waitlistCount > 0 ? ` (+${item.waitlistCount})` : ''}
              </span>
              <span className="box-border flex-1 text-[12px] opacity-[0.8]">
                {item.createdBy?.displayName ?? '—'}
              </span>
              <div className="box-border flex flex-row items-stretch flex-[2] gap-2 flex-wrap">
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
      </GlassCard>

      <div className="box-border flex flex-row gap-3 items-center justify-center pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          {labels.pagination.prev}
        </Button>
        <span className="box-border opacity-[0.8] text-[14px]">
          {labels.pagination.of
            .replace('{current}', String(page))
            .replace('{total}', String(totalPages))}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          {labels.pagination.next}
        </Button>
      </div>
    </div>
  );
}
