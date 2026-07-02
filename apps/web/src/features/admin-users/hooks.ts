'use client';

import { useQuery } from '@/shared/hooks/useQuery';
import { useMutation } from '@/shared/hooks/useMutation';
import { useRefreshStore } from '@/shared/model/useRefreshStore';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import type { UserRole } from '@/entities/session/model/types';
import {
  fetchAdminUsers,
  updateUserRole,
  blockUser,
  unblockUser,
  deleteUser,
  restoreUser,
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
      args.status ?? '',
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

export function useBlockUser() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<AdminUserItem, { userId: string; reason?: string }>({
    mutationFn: ({ userId, reason }) => blockUser(userId, reason, accessToken!),
    onSettled: () => triggerRefresh(ADMIN_USERS_REFRESH_KEY),
  });
}

export function useUnblockUser() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<AdminUserItem, { userId: string }>({
    mutationFn: ({ userId }) => unblockUser(userId, accessToken!),
    onSettled: () => triggerRefresh(ADMIN_USERS_REFRESH_KEY),
  });
}

export function useDeleteUser() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<AdminUserItem, { userId: string }>({
    mutationFn: ({ userId }) => deleteUser(userId, accessToken!),
    onSettled: () => triggerRefresh(ADMIN_USERS_REFRESH_KEY),
  });
}

export function useRestoreUser() {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  const triggerRefresh = useRefreshStore((s) => s.triggerRefresh);
  return useMutation<AdminUserItem, { userId: string }>({
    mutationFn: ({ userId }) => restoreUser(userId, accessToken!),
    onSettled: () => triggerRefresh(ADMIN_USERS_REFRESH_KEY),
  });
}
