'use client';

import styled, { keyframes } from 'styled-components';

const BADGE_CONFIG: Record<
  string,
  { emoji: string; gradient: string; glow: string }
> = {
  badge_social_butterfly: {
    emoji: '🦋',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    glow: '0 0 8px rgba(16, 185, 129, 0.4)',
  },
  badge_legend_recruiter: {
    emoji: '👑',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    glow: '0 0 8px rgba(245, 158, 11, 0.4)',
  },
};

const DEFAULT_BADGE = {
  emoji: '🏷️',
  gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  glow: '0 0 8px rgba(99, 102, 241, 0.4)',
};

const shimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
`;

const BadgePill = styled.span<{ $gradient: string; $glow: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-radius: 9999px;
  background: ${({ $gradient }) => $gradient};
  color: #fff;
  box-shadow: ${({ $glow }) => $glow};
  white-space: nowrap;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.15) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 3s ease-in-out infinite;
  }
`;

const BadgeEmoji = styled.span`
  font-size: 0.75rem;
  line-height: 1;
`;

const BADGE_LABELS: Record<string, string> = {
  badge_social_butterfly: 'Social Butterfly',
  badge_legend_recruiter: 'Legend Recruiter',
};

interface CosmeticBadgeProps {
  badgeId: string;
  className?: string;
}

export function CosmeticBadge({ badgeId, className }: CosmeticBadgeProps) {
  const config = BADGE_CONFIG[badgeId] ?? DEFAULT_BADGE;
  const label = BADGE_LABELS[badgeId] ?? badgeId;

  return (
    <BadgePill
      $gradient={config.gradient}
      $glow={config.glow}
      className={className}
      data-testid={`cosmetic-badge-${badgeId}`}
    >
      <BadgeEmoji>{config.emoji}</BadgeEmoji>
      {label}
    </BadgePill>
  );
}

export type { CosmeticBadgeProps };
