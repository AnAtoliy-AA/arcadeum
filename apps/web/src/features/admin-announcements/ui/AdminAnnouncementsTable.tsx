'use client';
import { Button, GlassCard } from '@arcadeum/ui';
import { Spinner } from '@/shared/ui/CSSSpinner';
import { useLanguage } from '@/shared/i18n/context';
import {
  type AdminAnnouncementItem,
  type AnnouncementAudience,
  type AnnouncementSeverity,
  type AnnouncementStatus,
} from '../api';
import { formatWindow } from '../lib/formatWindow';
import { resolveThemeColor } from '@/shared/lib/theme-tokens';

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
      <div className="flex flex-col items-center p-5">
        <Spinner />
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <GlassCard
        className={'p-5 items-center'}
        data-testid="announcements-table-empty"
      >
        <span className="opacity-[0.7]">
          {hasFilter ? labels.empty.noResults : labels.empty.noAnnouncements}
        </span>
      </GlassCard>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div
      className="flex flex-col items-stretch gap-3"
      data-testid="announcements-table"
    >
      <span className="opacity-[0.7] text-[12px] px-1">
        {labels.totalLabel
          .replace('{start}', String(start))
          .replace('{end}', String(end))
          .replace('{total}', String(total))}
      </span>

      <GlassCard className={'p-0 overflow-hidden'}>
        <div
          className="flex flex-row items-stretch py-2 px-3 bg-[var(--backgroundFocus)] border-b border-[var(--borderColor)] gap-3"
          data-testid="announcements-table-header"
        >
          <span className="flex-[3] font-bold text-[12px] opacity-[0.85]">
            {labels.table.title}
          </span>
          <span className="flex-1 font-bold text-[12px] opacity-[0.85]">
            {labels.table.severity}
          </span>
          <span className="flex-1 font-bold text-[12px] opacity-[0.85]">
            {labels.table.audience}
          </span>
          <span className="flex-[2] font-bold text-[12px] opacity-[0.85]">
            {labels.table.window}
          </span>
          <span className="flex-1 font-bold text-[12px] opacity-[0.85]">
            {labels.table.createdBy}
          </span>
          <span className="flex-1 font-bold text-[12px] opacity-[0.85]">
            {labels.table.actions}
          </span>
        </div>

        {items.map((item, i) => {
          const fullTitle = item.content.en.title;
          return (
            <div
              className="flex flex-row py-2 px-3 gap-3 items-center hover:bg-[var(--backgroundHover)] border-b border-[var(--borderColor)]"
              style={{
                backgroundColor: resolveThemeColor(
                  i % 2 === 1 ? '$backgroundFocus' : undefined,
                ),
              }}
              key={item.id}
              data-testid={`announcement-row-${item.id}`}
            >
              <div className="flex flex-col items-stretch flex-[3]">
                <span title={fullTitle}>
                  <span className="">{truncate(fullTitle, 60)}</span>
                </span>
              </div>
              <div className="flex flex-col items-stretch flex-1">
                <div
                  className="flex flex-row items-stretch px-2 py-1 rounded-lg self-start"
                  style={{
                    backgroundColor: resolveThemeColor(
                      SEVERITY_COLOR[item.severity],
                    ),
                  }}
                >
                  <span className="text-[12px]">
                    {labels.severityLabels[item.severity]}
                  </span>
                </div>
              </div>
              <span className="flex-1">
                {labels.audienceLabels[item.audience]}
              </span>
              <div className="flex flex-col items-stretch flex-[2] gap-1">
                <span className="text-[12px]">
                  {formatWindow(
                    item.startsAt,
                    item.endsAt,
                    locale,
                    labels.windowLabels,
                  )}
                </span>
                {item.status === 'active' && (
                  <div className="flex flex-row items-stretch px-2 py-2 rounded-lg bg-[rgba(4,_120,_87,_0.1)] self-start">
                    <span className="text-[12px] font-semibold">
                      {labels.table.nowPill}
                    </span>
                  </div>
                )}
              </div>
              <span className="flex-1 text-[12px] opacity-[0.8]">
                {item.createdBy?.displayName ?? '—'}
              </span>
              <div className="flex flex-row items-stretch flex-1 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(item)}
                  data-testid={`edit-${item.id}`}
                >
                  {labels.edit}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(item)}
                  data-testid={`delete-${item.id}`}
                >
                  {labels.delete}
                </Button>
              </div>
            </div>
          );
        })}
      </GlassCard>

      <div className="flex flex-row gap-3 items-center justify-center pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          {labels.pagination.prev}
        </Button>
        <span className="opacity-[0.8] text-[14px]">
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
