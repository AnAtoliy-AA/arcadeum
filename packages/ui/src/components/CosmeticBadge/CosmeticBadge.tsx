import { memo } from 'react';

export type CosmeticBadgeProps = {
  badgeId: string;
};

const BADGE_CONFIG: Record<
  string,
  { emoji: string; background: string; glow: string }
> = {
  badge_social_butterfly: {
    emoji: '🦋',
    background: 'linear-gradient(135deg, #10b981, #047857)',
    glow: 'rgba(4, 120, 87, 0.4)',
  },
  badge_legend_recruiter: {
    emoji: '👑',
    background: 'linear-gradient(135deg, #f59e0b, #92400e)',
    glow: 'rgba(146, 64, 14, 0.4)',
  },
};

const DEFAULT_BADGE = {
  emoji: '🏷️',
  background: 'linear-gradient(135deg, #2563eb, #1e40af)',
  glow: 'rgba(37, 99, 235, 0.4)',
};

const BADGE_LABELS: Record<string, string> = {
  badge_social_butterfly: 'Social Butterfly',
  badge_legend_recruiter: 'Legend Recruiter',
};

export const CosmeticBadge = memo(function CosmeticBadge({ badgeId }: CosmeticBadgeProps) {
  const config = BADGE_CONFIG[badgeId] ?? DEFAULT_BADGE;
  const label = BADGE_LABELS[badgeId] ?? badgeId;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-[6px] px-2 py-1"
      style={{
        background: config.background,
        boxShadow: `0 0 8px ${config.glow}`,
      }}
      data-testid={`cosmetic-badge-${badgeId}`}
    >
      <span style={{ fontSize: 12 }}>{config.emoji}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{label}</span>
    </span>
  );
});
