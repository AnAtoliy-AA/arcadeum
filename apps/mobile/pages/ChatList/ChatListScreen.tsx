import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { useSessionTokens } from '@/stores/sessionTokens';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTranslation } from '@/lib/i18n';
import { createChat } from '@/pages/ChatScreen/api/chatApi';
import { useChatList, useUserSearch } from './ChatListScreen.hooks';
import {
  ChatItem,
  SearchHeader,
  EmptyState,
} from './ChatListScreen.components';
import { createStyles } from './ChatListScreen.styles';
import type { ChatParticipant, ChatSummary } from './ChatListScreen.types';

export default function ChatListScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tokens, refreshTokens } = useSessionTokens();
  const { t } = useTranslation();
  const { shouldBlock, isAuthenticated } = useSessionScreenGate({
    whenUnauthenticated: '/auth',
    enableOn: ['web'],
    blockWhenUnauthenticated: false,
  });

  const {
    loading,
    refreshing,
    chats,
    error,
    refresh,
    upsertChat,
    fetchOptions,
  } = useChatList({
    accessToken: tokens.accessToken,
    refreshTokens,
  });

  const currentUserId = tokens.userId ?? '';
  const accessToken = tokens.accessToken;
  const placeholderColor = useThemeColor({}, 'icon') as string;
  const avatarIconColor = useThemeColor({}, 'background') as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [creatingChatUserId, setCreatingChatUserId] = useState<string | null>(
    null,
  );

  const { searchResults, searchLoading, searchError } = useUserSearch({
    searchQuery,
    accessToken,
    currentUserId,
    fetchOptions,
  });

  const handleSelectUser = useCallback(
    async (user: ChatParticipant) => {
      if (!accessToken || !currentUserId) {
        return;
      }

      setCreatingChatUserId(user.id);

      try {
        const participantIds = Array.from(new Set([currentUserId, user.id]));
        const createdChat = await createChat(
          participantIds,
          accessToken,
          undefined,
          fetchOptions,
        );
        upsertChat(createdChat);
        setSearchQuery('');

        const otherParticipants = createdChat.participants.filter(
          (participant) => participant.id !== currentUserId,
        );
        const title = otherParticipants.length
          ? otherParticipants
              .map(
                (participant) =>
                  participant.displayName ?? participant.username,
              )
              .join(', ')
          : t('chatList.messages.directChat');
        const receiverIds = otherParticipants
          .map((participant) => participant.id)
          .join(',');

        router.push({
          pathname: '/chat',
          params: {
            chatId: createdChat.chatId,
            receiverIds,
            title,
          },
        });
      } catch (error) {
        // Error handling is done in the component
      } finally {
        setCreatingChatUserId(null);
      }
    },
    [accessToken, currentUserId, router, t, upsertChat, fetchOptions],
  );

  const handleChatPress = useCallback(
    (item: ChatSummary) => {
      const otherParticipants = item.participants.filter(
        (participant) => participant.id !== currentUserId,
      );
      const title = otherParticipants.length
        ? otherParticipants
            .map(
              (participant) => participant.displayName ?? participant.username,
            )
            .join(', ')
        : t('chatList.messages.directChat');

      const receiverIds = otherParticipants
        .map((participant) => participant.id)
        .join(',');
      router.push({
        pathname: '/chat',
        params: {
          chatId: item.chatId,
          receiverIds,
          title,
        },
      });
    },
    [currentUserId, router, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: ChatSummary }) => (
      <ChatItem
        item={item}
        currentUserId={currentUserId}
        avatarIconColor={avatarIconColor}
        onPress={() => handleChatPress(item)}
        styles={styles}
        t={t as (key: string, replacements?: Record<string, unknown>) => string}
      />
    ),
    [avatarIconColor, currentUserId, handleChatPress, styles, t],
  );

  const keyExtractor = useCallback((item: ChatSummary) => item.chatId, []);

  const listHeader = useMemo(
    () => (
      <SearchHeader
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        searchLoading={searchLoading}
        searchError={searchError}
        searchResults={searchResults}
        creatingChatUserId={creatingChatUserId}
        accessToken={accessToken}
        avatarIconColor={avatarIconColor}
        placeholderColor={placeholderColor}
        onSelectUser={handleSelectUser}
        styles={styles}
        t={t as (key: string, replacements?: Record<string, unknown>) => string}
      />
    ),
    [
      searchQuery,
      searchLoading,
      searchError,
      searchResults,
      creatingChatUserId,
      accessToken,
      avatarIconColor,
      placeholderColor,
      handleSelectUser,
      styles,
      t,
    ],
  );

  const emptyComponent = useMemo(
    () => (
      <EmptyState
        searchQuery={searchQuery}
        loading={loading}
        error={error}
        isAuthenticated={isAuthenticated}
        styles={styles}
        t={t as (key: string, replacements?: Record<string, unknown>) => string}
      />
    ),
    [searchQuery, loading, error, isAuthenticated, styles, t],
  );

  if (shouldBlock) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <ThemedView
          style={[styles.loadingContainer, { paddingBottom: insets.bottom }]}
        >
          <ActivityIndicator size="large" />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <ThemedView style={[styles.container, { paddingBottom: insets.bottom }]}>
        <FlatList
          data={chats}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} />
          }
          ListHeaderComponent={listHeader}
          ListEmptyComponent={emptyComponent}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
