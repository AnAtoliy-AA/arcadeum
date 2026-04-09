import { Suspense } from 'react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { chatApi } from '@/features/chat/api';
import { ChatListPage } from './ChatListPage';
import ChatsLoading from './loading';

export const metadata: Metadata = {
  title: 'Chats',
  description: 'Manage your direct conversations and messages.',
};

export default function ChatsRoute() {
  return (
    <Suspense fallback={<ChatsLoading />}>
      <ChatDataFetcher />
    </Suspense>
  );
}

async function ChatDataFetcher() {
  const accessToken = await getServerAccessToken();

  // Initial fetch on server
  let initialData = null;
  try {
    if (accessToken) {
      initialData = await chatApi.getChats({
        token: accessToken,
        timeout: 3000,
      });
    }
  } catch (error) {
    console.error('Failed to pre-fetch chats during SSR:', error);
  }

  return <ChatListPage initialData={initialData} />;
}
