'use client';
import { useEffect, useState } from 'react';
import { XStack } from 'tamagui';
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
          minWidth: 260,
        }}
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
        style={{
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid #555',
          background: 'transparent',
          color: 'inherit',
        }}
      >
        <option value="all">{labels.visibilityAll}</option>
        <option value="public">{labels.visibilityPublic}</option>
        <option value="private">{labels.visibilityPrivate}</option>
      </select>
    </XStack>
  );
}
