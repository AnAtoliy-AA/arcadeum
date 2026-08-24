'use client';
import { useEffect, useState } from 'react';
import { Button } from '@arcadeum/ui';
import { useDebounce } from '@/shared/hooks/useDebounce';
import {
  ANNOUNCEMENT_SEVERITIES,
  type AdminAnnouncementsStatusFilter,
  type AnnouncementSeverity,
} from '../api';

const STATUS_OPTIONS: AdminAnnouncementsStatusFilter[] = [
  'all',
  'active',
  'scheduled',
  'expired',
];

export interface AdminAnnouncementsFiltersLabels {
  searchPlaceholder: string;
  statusLabels: Record<AdminAnnouncementsStatusFilter, string>;
  severityFilterAll: string;
  severityLabels: Record<AnnouncementSeverity, string>;
  newButton: string;
}

export interface AdminAnnouncementsFiltersProps {
  q: string;
  status: AdminAnnouncementsStatusFilter;
  severity: AnnouncementSeverity | null;
  onChange: (next: {
    q: string;
    status: AdminAnnouncementsStatusFilter;
    severity: AnnouncementSeverity | null;
  }) => void;
  onNewClick: () => void;
  labels: AdminAnnouncementsFiltersLabels;
}

export function AdminAnnouncementsFilters({
  q,
  status,
  severity,
  onChange,
  onNewClick,
  labels,
}: AdminAnnouncementsFiltersProps) {
  const [localQ, setLocalQ] = useState(q);
  const debouncedQ = useDebounce(localQ, 300);

  useEffect(() => {
    if (debouncedQ !== q) {
      onChange({ q: debouncedQ, status, severity });
    }
  }, [debouncedQ, q, status, severity, onChange]);

  return (
    <div className="flex flex-row gap-3 items-center flex-wrap">
      <input
        placeholder={labels.searchPlaceholder}
        value={localQ}
        onChange={(e) => setLocalQ(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-[var(--borderColor)] bg-[var(--backgroundFocus)] text-[var(--colorText)] min-w-[220px] text-sm focus:outline-none focus:border-[var(--primary)]"
      />
      <select
        data-testid="status-filter"
        value={status}
        onChange={(e) =>
          onChange({
            q: localQ,
            status: e.target.value as AdminAnnouncementsStatusFilter,
            severity,
          })
        }
        className="px-3 py-1.5 rounded-lg border border-[var(--borderColor)] bg-[var(--backgroundFocus)] text-[var(--colorText)] text-sm cursor-pointer focus:outline-none focus:border-[var(--primary)]"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {labels.statusLabels[s]}
          </option>
        ))}
      </select>
      <select
        data-testid="severity-filter"
        value={severity ?? ''}
        onChange={(e) =>
          onChange({
            q: localQ,
            status,
            severity:
              e.target.value === ''
                ? null
                : (e.target.value as AnnouncementSeverity),
          })
        }
        className="px-3 py-1.5 rounded-lg border border-[var(--borderColor)] bg-[var(--backgroundFocus)] text-[var(--colorText)] text-sm cursor-pointer focus:outline-none focus:border-[var(--primary)]"
      >
        <option value="">{labels.severityFilterAll}</option>
        {ANNOUNCEMENT_SEVERITIES.map((s) => (
          <option key={s} value={s}>
            {labels.severityLabels[s]}
          </option>
        ))}
      </select>
      <div className="flex flex-row items-stretch flex-1" />
      <Button
        variant="outline"
        size="sm"
        onClick={onNewClick}
        data-testid="new-announcement"
      >
        {labels.newButton}
      </Button>
    </div>
  );
}
