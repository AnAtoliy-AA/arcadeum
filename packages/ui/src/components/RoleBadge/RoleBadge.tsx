import React from 'react';

export type UserRole =
  | 'free'
  | 'premium'
  | 'vip'
  | 'supporter'
  | 'moderator'
  | 'tester'
  | 'developer'
  | 'admin';

type RoleStyle = { bg: string; text: string; glow?: string; outlinedText?: string };

const roleStyles: Record<UserRole, RoleStyle> = {
  free: {
    bg: 'var(--glassBg)',
    text: 'var(--neutral)',
  },
  premium: {
    bg: 'linear-gradient(135deg, color-mix(in srgb, var(--rolePremium) 20%, transparent), color-mix(in srgb, var(--rolePremiumShade) 20%, transparent))',
    text: 'var(--rolePremium)',
    glow: '0 0 8px color-mix(in srgb, var(--rolePremium) 35%, transparent)',
  },
  vip: {
    bg: 'linear-gradient(135deg, color-mix(in srgb, var(--roleVipFrom) 25%, transparent), color-mix(in srgb, var(--roleVipTo) 25%, transparent))',
    text: 'var(--roleVip)',
    glow: '0 0 12px color-mix(in srgb, var(--roleVipFrom) 45%, transparent)',
  },
  supporter: {
    bg: 'linear-gradient(135deg, color-mix(in srgb, var(--roleSupporterFrom) 20%, transparent), color-mix(in srgb, var(--roleSupporter) 20%, transparent))',
    text: 'var(--roleSupporter)',
    glow: '0 0 8px color-mix(in srgb, var(--roleSupporterFrom) 35%, transparent)',
  },
  moderator: {
    bg: 'linear-gradient(135deg, color-mix(in srgb, var(--success) 20%, transparent), color-mix(in srgb, var(--successBg) 20%, transparent))',
    text: 'var(--success)',
    glow: '0 0 8px color-mix(in srgb, var(--success) 30%, transparent)',
  },
  tester: {
    bg: 'linear-gradient(135deg, color-mix(in srgb, var(--info) 20%, transparent), color-mix(in srgb, var(--infoBg) 20%, transparent))',
    text: 'var(--info)',
    glow: '0 0 8px color-mix(in srgb, var(--info) 30%, transparent)',
  },
  developer: {
    bg: 'linear-gradient(135deg, color-mix(in srgb, var(--roleDeveloper) 20%, transparent), color-mix(in srgb, var(--roleDeveloperShade) 20%, transparent))',
    text: 'var(--roleDeveloper)',
    glow: '0 0 10px color-mix(in srgb, var(--roleDeveloper) 35%, transparent)',
  },
  admin: {
    bg: 'linear-gradient(135deg, var(--danger), color-mix(in srgb, var(--danger) 70%, black))',
    text: 'var(--white)',
    outlinedText: 'var(--danger)',
    glow: '0 0 12px color-mix(in srgb, var(--danger) 40%, transparent)',
  },
};

export interface RoleBadgeProps {
  role: UserRole;
  children: React.ReactNode;
  /**
   * - `filled` (default): role-tinted gradient background with glow.
   * - `outlined`: transparent background, role-color border + text.
   */
  variant?: 'filled' | 'outlined';
}

export function RoleBadge({ role, children, variant = 'filled' }: RoleBadgeProps) {
  const style = roleStyles[role] ?? roleStyles.free;
  const isOutlined = variant === 'outlined';
  const textColor = isOutlined ? (style.outlinedText ?? style.text) : style.text;
  return (
    <span
      className="inline-flex items-center rounded-[5px] whitespace-nowrap py-[2px] px-[7px]"
      style={{
        background: isOutlined ? 'transparent' : style.bg,
        boxShadow: isOutlined ? 'none' : (style.glow ?? 'none'),
        border: isOutlined
          ? `1px solid color-mix(in srgb, ${textColor} 60%, transparent)`
          : 'none',
        textTransform: 'uppercase',
        color: textColor,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1,
      }}
    >
      {children}
    </span>
  );
}
