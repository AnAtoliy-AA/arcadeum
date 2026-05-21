import { paymentApi } from '@/features/payment/api';
import { SSR_TIMEOUT, appConfig } from '@/shared/config/app-config';
import type { Metadata } from 'next';
import { routes } from '@/shared/config/routes';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildMetadata } from '@/shared/seo/buildMetadata';
import { breadcrumbList, webPage } from '@/shared/seo/jsonLd';
import NotesClient from './NotesClient';

export const metadata: Metadata = buildMetadata({
  title: 'Patch Notes',
  description: `Release notes and platform changes for ${appConfig.appName} — new games, balance updates, fixes, and improvements.`,
  path: routes.notes,
  ogType: 'article',
  keywords: ['patch notes', 'release notes', 'changelog', 'updates'],
});

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
