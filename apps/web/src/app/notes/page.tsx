'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

const NotesPage = dynamic(
  () => import('./NotesPage').then((mod) => mod.NotesPage),
  {
    ssr: false,
    loading: () => <PageLoading />,
  },
);

export default function NotesRoute() {
  return <NotesPage />;
}
