import { requireAdmin } from '@/entities/session/api/requireAdmin';
import AdminPaymentsClient from './AdminPaymentsClient';

// No metadata export — inherit noindex/nofollow from /admin/layout.tsx.

export default async function AdminPaymentsPage() {
  await requireAdmin();
  return <AdminPaymentsClient />;
}
