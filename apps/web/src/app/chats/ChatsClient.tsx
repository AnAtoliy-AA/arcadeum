'use client';

import type { ChatListMessages, NavigationMessages } from '@/shared/i18n/types';
import dynamic from 'next/dynamic';
import ChatsLoading from './loading';

import type { ChatListPageProps } from './ChatListPage';

interface ChatsClientProps extends ChatListPageProps {
  chatListT?: ChatListMessages;
  navigationT?: NavigationMessages;
}

const ChatListPageDynamic = dynamic<ChatListPageProps>(
  () => import('./ChatListPage'),
  {
    ssr: false,
    loading: () => <ChatsLoading />,
  },
);

const ChatsClient = ({
  chatListT: _chatListT,
  navigationT: _navigationT,
  ...props
}: ChatsClientProps) => {
  return <ChatListPageDynamic {...props} />;
};

export default ChatsClient;
