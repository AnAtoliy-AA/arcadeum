'use client';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { AdminNotesVisibility } from '../api';

export interface AdminPaymentsFiltersLabels {
  searchPlaceholder: string;
  visibilityLabel: string;
  visibilityAll: string;
  visibilityPublic: string;
  visibilityPrivate: string;
}

export interface AdminPaymentsFiltersProps {
  q: string;
  visibility: AdminNotesVisibility;
  onChange: (next: { q: string; visibility: AdminNotesVisibility }) => void;
  labels: AdminPaymentsFiltersLabels;
}

export function AdminPaymentsFilters({
  q,
  visibility,
  onChange,
  labels,
}: AdminPaymentsFiltersProps) {
  const [localQ, setLocalQ] = useState(q);
  const debouncedQ = useDebounce(localQ, 300);

  useEffect(() => {
    if (debouncedQ !== q) {
      onChange({ q: debouncedQ, visibility });
    }
  }, [debouncedQ, q, visibility, onChange]);

  return (
    <div className="flex flex-row gap-3 items-center flex-wrap">
      <input
        placeholder={labels.searchPlaceholder}
        value={localQ}
        onChange={(e) => setLocalQ(e.target.value)}
        className="px-3 py-1.5 rounded-lg border border-[var(--borderColor)] bg-[var(--backgroundFocus)] text-[var(--colorText)] min-w-[260px] text-sm focus:outline-none focus:border-[var(--primary)]"
      />
      <select
        data-testid="visibility-filter"
        value={visibility}
        onChange={(e) =>
          onChange({
            q: localQ,
            visibility: e.target.value as AdminNotesVisibility,
          })
        }
        className="px-3 py-1.5 rounded-lg border border-[var(--borderColor)] bg-[var(--backgroundFocus)] text-[var(--colorText)] text-sm cursor-pointer focus:outline-none focus:border-[var(--primary)]"
      >
        <option value="all">{labels.visibilityAll}</option>
        <option value="public">{labels.visibilityPublic}</option>
        <option value="private">{labels.visibilityPrivate}</option>
      </select>
    </div>
  );
}
