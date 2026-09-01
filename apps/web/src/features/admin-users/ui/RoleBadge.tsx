import type { UserRole } from '@/entities/session/model/types';
import { ROLE_COLORS } from '../lib/roleColors';

const FALLBACK_COLOR = { fg: '#6e7683', bg: '#1c1d21' };

export function RoleBadge({ role, label }: { role: UserRole; label: string }) {
  const c = ROLE_COLORS[role] ?? FALLBACK_COLOR;
  return (
    <div
      className="px-2 py-1 rounded-lg self-start"
      style={{ backgroundColor: c.bg }}
      data-testid={`role-badge-${role}`}
    >
      <span className="text-[14px] font-bold" style={{ color: c.fg }}>
        {label}
      </span>
    </div>
  );
}
