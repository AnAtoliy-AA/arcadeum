import { Suspense } from 'react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { paymentApi } from '@/features/payment/api';
import { NotesPage } from './NotesPage';
import NotesLoading from './loading';

export const metadata: Metadata = {
  title: 'Supporter Notes',
  description:
    'Messages of support from our amazing community. Thank you for keeping us going!',
};

export default function NotesRoute() {
  return (
    <Suspense fallback={<NotesLoading />}>
      <NotesDataFetcher />
    </Suspense>
  );
}

async function NotesDataFetcher() {
  // Initial fetch on server
  let initialData = null;
  try {
    initialData = await paymentApi.getNotes(1, 12, {
      timeout: 3000,
    });
  } catch (error) {
    console.error('Failed to pre-fetch notes during SSR:', error);
  }

  return (
    <NotesPage initialData={initialData ? { pages: [initialData] } : null} />
  );
}
