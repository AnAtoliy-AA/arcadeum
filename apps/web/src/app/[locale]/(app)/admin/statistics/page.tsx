import { getTranslations } from '@/shared/i18n/server';
import { getAdminStatisticsData } from '@/features/admin-statistics/server/admin-statistics.server';
import {
  AdminStatisticsView,
  type AdminStatisticsTranslations,
} from '@/features/admin-statistics/ui/AdminStatisticsView';

interface AdminPageTranslations {
  statistics?: AdminStatisticsTranslations;
}

export default async function AdminStatisticsPage() {
  const [messages, data] = await Promise.all([
    getTranslations(),
    getAdminStatisticsData(),
  ]);

  const adminTranslations = messages.pages?.admin as
    AdminPageTranslations | undefined;

  return <AdminStatisticsView data={data} t={adminTranslations?.statistics} />;
}
