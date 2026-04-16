'use client';

import { useState, useCallback, ComponentProps, ReactNode } from 'react';
import { useQuery } from '@/shared/hooks/useQuery';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { XStack, YStack, Text } from 'tamagui';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useIsMounted } from '@/widgets/header/ui/useIsMounted';
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
import { chatApi, ChatParticipant, ChatSummary } from '@/features/chat/api';
import { formatSafeDate } from '@/shared/lib/date';
import { DEBOUNCE } from '@/shared/config/constants';

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

export interface ChatListPageProps {
  initialData: ChatSummary[] | null;
}

export function ChatListPage({ initialData }: ChatListPageProps) {
  const router = useRouter();
  const { snapshot } = useSessionTokens();
  const isMounted = useIsMounted();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE.SEARCH_DELAY);

  const { data: queryChats, isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      return chatApi.getChats({ token: snapshot.accessToken || undefined });
    },
    enabled: !!snapshot.accessToken,
    initialData,
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
  const loading = chatsLoading && !initialData;

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
          <GlassCard p="$4">
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
              size="md"
            />
            {searchLoading && (
              <XStack p="$4" jc="center">
                <Spinner size="sm" />
              </XStack>
            )}
            {!!searchQuery.trim() && displaySearchResults.length > 0 && (
              <YStack
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius={12}
                overflow="hidden"
                marginTop="$2"
              >
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
                    <YStack>
                      <Text fontWeight="600">
                        {result.displayName || result.username}
                      </Text>
                      {result.email && (
                        <Text fontSize="$3" color="rgba(236,239,238,0.45)">
                          {result.email}
                        </Text>
                      )}
                    </YStack>
                  </SearchResultItem>
                ))}
              </YStack>
            )}
          </GlassCard>
        )}

        {loading ? (
          <YStack jc="center" ai="center" gap="$4" p="$12">
            <Spinner size="lg" aria-label="Loading" />
            <Text color="rgba(236,239,238,0.45)">Loading chats...</Text>
          </YStack>
        ) : displayChats.length === 0 ? (
          <YStack ai="center" gap="$5" p="$10" flex={1}>
            <EmptyState
              icon="💬"
              message={
                !isMounted
                  ? t('chatList.empty.loading') || 'Loading...'
                  : snapshot.accessToken
                    ? (t('chatList.empty.noChats') || 'No chats yet') +
                      '\n' +
                      'Start a conversation by searching for a user above!'
                    : t('chatList.empty.unauthenticated') || 'Sign in to chat'
              }
            />
            {!snapshot.accessToken && (
              <Button
                variant="primary"
                size="lg"
                onPress={() => router.push('/auth')}
              >
                Log In
              </Button>
            )}
          </YStack>
        ) : (
          <YStack gap="$4">
            {displayChats.map((chat: ChatSummary) => {
              const otherParticipants = chat.participants.filter(
                (p: ChatParticipant) => p.id !== currentUserId,
              );
              const title =
                otherParticipants.length > 0
                  ? otherParticipants
                      .map((p: ChatParticipant) => p.displayName || p.username)
                      .join(', ')
                  : t('chatList.messages.directChat') || 'Direct Chat';
              const receiverIds = otherParticipants
                .map((p: ChatParticipant) => p.id)
                .join(',');

              return (
                <Link
                  key={chat.chatId}
                  href={`/chat?chatId=${chat.chatId}&receiverIds=${receiverIds}&title=${encodeURIComponent(title)}`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                  }}
                >
                  <Card interactive padding="md" variant="elevated">
                    <XStack ai="center" gap="$4" width="100%">
                      <Avatar name={title} size="md" alt="" />
                      <YStack flex={1} gap="$1" minWidth={0}>
                        <XStack jc="space-between" ai="center" gap="$2">
                          <Text
                            fontWeight="600"
                            fontSize="$5"
                            color="$color"
                            numberOfLines={1}
                            flexShrink={1}
                          >
                            {title}
                          </Text>
                          {chat.lastMessage && (
                            <Text
                              fontSize="$2"
                              color="rgba(236,239,238,0.45)"
                              whiteSpace="nowrap"
                            >
                              {formatSafeDate(chat.lastMessage.timestamp)}
                            </Text>
                          )}
                        </XStack>
                        {chat.lastMessage && (
                          <Text
                            fontSize="$3"
                            color="rgba(236,239,238,0.45)"
                            numberOfLines={1}
                          >
                            <Text fontWeight="600">
                              {chat.lastMessage.senderUsername}:
                            </Text>{' '}
                            {chat.lastMessage.content}
                          </Text>
                        )}
                      </YStack>
                    </XStack>
                  </Card>
                </Link>
              );
            })}
          </YStack>
        )}
      </Container>
    </PageLayout>
  );
}
