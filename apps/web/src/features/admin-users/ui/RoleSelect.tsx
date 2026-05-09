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
        padding: '6px 10px',
        borderRadius: 6,
        border: '1px solid var(--borderColor, rgba(255,255,255,0.18))',
        background: 'transparent',
        color: 'inherit',
        fontSize: 13,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        minWidth: 140,
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
