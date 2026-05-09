'use client';

import { useQuery } from '@/shared/hooks/useQuery';
import { useSessionStore } from '@/entities/session/store/sessionStore';
import {
  fetchAdminPaymentNotes,
  type AdminPaymentNotesResponse,
  type ListAdminPaymentNotesArgs,
} from './api';

export const ADMIN_PAYMENTS_REFRESH_KEY = 'admin-payments';

export function useAdminPaymentNotes(args: ListAdminPaymentNotesArgs) {
  const accessToken = useSessionStore((s) => s.snapshot.accessToken);
  return useQuery<AdminPaymentNotesResponse>({
    queryKey: [
      'admin-payments',
      args.page ?? 1,
      args.pageSize ?? 50,
      args.q ?? '',
      args.visibility ?? 'all',
    ],
    queryFn: () => fetchAdminPaymentNotes(args, accessToken!),
    refreshKey: ADMIN_PAYMENTS_REFRESH_KEY,
    enabled: !!accessToken,
  });
}
