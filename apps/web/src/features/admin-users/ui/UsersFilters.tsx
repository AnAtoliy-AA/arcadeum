'use client';
import { useEffect, useState } from 'react';
import { XStack } from 'tamagui';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { USER_ROLES, type UserRole } from '@/entities/session/model/types';
import type { AdminUserStatus } from '../api';

export const ADMIN_USER_STATUSES: AdminUserStatus[] = [
  'active',
  'blocked',
  'deleted',
];

export interface UsersFiltersLabels {
  searchPlaceholder: string;
  roleFilterPlaceholder: string;
  roleFilterAll: string;
  statusFilterAll: string;
  statusLabels: Record<AdminUserStatus, string>;
  roleLabels: Record<UserRole, string>;
}

export interface UsersFiltersProps {
  q: string;
  role: UserRole | null;
  status: AdminUserStatus | null;
  onChange: (next: {
    q: string;
    role: UserRole | null;
    status: AdminUserStatus | null;
  }) => void;
  labels: UsersFiltersLabels;
}

export function UsersFilters({
  q,
  role,
  status,
  onChange,
  labels,
}: UsersFiltersProps) {
  const [localQ, setLocalQ] = useState(q);
  const debouncedQ = useDebounce(localQ, 300);

  useEffect(() => {
    if (debouncedQ !== q) {
      onChange({ q: debouncedQ, role, status });
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
        data-testid="role-filter"
        value={role ?? ''}
        onChange={(e) =>
          onChange({
            q: localQ,
            role: e.target.value === '' ? null : (e.target.value as UserRole),
            status,
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
        <option value="">{labels.roleFilterAll}</option>
        {USER_ROLES.map((r) => (
          <option key={r} value={r}>
            {labels.roleLabels[r] ?? r}
          </option>
        ))}
      </select>
      <select
        data-testid="status-filter"
        value={status ?? ''}
        onChange={(e) =>
          onChange({
            q: localQ,
            role,
            status:
              e.target.value === ''
                ? null
                : (e.target.value as AdminUserStatus),
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
        <option value="">{labels.statusFilterAll}</option>
        {ADMIN_USER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {labels.statusLabels[s] ?? s}
          </option>
        ))}
      </select>
    </XStack>
  );
}
