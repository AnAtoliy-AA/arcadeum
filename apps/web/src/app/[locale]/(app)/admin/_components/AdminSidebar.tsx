'use client';

import { GlassCard, Typography } from '@arcadeum/ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_SIDEBAR_ITEMS, type AdminSidebarItem } from './sidebarItems';
import { resolveThemeColor } from '@/shared/lib/theme-tokens';

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
    <div
      className="flex flex-col items-stretch gap-2 w-full"
      data-testid="admin-sidebar"
    >
      {ADMIN_SIDEBAR_ITEMS.map((item) => {
        const active = isActive(item.href, pathname);
        const card = (
          <GlassCard
            className={'p-3 border'}
            style={{
              opacity: item.enabled ? 1 : 0.55,
              borderColor: resolveThemeColor(
                active ? '$primary' : '$borderColor',
              ),
              backgroundColor: resolveThemeColor(
                active ? '$primaryBgSoft' : undefined,
              ),
              cursor: item.enabled ? 'pointer' : 'default',
            }}
            data-testid={`admin-nav-${item.id}`}
            data-active={active ? 'true' : undefined}
          >
            <div className="flex flex-row items-center gap-2">
              {active && (
                <div className="w-[3px] h-[16px] rounded-lg bg-[var(--primary)]" />
              )}
              <div className="flex flex-col items-stretch flex-1">
                <Typography
                  variant="label"
                  uiSize="md"
                  weight={active ? '800' : '700'}
                >
                  {labels.items[item.id] ?? item.id}
                </Typography>
                {!item.enabled && (
                  <Typography variant="caption" alpha="low">
                    {labels.comingSoon}
                  </Typography>
                )}
              </div>
            </div>
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
    </div>
  );
}
