import { apiClient } from '@/shared/lib/api-client';

export type AdminNotesVisibility = 'public' | 'private' | 'all';

export interface AdminPaymentNoteItem {
  id: string;
  note: string;
  amount: number;
  currency: string;
  displayName: string | null;
  createdAt: string;
  transactionId: string;
  isPublic: boolean;
  userId: string | null;
}

export interface AdminPaymentNotesResponse {
  items: AdminPaymentNoteItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListAdminPaymentNotesArgs {
  page?: number;
  pageSize?: number;
  q?: string;
  visibility?: AdminNotesVisibility;
}

export function buildAdminPaymentsUrl(args: ListAdminPaymentNotesArgs): string {
  const qs = new URLSearchParams();
  if (args.page) qs.set('page', String(args.page));
  if (args.pageSize) qs.set('pageSize', String(args.pageSize));
  if (args.q && args.q.trim()) qs.set('q', args.q);
  if (args.visibility && args.visibility !== 'all') {
    qs.set('visibility', args.visibility);
  }
  const qsStr = qs.toString();
  return qsStr ? `/admin/payments/notes?${qsStr}` : '/admin/payments/notes';
}

export async function fetchAdminPaymentNotes(
  args: ListAdminPaymentNotesArgs,
  accessToken: string,
): Promise<AdminPaymentNotesResponse> {
  return apiClient.get<AdminPaymentNotesResponse>(buildAdminPaymentsUrl(args), {
    token: accessToken,
  });
}
