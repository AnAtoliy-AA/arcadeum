import { requireAdmin } from '@/entities/session/api/requireAdmin';
import { getTranslations } from '@/shared/i18n/server';
import { MonitoringClient } from './MonitoringClient';

export const metadata = {
  title: 'Monitoring - Arcadeum Admin',
};

export default async function AdminMonitoringPage() {
  await requireAdmin();
  const messages = await getTranslations();

  return <MonitoringClient t={messages.pages?.admin?.monitoring} />;
}
