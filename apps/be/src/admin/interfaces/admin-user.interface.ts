import type { UserRole } from '../../auth/lib/roles';

export interface AdminUserItem {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  isBlocked: boolean;
  blockedAt: string | null;
  blockedReason: string | null;
  deletedAt: string | null;
}

export interface AdminUsersResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  pageSize: number;
}
