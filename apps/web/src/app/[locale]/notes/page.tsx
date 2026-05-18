import { paymentApi } from '@/features/payment/api';
import { buildPageMetadata } from '@/shared/seo/buildPageMetadata';
import { isLocale } from '@/shared/i18n';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import type { Metadata } from 'next';
import NotesClient from './NotesClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? buildPageMetadata({ locale, page: 'notes' })
    : {};
}

export const dynamic = 'force-dynamic';

// We separate the data fetching to keep the page logic client-side while still leveraging SSR for initial data
async function NotesDataFetcher() {
  // Initial fetch on server
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
  return <NotesDataFetcher />;
}
