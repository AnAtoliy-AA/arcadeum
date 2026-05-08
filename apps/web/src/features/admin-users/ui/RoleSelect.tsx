'use client';
import { USER_ROLES, type UserRole } from '@/entities/session/model/types';

export interface RoleSelectProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  labels: Record<UserRole, string>;
  disabled?: boolean;
  testId?: string;
}

export function RoleSelect({
  value,
  onChange,
  labels,
  disabled,
  testId,
}: RoleSelectProps) {
  return (
    <select
      value={value}
      disabled={disabled}
      data-testid={testId}
      onChange={(e) => onChange(e.target.value as UserRole)}
      style={{
        padding: '4px 8px',
        borderRadius: 4,
        border: '1px solid #555',
        background: 'transparent',
        color: 'inherit',
      }}
    >
      {USER_ROLES.map((r) => (
        <option key={r} value={r}>
          {labels[r] ?? r}
        </option>
      ))}
    </select>
  );
}
