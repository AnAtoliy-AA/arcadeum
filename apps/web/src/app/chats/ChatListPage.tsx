'use client';

import { useState, useCallback, ComponentProps, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Button } from '@arcadeum/ui';
import {
  PageLayout,
  Container,
  PageTitle,
  GlassCard,
  Card,
  Avatar,
  Input,
  Spinner,
  EmptyState,
} from '@/shared/ui';
import { chatApi, ChatParticipant } from '@/features/chat/api';
import { formatSafeDate } from '@/shared/lib/date';
import { QUERY_CONFIG, DEBOUNCE } from '@/shared/config/constants';

interface SearchResultItemProps extends ComponentProps<typeof Button> {
  isLast?: boolean;
  children?: ReactNode;
}

const SearchResultItem = ({ isLast, ...props }: SearchResultItemProps) => (
  <Button
    variant="ghost"
    size="md"
    p="$4"
    w="100%"
    justifyContent="flex-start"
    br={0}
    bbw={isLast ? 0 : 1}
    bbc="$borderColor"
    bg="$background"
    color="$color"
    gap="$3"
    hoverStyle={{
      bg: '$background',
      opacity: 0.9,
    }}
    {...props}
  />
);

const SearchResults = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.surfaces.card.border};
  border-radius: 12px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const ChatList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChatItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
`;

const ChatInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0; /* meaningful for text truncation */
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const ChatTitleText = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: ${({ theme }) => theme.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatSubtitle = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.text.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatTimestamp = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.text.muted};
  white-space: nowrap;
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

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

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
      } catch {}
    },
    [snapshot.accessToken, snapshot.userId, router],
  );

  const currentUserId = snapshot.userId ?? '';

  return (
    <PageLayout>
      <Container>
        <PageTitle size="xl" gradient>
          {t('navigation.chatsTab') || 'Chats'}
        </PageTitle>

        {snapshot.accessToken && (
          <GlassCard>
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
            {searchLoading && (
              <div
                style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Spinner size="sm" />
              </div>
            )}
            {!!searchQuery.trim() && displaySearchResults.length > 0 && (
              <SearchResults>
                {displaySearchResults.map((result, index) => (
                  <SearchResultItem
                    key={result.id}
                    isLast={index === displaySearchResults.length - 1}
                    onClick={() => handleSelectUser(result)}
                  >
                    <Avatar
                      name={result.displayName || result.username}
                      size="sm"
                      alt=""
                    />
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
          </GlassCard>
        )}

        {loading ? (
          <LoadingContainer>
            <Spinner size="lg" aria-label="Loading" />
            <div>Loading chats...</div>
          </LoadingContainer>
        ) : displayChats.length === 0 ? (
          <EmptyState
            message={
              snapshot.accessToken
                ? (t('chatList.empty.noChats') || 'No chats yet') +
                  '\n' +
                  'Start a conversation by searching for a user above!'
                : (t('chatList.empty.unauthenticated') || 'Sign in to chat') +
                  '\n' +
                  'Please sign in to access your chats.'
            }
          />
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
                <StyledLink
                  key={chat.chatId}
                  href={`/chat?chatId=${chat.chatId}&receiverIds=${receiverIds}&title=${encodeURIComponent(title)}`}
                >
                  <Card interactive padding="md" variant="elevated">
                    <ChatItemContent>
                      <Avatar name={title} size="md" alt="" />
                      <ChatInfo>
                        <ChatHeader>
                          <ChatTitleText>{title}</ChatTitleText>
                          {chat.lastMessage && (
                            <ChatTimestamp>
                              {formatSafeDate(chat.lastMessage.timestamp)}
                            </ChatTimestamp>
                          )}
                        </ChatHeader>
                        {chat.lastMessage && (
                          <ChatSubtitle>
                            <span style={{ fontWeight: 600 }}>
                              {chat.lastMessage.senderUsername}:
                            </span>{' '}
                            {chat.lastMessage.content}
                          </ChatSubtitle>
                        )}
                      </ChatInfo>
                    </ChatItemContent>
                  </Card>
                </StyledLink>
              );
            })}
          </ChatList>
        )}
      </Container>
    </PageLayout>
  );
}
