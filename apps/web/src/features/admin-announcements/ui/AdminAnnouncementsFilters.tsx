'use client';
import { useEffect, useState } from 'react';
import { XStack } from 'tamagui';
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

const SELECT_STYLE = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #555',
  background: 'transparent',
  color: 'inherit' as const,
};

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  return (
    <XStack gap="$3" alignItems="center" flexWrap="wrap">
      <input
        placeholder={labels.searchPlaceholder}
        value={localQ}
        onChange={(e) => setLocalQ(e.target.value)}
        style={{
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid #555',
          background: 'transparent',
          color: 'inherit',
          minWidth: 220,
        }}
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
        style={SELECT_STYLE}
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
        style={SELECT_STYLE}
      >
        <option value="">{labels.severityFilterAll}</option>
        {ANNOUNCEMENT_SEVERITIES.map((s) => (
          <option key={s} value={s}>
            {labels.severityLabels[s]}
          </option>
        ))}
      </select>
      <XStack flex={1} />
      <button
        type="button"
        onClick={onNewClick}
        data-testid="new-announcement"
        style={{
          padding: '6px 14px',
          borderRadius: 6,
          border: '1px solid #555',
          background: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        {labels.newButton}
      </button>
    </XStack>
  );
}
