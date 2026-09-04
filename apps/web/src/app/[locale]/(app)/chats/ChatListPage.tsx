'use client';

import {
  useState,
  useCallback,
  useDeferredValue,
  ComponentProps,
  ReactNode,
} from 'react';
import { useQuery } from '@/shared/hooks/useQuery';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import {
  Button,
  PageLayout,
  Container,
  PageTitle,
  GlassCard,
  Card,
  Avatar,
  Input,
  Spinner,
  EmptyState,
} from '@arcadeum/ui';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import { chatApi, ChatParticipant, ChatSummary } from '@/features/chat/api';
import { formatSafeDate } from '@/shared/lib/date';
import { DEBOUNCE } from '@/shared/config/constants';

interface SearchResultItemProps {
  isLast?: boolean;
  onClick?: ComponentProps<typeof Button>['onClick'];
  children?: ReactNode;
}

const SearchResultItem = ({
  isLast,
  onClick,
  children,
}: SearchResultItemProps) => (
  <Button
    className={`p-4 w-full justify-start rounded-none bg-[var(--background)] text-[var(--color)] gap-3 hover:bg-[var(--background)] hover:opacity-90 ${
      isLast ? 'border-b-0' : 'border-b border-b-[var(--borderColor)]'
    }`}
    variant="ghost"
    size="md"
    onClick={onClick}
  >
    {children}
  </Button>
);

export interface ChatListPageProps {
  initialData: ChatSummary[] | null;
}

export default function ChatListPage({ initialData }: ChatListPageProps) {
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
  const displaySearchResults = useDeferredValue(querySearchResults) || [];
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
          <GlassCard className={'p-4'}>
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
              <div className="flex flex-row items-stretch p-4 justify-center">
                <Spinner size="sm" />
              </div>
            )}
            {!!searchQuery.trim() && displaySearchResults.length > 0 && (
              <div className="flex flex-col items-stretch border border-[var(--borderColor)] rounded-[12px] overflow-hidden -mt-2">
                {displaySearchResults.map((result, index) => (
                  <SearchResultItem
                    key={result.id}
                    isLast={index === displaySearchResults.length - 1}
                    onClick={() => handleSelectUser(result)}
                  >
                    <EquippedPlayerAvatar
                      name={result.displayName || result.username}
                      size="icon"
                      equippedAvatarId={null}
                      equippedBadgeId={null}
                    />
                    <div className="flex flex-col items-stretch">
                      <span className="font-semibold">
                        {result.displayName || result.username}
                      </span>
                      {result.email && (
                        <span className="text-[16px] text-[rgba(236,239,238,0.45)]">
                          {result.email}
                        </span>
                      )}
                    </div>
                  </SearchResultItem>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center gap-4 p-12">
            <Spinner size="lg" aria-label="Loading" />
            <span className="text-[rgba(236,239,238,0.45)]">
              {t('chatList.loading') || 'Loading chats...'}
            </span>
          </div>
        ) : displayChats.length === 0 ? (
          <div className="flex flex-col items-center gap-5 p-10 flex-1">
            <EmptyState
              icon="💬"
              message={
                !isMounted
                  ? t('chatList.empty.loading') || 'Loading...'
                  : snapshot.accessToken
                    ? (t('chatList.empty.noChats') || 'No chats yet') +
                      '\n' +
                      (t('chatList.empty.startConversation') ||
                        'Start a conversation by searching for a user above!')
                    : t('chatList.empty.unauthenticated') || 'Sign in to chat'
              }
            />
            {!snapshot.accessToken && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/auth')}
              >
                {t('chatList.loginButton') || 'Log In'}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-stretch gap-4">
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
                  }}
                >
                  <Card interactive variant="elevated">
                    <div className="flex flex-row items-center gap-4 w-full">
                      <Avatar name={title} size="md" alt={`${title} avatar`} />
                      <div className="flex flex-col items-stretch flex-1 gap-1 min-w-0">
                        <div className="flex flex-row justify-between items-center gap-2">
                          <span className="font-semibold text-[20px] text-[var(--color)] line-clamp-1 shrink-[1]">
                            {title}
                          </span>
                          {chat.lastMessage && (
                            <span className="text-[14px] text-[rgba(236,239,238,0.45)] whitespace-nowrap">
                              {formatSafeDate(chat.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <span className="text-[16px] text-[rgba(236,239,238,0.45)] line-clamp-1">
                            <span className="font-semibold">
                              {chat.lastMessage.senderUsername}:
                            </span>{' '}
                            {chat.lastMessage.content}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </PageLayout>
  );
}
