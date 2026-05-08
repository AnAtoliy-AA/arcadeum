import { apiClient } from '@/shared/lib/api-client';
import type { UserRole } from '@/entities/session/model/types';

export interface AdminUserItem {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListAdminUsersArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  role?: UserRole | null;
}

export function buildAdminUsersUrl(args: ListAdminUsersArgs): string {
  const qs = new URLSearchParams();
  if (args.page) qs.set('page', String(args.page));
  if (args.pageSize) qs.set('pageSize', String(args.pageSize));
  if (args.q && args.q.trim()) qs.set('q', args.q);
  if (args.role) qs.set('role', args.role);
  const qsStr = qs.toString();
  return qsStr ? `/admin/users?${qsStr}` : '/admin/users';
}

export async function fetchAdminUsers(
  args: ListAdminUsersArgs,
  accessToken: string,
): Promise<AdminUsersResponse> {
  return apiClient.get<AdminUsersResponse>(buildAdminUsersUrl(args), {
    token: accessToken,
  });
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  accessToken: string,
): Promise<AdminUserItem> {
  return apiClient.patch<AdminUserItem>(
    `/admin/users/${encodeURIComponent(userId)}/role`,
    { role: newRole },
    { token: accessToken },
  );
}
