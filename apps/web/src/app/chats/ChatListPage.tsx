'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Input, Spinner } from '@/shared/ui';
import { chatApi, ChatParticipant } from '@/features/chat/api';

const Page = styled.main`
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: ${({ theme }) => theme.background.base};
  color: ${({ theme }) => theme.text.primary};
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SearchResults = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 12px;
  overflow: hidden;
`;

const SearchResultItem = styled.button`
  padding: 1rem;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  color: ${({ theme }) => theme.text.primary};
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.surfaces.card.background};
    opacity: 0.9;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ChatList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ChatItem = styled(Link)`
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  background: ${({ theme }) => theme.surfaces.card.background};
  text-decoration: none;
  color: ${({ theme }) => theme.text.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.surfaces.card.shadow};
  }
`;

const ChatInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

const ChatTitle = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: ${({ theme }) => theme.text.primary};
`;

const ChatSubtitle = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
`;

const ChatTimestamp = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.muted};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: ${({ theme }) => theme.text.muted};
`;

const Empty = styled.div`
  padding: 3rem;
  text-align: center;
  color: ${({ theme }) => theme.text.muted};
`;

import { QUERY_CONFIG, DEBOUNCE } from '@/shared/config/constants';

export function ChatListPage() {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE.SEARCH_DELAY);

  const { data: queryChats, isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      return chatApi.getChats({ token: snapshot.accessToken || undefined });
    },
    enabled: !!snapshot.accessToken,
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
  });

  const { data: querySearchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['chat', 'search', debouncedSearchQuery],
    queryFn: async () => {
      if (!debouncedSearchQuery.trim()) return [];

      const results = await chatApi.searchUsers(debouncedSearchQuery, {
        token: snapshot.accessToken || undefined,
      });
      return results.filter((p) => p.id !== snapshot.userId);
    },
    enabled: !!snapshot.accessToken && !!debouncedSearchQuery.trim(),
  });

  const displayChats = queryChats || [];
  const displaySearchResults = querySearchResults || [];
  const loading = chatsLoading;

  const handleSelectUser = useCallback(
    async (user: ChatParticipant) => {
      if (!snapshot.accessToken || !snapshot.userId) return;

      try {
        const response = await chatApi.createChat(
          { users: [snapshot.userId, user.id] },
          { token: snapshot.accessToken },
        );

        router.push(
          `/chat?chatId=${response.chatId}&receiverIds=${user.id}&title=${encodeURIComponent(user.displayName || user.username)}`,
        );
      } catch (err) {
        console.error('Failed to create chat:', err);
      }
    },
    [snapshot.accessToken, snapshot.userId, router],
  );

  const currentUserId = snapshot.userId ?? '';

  return (
    <Page>
      <Container>
        <Title>{t('navigation.chatsTab') || 'Chats'}</Title>

        {snapshot.accessToken && (
          <SearchContainer>
            <Input
              type="text"
              placeholder={
                t('chatList.search.placeholder') || 'Search users...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={
                t('chatList.search.ariaLabel') ||
                'Search for users to chat with'
              }
              fullWidth
            />
            {searchLoading && <div>Searching...</div>}
            {searchQuery.trim() && displaySearchResults.length > 0 && (
              <SearchResults>
                {displaySearchResults.map((result) => (
                  <SearchResultItem
                    key={result.id}
                    onClick={() => handleSelectUser(result)}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {result.displayName || result.username}
                      </div>
                      {result.email && (
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>
                          {result.email}
                        </div>
                      )}
                    </div>
                  </SearchResultItem>
                ))}
              </SearchResults>
            )}
          </SearchContainer>
        )}

        {loading ? (
          <LoadingContainer>
            <Spinner size="lg" aria-label="Loading" />
            <div>Loading chats...</div>
          </LoadingContainer>
        ) : displayChats.length === 0 ? (
          <Empty>
            {snapshot.accessToken
              ? t('chatList.empty.noChats') ||
                'No chats yet. Start a conversation!'
              : t('chatList.empty.unauthenticated') ||
                'Sign in to start chatting'}
          </Empty>
        ) : (
          <ChatList>
            {displayChats.map((chat) => {
              const otherParticipants = chat.participants.filter(
                (p) => p.id !== currentUserId,
              );
              const title =
                otherParticipants.length > 0
                  ? otherParticipants
                      .map((p) => p.displayName || p.username)
                      .join(', ')
                  : t('chatList.messages.directChat') || 'Direct Chat';
              const receiverIds = otherParticipants.map((p) => p.id).join(',');

              return (
                <ChatItem
                  key={chat.chatId}
                  href={`/chat?chatId=${chat.chatId}&receiverIds=${receiverIds}&title=${encodeURIComponent(title)}`}
                >
                  <ChatInfo>
                    <ChatTitle>{title}</ChatTitle>
                    {chat.lastMessage && (
                      <ChatSubtitle>
                        {chat.lastMessage.senderUsername}:{' '}
                        {chat.lastMessage.content}
                      </ChatSubtitle>
                    )}
                  </ChatInfo>
                  {chat.lastMessage && (
                    <ChatTimestamp>
                      {new Date(chat.lastMessage.timestamp).toLocaleString()}
                    </ChatTimestamp>
                  )}
                </ChatItem>
              );
            })}
          </ChatList>
        )}
      </Container>
    </Page>
  );
}
