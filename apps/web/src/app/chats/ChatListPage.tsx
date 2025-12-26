'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { resolveApiUrl } from '@/shared/lib/api-base';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Input, Spinner } from '@/shared/ui';

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

interface ChatSummary {
  chatId: string;
  participants: Array<{
    id: string;
    username: string;
    displayName?: string;
    email?: string;
  }>;
  lastMessage?: {
    senderUsername: string;
    content: string;
    timestamp: string;
  };
}

interface ChatParticipant {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
}

export function ChatListPage() {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const { t } = useTranslation();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatParticipant[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchChats = useCallback(async () => {
    if (!snapshot.accessToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = resolveApiUrl('/chat');
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${snapshot.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      setChats(data || []);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    } finally {
      setLoading(false);
    }
  }, [snapshot.accessToken]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (!searchQuery.trim() || !snapshot.accessToken) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const url = resolveApiUrl(
          `/chat/search?q=${encodeURIComponent(searchQuery)}`,
        );
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${snapshot.accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSearchResults(
            (data || []).filter(
              (p: ChatParticipant) => p.id !== snapshot.userId,
            ),
          );
        } else {
          console.error('Search request failed:', response.status);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, snapshot.accessToken, snapshot.userId]);

  const handleSelectUser = useCallback(
    async (user: ChatParticipant) => {
      if (!snapshot.accessToken || !snapshot.userId) return;

      try {
        const url = resolveApiUrl('/chat');
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${snapshot.accessToken}`,
          },
          body: JSON.stringify({
            users: [snapshot.userId, user.id],
          }),
        });

        if (response.ok) {
          const chat = await response.json();
          router.push(
            `/chat?chatId=${chat.chatId}&receiverIds=${user.id}&title=${encodeURIComponent(user.displayName || user.username)}`,
          );
        } else {
          console.error('Failed to create chat:', response.status);
        }
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
            {searchQuery.trim() && searchResults.length > 0 && (
              <SearchResults>
                {searchResults.map((result) => (
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
        ) : chats.length === 0 ? (
          <Empty>
            {snapshot.accessToken
              ? t('chatList.empty.noChats') ||
                'No chats yet. Start a conversation!'
              : t('chatList.empty.unauthenticated') ||
                'Sign in to start chatting'}
          </Empty>
        ) : (
          <ChatList>
            {chats.map((chat) => {
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
