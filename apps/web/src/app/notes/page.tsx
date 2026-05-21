import { paymentApi } from '@/features/payment/api';
import { SSR_TIMEOUT, appConfig } from '@/shared/config/app-config';
import type { Metadata } from 'next';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { getSeoMessages } from '@/shared/seo/messages';
import { getRequestLocale } from '@/shared/i18n/locale-url';
import { breadcrumbList, webPage } from '@/shared/seo/jsonLd';
import NotesClient from './NotesClient';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const seo = getSeoMessages(locale, 'notes');
  return buildMetadata({
    ...seo,
    path: routes.notes,
    ogType: 'article',
    keywords: ['patch notes', 'release notes', 'changelog', 'updates'],
    locale,
  });
}

const NOTES_JSON_LD = [
  webPage({
    name: `Patch Notes — ${appConfig.appName}`,
    description: 'Latest releases and platform changes.',
    path: routes.notes,
  }),
  breadcrumbList([
    { name: 'Home', path: routes.home },
    { name: 'Patch Notes', path: routes.notes },
  ]),
];

export const dynamic = 'force-dynamic';

async function NotesDataFetcher() {
  let initialData = null;
  try {
    initialData = await paymentApi.getNotes(0, 12, {
      timeout: SSR_TIMEOUT,
    });
  } catch (error) {
    console.error('Failed to pre-fetch notes during SSR:', error);
  }

  return (
    <NotesClient initialData={initialData ? { pages: [initialData] } : null} />
  );
}

export default function Page() {
  return (
    <>
      <JsonLd data={NOTES_JSON_LD} />
      <NotesDataFetcher />
    </>
  );
}
