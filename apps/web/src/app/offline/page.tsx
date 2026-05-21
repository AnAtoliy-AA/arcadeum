import type { Metadata } from 'next';

import { getTranslations } from '@/shared/i18n/server';
import { routes } from '@/shared/config/routes';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import BrowserRegistry from '../BrowserRegistry';
import { OfflineView } from './OfflineView';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return buildMetadata({
    title: 'Offline',
    description: 'You are currently offline.',
    path: routes.offline,
    index: false,
    locale,
  });
}

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
