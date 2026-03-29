'use client';

import dynamic from 'next/dynamic';
import { PageLoading } from '@/shared/ui';

const ChatListPage = dynamic(
  () => import('./ChatListPage').then((mod) => mod.ChatListPage),
  {
    loading: () => <PageLoading />,
    ssr: false,
  },
);

export default function ChatsRoute() {
  return <ChatListPage />;
}
