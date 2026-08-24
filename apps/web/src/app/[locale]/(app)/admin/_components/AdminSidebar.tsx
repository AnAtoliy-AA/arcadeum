'use client';

import type { ReactElement } from 'react';
import {
  GlassCard,
  Typography,
  BarChartIcon,
  UserIcon,
  WalletIcon,
  GiftIcon,
  LockIcon,
  GlobeIcon,
  SettingsIcon,
  FileTextIcon,
  MailIcon,
  PlusCircleIcon,
} from '@arcadeum/ui';
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

function getItemIcon(id: AdminSidebarItem['id']): ReactElement {
  switch (id) {
    case 'dashboard':
      return <BarChartIcon size={18} />;
    case 'statistics':
      return <BarChartIcon size={18} />;
    case 'users':
      return <UserIcon size={18} />;
    case 'payments':
      return <WalletIcon size={18} />;
    case 'tournaments':
      return <GiftIcon size={18} />;
    case 'economy':
      return <WalletIcon size={18} />;
    case 'gemPackages':
      return <PlusCircleIcon size={18} />;
    case 'shop':
      return <GiftIcon size={18} />;
    case 'bulkRewards':
      return <GiftIcon size={18} />;
    case 'games':
      return <SettingsIcon size={18} />;
    case 'gameRules':
      return <FileTextIcon size={18} />;
    case 'announcements':
      return <MailIcon size={18} />;
    case 'blockedIps':
      return <LockIcon size={18} />;
    case 'geoBlock':
      return <GlobeIcon size={18} />;
    default:
      return <SettingsIcon size={18} />;
  }
}

export function AdminSidebar({ labels }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-col items-stretch gap-1.5 w-full print:hidden"
      aria-label="Admin Navigation"
      data-testid="admin-sidebar"
    >
      {ADMIN_SIDEBAR_ITEMS.map((item) => {
        const active = isActive(item.href, pathname);
        const icon = getItemIcon(item.id);

        const card = (
          <GlassCard
            className={`p-2.5 rounded-xl border transition-all duration-200 ${
              active
                ? 'border-[var(--primary)] bg-[rgba(87,195,255,0.12)] shadow-[0_0_15px_rgba(87,195,255,0.15)]'
                : 'border-[var(--borderColor)] hover:border-[var(--colorBorderHover,#ffffff33)] hover:bg-[rgba(255,255,255,0.05)]'
            } ${item.enabled ? 'opacity-100 cursor-pointer' : 'opacity-50 cursor-default'}`}
            data-testid={`admin-nav-${item.id}`}
            data-active={active ? 'true' : undefined}
          >
            <div className="flex flex-row items-center gap-2.5">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                  active
                    ? 'bg-[var(--primary)] text-black'
                    : 'bg-[rgba(255,255,255,0.06)] text-[var(--colorTextSecondary,#a1a1aa)]'
                }`}
              >
                {icon}
              </div>

              <div className="flex flex-col items-stretch flex-1 min-w-0">
                <Typography
                  variant="label"
                  uiSize="md"
                  weight={active ? '800' : '700'}
                  className={`truncate ${
                    active
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--colorText,#ffffff)]'
                  }`}
                >
                  {labels.items[item.id] ?? item.id}
                </Typography>
                {!item.enabled && (
                  <Typography
                    variant="caption"
                    alpha="low"
                    className="text-[10px]"
                  >
                    {labels.comingSoon}
                  </Typography>
                )}
              </div>

              {active && (
                <div className="w-1.5 h-4 rounded-full bg-[var(--primary)] shadow-[0_0_8px_var(--primary)]" />
              )}
            </div>
          </GlassCard>
        );

        if (item.enabled && item.href) {
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className="no-underline text-inherit block focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded-xl"
            >
              {card}
            </Link>
          );
        }

        return <div key={item.id}>{card}</div>;
      })}
    </nav>
  );
}
