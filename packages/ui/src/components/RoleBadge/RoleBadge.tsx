import React from 'react';
import { XStack } from 'tamagui';
import { Typography } from '../Typography/Typography';

export type UserRole =
  | 'free'
  | 'premium'
  | 'vip'
  | 'supporter'
  | 'moderator'
  | 'tester'
  | 'developer'
  | 'admin';

type RoleStyle = { bg: string; text: string; glow?: string };

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
    bg: 'var(--successBgSoft)',
    text: 'var(--success)',
  },
  tester: {
    bg: 'var(--infoBgSoft)',
    text: 'var(--info)',
  },
  developer: {
    bg: 'color-mix(in srgb, var(--roleDeveloperShade) 15%, transparent)',
    text: 'var(--roleDeveloper)',
  },
  admin: {
    bg: 'var(--dangerBgSoft)',
    text: 'var(--danger)',
    glow: '0 0 10px var(--dangerBorder)',
  },
};

export interface RoleBadgeProps {
  role: UserRole;
  children: React.ReactNode;
}

export function RoleBadge({ role, children }: RoleBadgeProps) {
  const { bg, text, glow } = roleStyles[role] ?? roleStyles.free;
  return (
    <XStack
      alignItems="center"
      paddingVertical={2}
      paddingHorizontal={7}
      borderRadius={5}
      style={{ display: 'inline-flex', background: bg, boxShadow: glow ?? 'none', whiteSpace: 'nowrap' }}
    >
      <Typography
        uiSize="xs"
        weight="700"
        tracking="md"
        style={{ textTransform: 'uppercase', color: text }}
      >
        {children}
      </Typography>
    </XStack>
  );
}
