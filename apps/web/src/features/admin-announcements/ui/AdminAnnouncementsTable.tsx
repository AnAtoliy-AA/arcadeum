'use client';

import { useRef, useEffect } from 'react';
import { Button, GlassCard, Spinner, Typography } from '@arcadeum/ui';
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
  pagination?: { prev: string; next: string; of: string };
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
  isLoading: boolean;
  hasFilter: boolean;
  onLoadMore?: () => void;
  onEdit: (item: AdminAnnouncementItem) => void;
  onDelete: (item: AdminAnnouncementItem) => void;
  labels: AdminAnnouncementsTableLabels;
}

const truncate = (s: string, n: number) =>
  s.length > n ? `${s.slice(0, n - 1)}…` : s;

function getSeverityBadgeStyle(severity: AnnouncementSeverity): string {
  switch (severity) {
    case 'critical':
      return 'bg-rose-950/50 border-rose-500/30 text-rose-400';
    case 'warning':
      return 'bg-amber-950/50 border-amber-500/30 text-amber-400';
    case 'info':
    default:
      return 'bg-indigo-950/50 border-indigo-500/30 text-indigo-400';
  }
}

export function AdminAnnouncementsTable({
  items,
  total,
  isLoading,
  hasFilter,
  onLoadMore,
  onEdit,
  onDelete,
  labels,
}: AdminAnnouncementsTableProps) {
  const { locale } = useLanguage();
  const observerTarget = useRef<HTMLDivElement>(null);
  const hasMore = items.length < total;

  useEffect(() => {
    const target = observerTarget.current;
    if (
      !target ||
      !hasMore ||
      isLoading ||
      !onLoadMore ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' },
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [hasMore, isLoading, onLoadMore]);

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
        data-testid="announcements-table-empty"
      >
        <Typography variant="body" uiSize="md" alpha="medium">
          {hasFilter ? labels.empty.noResults : labels.empty.noAnnouncements}
        </Typography>
      </GlassCard>
    );
  }

  return (
    <div
      className="flex flex-col items-stretch gap-4"
      data-testid="announcements-table"
    >
      <div className="flex flex-row items-center justify-between px-1">
        <Typography variant="heading" uiSize="sm" weight="700">
          Showing {items.length} of {total} announcements
        </Typography>
      </div>

      <GlassCard className="p-0 overflow-hidden border border-[var(--borderColor)]">
        <div
          className="flex flex-row items-center py-2.5 px-3 bg-[var(--backgroundFocus)] border-b border-[var(--borderColor)] gap-3"
          data-testid="announcements-table-header"
        >
          <span className="flex-[3] font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
            {labels.table.title}
          </span>
          <span className="flex-1 font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
            {labels.table.severity}
          </span>
          <span className="flex-1 font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
            {labels.table.audience}
          </span>
          <span className="flex-[2] font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
            {labels.table.window}
          </span>
          <span className="flex-1 font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)]">
            {labels.table.createdBy}
          </span>
          <span className="flex-1 font-bold text-xs uppercase tracking-wider text-[var(--colorTextSecondary,#a1a1aa)] text-right">
            {labels.table.actions}
          </span>
        </div>

        <div className="divide-y divide-[var(--borderColor)]">
          {items.map((item, i) => {
            const fullTitle = item.content.en.title;
            const badgeClass = getSeverityBadgeStyle(item.severity);

            return (
              <div
                className={`flex flex-row py-3 px-3 gap-3 items-center hover:bg-[rgba(255,255,255,0.03)] transition-colors ${
                  i % 2 === 1 ? 'bg-[var(--backgroundFocus)]' : ''
                }`}
                key={item.id}
                data-testid={`announcement-row-${item.id}`}
              >
                <div className="flex flex-col items-stretch flex-[3]">
                  <span
                    title={fullTitle}
                    className="text-sm font-semibold text-[var(--colorText)]"
                  >
                    {truncate(fullTitle, 60)}
                  </span>
                </div>
                <div className="flex flex-col items-stretch flex-1">
                  <div
                    className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold border self-start ${badgeClass}`}
                  >
                    <span>{labels.severityLabels[item.severity]}</span>
                  </div>
                </div>
                <span className="flex-1 text-xs text-[var(--colorTextSecondary,#d4d4d8)] capitalize">
                  {labels.audienceLabels[item.audience]}
                </span>
                <div className="flex flex-col items-stretch flex-[2] gap-1">
                  <span className="text-xs text-[var(--colorTextSecondary,#d4d4d8)] font-mono">
                    {formatWindow(
                      item.startsAt,
                      item.endsAt,
                      locale,
                      labels.windowLabels,
                    )}
                  </span>
                  {item.status === 'active' && (
                    <div className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 self-start">
                      <span>{labels.table.nowPill}</span>
                    </div>
                  )}
                </div>
                <span className="flex-1 text-xs text-[var(--colorTextSecondary,#a1a1aa)] truncate">
                  {item.createdBy?.displayName ?? '—'}
                </span>
                <div className="flex flex-row items-center justify-end flex-1 gap-1.5">
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
        </div>
      </GlassCard>

      {hasMore ? (
        <div
          ref={observerTarget}
          className="flex flex-col items-center justify-center p-4 gap-3"
          data-testid="announcements-infinite-scroll-trigger"
        >
          {isLoading && <Spinner size="sm" />}
          {onLoadMore && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              data-testid="announcements-load-more"
            >
              Load more
            </Button>
          )}
        </div>
      ) : (
        <div
          className="flex flex-row items-center justify-center py-4 text-center"
          data-testid="announcements-all-loaded"
        >
          <Typography variant="caption" alpha="low">
            All {total} announcements loaded
          </Typography>
        </div>
      )}
    </div>
  );
}
