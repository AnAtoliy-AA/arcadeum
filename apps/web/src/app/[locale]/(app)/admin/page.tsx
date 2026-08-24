import { getTranslations } from '@/shared/i18n/server';
import { getAdminDashboardData } from '@/features/admin-dashboard/server/admin-dashboard.server';
import {
  AdminDashboardView,
  type AdminDashboardTranslations,
} from '@/features/admin-dashboard/ui/AdminDashboardView';

interface AdminPageTranslations {
  dashboard?: AdminDashboardTranslations;
}

export default async function AdminPage() {
  const [messages, data] = await Promise.all([
    getTranslations(),
    getAdminDashboardData(),
  ]);

  const adminTranslations = messages.pages?.admin as
    AdminPageTranslations | undefined;

  return <AdminDashboardView data={data} t={adminTranslations?.dashboard} />;
}
