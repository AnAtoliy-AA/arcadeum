export interface AdminSidebarItem {
  id: 'dashboard' | 'users' | 'payments' | 'announcements' | 'tournaments';
  href: string | null;
  enabled: boolean;
}

export const ADMIN_SIDEBAR_ITEMS: readonly AdminSidebarItem[] = [
  { id: 'dashboard', href: '/admin', enabled: true },
  { id: 'users', href: '/admin/users', enabled: true },
  { id: 'payments', href: null, enabled: false },
  { id: 'announcements', href: null, enabled: false },
  { id: 'tournaments', href: null, enabled: false },
];
