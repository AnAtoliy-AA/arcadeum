'use client';

import { useQuery } from '@/shared/hooks/useQuery';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import type { UserRole } from '@/entities/session/model/types';
import {
  fetchAdminUsers,
  updateUserRole,
  type AdminUserItem,
  type AdminUsersResponse,
  type ListAdminUsersArgs,
} from './api';

export const ADMIN_USERS_REFRESH_KEY = 'admin-users';

export function useAdminUsers(args: ListAdminUsersArgs) {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  return useQuery<AdminUsersResponse>({
    queryKey: [
      'admin-users',
      args.page ?? 1,
      args.pageSize ?? 50,
      args.q ?? '',
      args.role ?? '',
    ],
    queryFn: () => fetchAdminUsers(args, accessToken!),
    refreshKey: ADMIN_USERS_REFRESH_KEY,
    enabled: !!accessToken,
  });
}

export function useUpdateUserRole() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<AdminUserItem, { userId: string; role: UserRole }>({
    mutationFn: ({ userId, role }) =>
      updateUserRole(userId, role, accessToken!),
    onSettled: () => triggerRefresh(ADMIN_USERS_REFRESH_KEY),
  });
}
