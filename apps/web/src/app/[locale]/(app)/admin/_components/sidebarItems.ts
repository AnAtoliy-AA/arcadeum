export interface AdminSidebarItem {
  id:
    | 'dashboard'
    | 'statistics'
    | 'monitoring'
    | 'users'
    | 'payments'
    | 'announcements'
    | 'tournaments'
    | 'economy'
    | 'gemPackages'
    | 'shop'
    | 'games'
    | 'gameRules'
    | 'bulkRewards'
    | 'blockedIps'
    | 'geoBlock';
  href: string | null;
  enabled: boolean;
}

export const ADMIN_SIDEBAR_ITEMS: readonly AdminSidebarItem[] = [
  { id: 'dashboard', href: '/admin', enabled: true },
  { id: 'statistics', href: '/admin/statistics', enabled: true },
  { id: 'monitoring', href: '/admin/monitoring', enabled: true },
  { id: 'users', href: '/admin/users', enabled: true },
  { id: 'payments', href: '/admin/payments', enabled: true },
  { id: 'tournaments', href: '/admin/tournaments', enabled: true },
  { id: 'economy', href: '/admin/economy', enabled: true },
  { id: 'gemPackages', href: '/admin/gem-packages', enabled: true },
  { id: 'shop', href: '/admin/shop', enabled: true },
  { id: 'bulkRewards', href: '/admin/bulk-rewards', enabled: true },
  { id: 'games', href: '/admin/games', enabled: true },
  { id: 'gameRules', href: '/admin/game-rules', enabled: true },
  { id: 'announcements', href: '/admin/announcements', enabled: true },
  { id: 'blockedIps', href: '/admin/blocked-ips', enabled: true },
  { id: 'geoBlock', href: '/admin/geo-block', enabled: true },
];
