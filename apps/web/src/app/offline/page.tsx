import { getTranslations } from '@/shared/i18n/server';
import BrowserRegistry from '../BrowserRegistry';
import { OfflineView } from './OfflineView';

export default async function OfflinePage() {
  const messages = await getTranslations();
  const t = messages.pwa?.offline;

  return (
    <BrowserRegistry>
      <OfflineView
        title={t?.title || 'Offline'}
        description={
          t?.description ||
          'You are currently offline. Please check your internet connection.'
        }
        retryText={t?.retry || 'Retry'}
      />
    </BrowserRegistry>
  );
}
