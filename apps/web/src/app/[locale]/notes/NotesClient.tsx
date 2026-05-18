'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui/Loading/PageLoading';
import type { PaginatedNotes } from '@/features/payment/api';

interface NotesClientProps {
  initialData: { pages: PaginatedNotes[] } | null;
}

const NotesPage = dynamic(() => import('./NotesPage'), {
  ssr: false,
  loading: () => <PageLoading layout="standard" />,
});

export default function NotesClient({ initialData }: NotesClientProps) {
  return <NotesPage initialData={initialData} />;
}
