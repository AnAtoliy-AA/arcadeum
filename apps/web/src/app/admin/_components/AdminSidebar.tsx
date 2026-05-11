'use client';

import { GlassCard, Typography, XStack, YStack } from '@arcadeum/ui';
import { View } from 'tamagui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_SIDEBAR_ITEMS, type AdminSidebarItem } from './sidebarItems';

export interface AdminSidebarLabels {
  items: Partial<Record<AdminSidebarItem['id'], string>>;
  comingSoon: string;
}

export interface AdminSidebarProps {
  labels: AdminSidebarLabels;
}

function isActive(itemHref: string | null, pathname: string | null): boolean {
  if (!itemHref || !pathname) return false;
  if (itemHref === '/admin') return pathname === '/admin';
  return pathname === itemHref || pathname.startsWith(`${itemHref}/`);
}

export function AdminSidebar({ labels }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <YStack
      gap="$2"
      width="100%"
      data-testid="admin-sidebar"
    >
      {ADMIN_SIDEBAR_ITEMS.map((item) => {
        const active = isActive(item.href, pathname);
        const card = (
          <GlassCard
            p="$3"
            opacity={item.enabled ? 1 : 0.55}
            borderWidth={1}
            borderColor={active ? '$primary' : '$borderColor'}
            backgroundColor={active ? '$primaryBgSoft' : undefined}
            cursor={item.enabled ? 'pointer' : 'default'}
            hoverStyle={
              item.enabled && !active
                ? {
                    borderColor: '$borderColorHover',
                    backgroundColor: '$backgroundHover',
                  }
                : undefined
            }
            data-testid={`admin-nav-${item.id}`}
            data-active={active ? 'true' : undefined}
          >
            <XStack alignItems="center" gap="$2">
              {active && (
                <View
                  width={3}
                  height={16}
                  borderRadius={2}
                  backgroundColor="$primary"
                />
              )}
              <YStack flex={1}>
                <Typography
                  variant="label"
                  uiSize="md"
                  fontWeight={active ? '800' : '700'}
                >
                  {labels.items[item.id] ?? item.id}
                </Typography>
                {!item.enabled && (
                  <Typography variant="caption" alpha="low">
                    {labels.comingSoon}
                  </Typography>
                )}
              </YStack>
            </XStack>
          </GlassCard>
        );
        if (item.enabled && item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {card}
            </Link>
          );
        }
        return <div key={item.id}>{card}</div>;
      })}
    </YStack>
  );
}
