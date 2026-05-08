export interface AdminSidebarItem {
  id: 'dashboard' | 'roles' | 'payments' | 'announcements' | 'tournaments';
  href: string | null;
  enabled: boolean;
}

export const ADMIN_SIDEBAR_ITEMS: readonly AdminSidebarItem[] = [
  { id: 'dashboard', href: '/admin', enabled: true },
  { id: 'roles', href: null, enabled: false },
  { id: 'payments', href: null, enabled: false },
  { id: 'announcements', href: null, enabled: false },
  { id: 'tournaments', href: null, enabled: false },
];
