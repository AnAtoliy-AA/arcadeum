'use client';
import type { UserRole } from '@/entities/session/model/types';
import { resolveThemeColor } from '@/shared/lib/theme-tokens';
import { ROLE_COLORS } from '../lib/roleColors';

const FALLBACK_COLOR = { fg: '$gray9', bg: '$gray3' };

export function RoleBadge({ role, label }: { role: UserRole; label: string }) {
  const c = ROLE_COLORS[role] ?? FALLBACK_COLOR;
  return (
    <div
      className="px-2 py-1 rounded-lg self-start"
      style={{ backgroundColor: resolveThemeColor(c.bg) }}
      data-testid={`role-badge-${role}`}
    >
      <span
        className="text-[14px] font-bold"
        style={{ color: resolveThemeColor(c.fg) }}
      >
        {label}
      </span>
    </div>
  );
}
