export interface AdminSidebarItem {
  id:
    | 'dashboard'
    | 'users'
    | 'payments'
    | 'announcements'
    | 'tournaments'
    | 'economy'
    | 'shop'
    | 'games';
  href: string | null;
  enabled: boolean;
}

export const ADMIN_SIDEBAR_ITEMS: readonly AdminSidebarItem[] = [
  { id: 'dashboard', href: '/admin', enabled: true },
  { id: 'users', href: '/admin/users', enabled: true },
  { id: 'payments', href: '/admin/payments', enabled: true },
  { id: 'announcements', href: '/admin/announcements', enabled: true },
  { id: 'tournaments', href: '/admin/tournaments', enabled: true },
  { id: 'economy', href: '/admin/economy', enabled: true },
  { id: 'shop', href: '/admin/shop', enabled: true },
  { id: 'games', href: '/admin/games', enabled: true },
];
