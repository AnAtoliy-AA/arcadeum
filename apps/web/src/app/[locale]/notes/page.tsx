import { paymentApi } from '@/features/payment/api';
import { SSR_TIMEOUT } from '@/shared/config/app-config';
import type { Metadata } from 'next';
import NotesClient from './NotesClient';

export const metadata: Metadata = {
  title: 'Patch Notes',
  description: 'Latest changes and updates to the platform.',
};

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
