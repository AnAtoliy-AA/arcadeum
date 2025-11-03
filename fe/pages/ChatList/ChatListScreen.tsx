import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { useSessionTokens } from '@/stores/sessionTokens';
import type { SessionTokensSnapshot } from '@/stores/sessionTokens';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useTranslation } from '@/lib/i18n';
import {
  ChatParticipant,
  ChatSummary,
  createChat,
  fetchChats,
  searchUsers,
} from '@/pages/ChatScreen/api/chatApi';

function useChatList(params: { accessToken?: string | null; refreshTokens?: () => Promise<SessionTokensSnapshot> }) {
  const { accessToken, refreshTokens } = params;
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatSummary[]>([]);

  const fetchOptions = useMemo(() => (refreshTokens ? { refreshTokens } : undefined), [refreshTokens]);

  const loadChats = useCallback(async () => {
    if (!accessToken) {
      setChats([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchChats(accessToken, fetchOptions);
      setChats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchOptions]);

  useEffect(() => {
    if (accessToken) {
      loadChats();
    } else {
      setLoading(false);
    }
  }, [accessToken, loadChats]);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    try {
      setRefreshing(true);
      const data = await fetchChats(accessToken, fetchOptions);
      setChats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRefreshing(false);
    }
  }, [accessToken, fetchOptions]);

  const upsertChat = useCallback((chat: ChatSummary) => {
    setChats((previous) => {
      const index = previous.findIndex((item) => item.chatId === chat.chatId);
      if (index === -1) {
        return [chat, ...previous];
      }
      const copy = [...previous];
      copy[index] = chat;
      return copy;
    });
  }, []);

  return { loading, refreshing, chats, error, refresh, reload: loadChats, upsertChat, fetchOptions };
}

export default function ChatListScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tokens, refreshTokens } = useSessionTokens();
  const { t } = useTranslation();
  const {
    shouldBlock,
    isAuthenticated,
  } = useSessionScreenGate({
    whenUnauthenticated: '/auth',
    enableOn: ['web'],
    blockWhenUnauthenticated: false,
  });

  const { loading, refreshing, chats, error, refresh, upsertChat, fetchOptions } = useChatList({
    accessToken: tokens.accessToken,
    refreshTokens,
  });

  const currentUserId = tokens.userId ?? '';
  const accessToken = tokens.accessToken;
  const placeholderColor = useThemeColor({}, 'icon') as string;
  const avatarIconColor = useThemeColor({}, 'background') as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatParticipant[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [creatingChatUserId, setCreatingChatUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length === 0) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    const abortController = new AbortController();
    setSearchLoading(true);
    setSearchError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchUsers(trimmed, accessToken, abortController.signal, fetchOptions);
        setSearchResults(results.filter((participant) => participant.id !== currentUserId));
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }
        setSearchError(error instanceof Error ? error.message : String(error));
        setSearchResults([]);
      } finally {
        if (!abortController.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      abortController.abort();
      clearTimeout(timeoutId);
    };
  }, [searchQuery, accessToken, currentUserId, fetchOptions]);

  const handleSelectUser = useCallback(
    async (user: ChatParticipant) => {
      if (!accessToken || !currentUserId) {
        setSearchError(t('chatList.errors.authRequired'));
        return;
      }

      setCreatingChatUserId(user.id);
      setSearchError(null);

      try {
        const participantIds = Array.from(new Set([currentUserId, user.id]));
        const createdChat = await createChat(participantIds, accessToken, undefined, fetchOptions);
        upsertChat(createdChat);
        setSearchQuery('');
        setSearchResults([]);

        const otherParticipants = createdChat.participants.filter(
          (participant) => participant.id !== currentUserId,
        );
        const title = otherParticipants.length
          ? otherParticipants
              .map((participant) => participant.displayName ?? participant.username)
              .join(', ')
          : t('chatList.messages.directChat');
        const receiverIds = otherParticipants.map((participant) => participant.id).join(',');

        router.push({
          pathname: '/chat',
          params: {
            chatId: createdChat.chatId,
            receiverIds,
            title,
          },
        });
      } catch (error) {
        setSearchError(error instanceof Error ? error.message : String(error));
      } finally {
        setCreatingChatUserId(null);
      }
    },
    [accessToken, currentUserId, router, t, upsertChat, fetchOptions],
  );

  const renderItem = useCallback(
    ({ item }: { item: ChatSummary }) => {
      const otherParticipants: ChatParticipant[] = item.participants.filter(
        (participant) => participant.id !== currentUserId,
      );
        const title = otherParticipants.length
          ? otherParticipants
              .map((participant) => participant.displayName ?? participant.username)
              .join(', ')
        : t('chatList.messages.directChat');

      const subtitle = item.lastMessage
        ? `${item.lastMessage.senderUsername}: ${item.lastMessage.content}`
        : t('chatList.messages.noMessagesYet');

      const handlePress = () => {
        const receiverIds = otherParticipants.map((participant) => participant.id).join(',');
        router.push({
          pathname: '/chat',
          params: {
            chatId: item.chatId,
            receiverIds,
            title,
          },
        });
      };

      return (
        <TouchableOpacity style={styles.chatItem} onPress={handlePress}>
          <View style={styles.chatItemContent}>
            <View style={styles.chatAvatar}>
              <IconSymbol name="person.circle.fill" size={20} color={avatarIconColor} />
            </View>
            <View style={styles.chatTextContainer}>
              <ThemedText style={styles.chatTitle} numberOfLines={1}>
                {title}
              </ThemedText>
              <ThemedText style={styles.chatSubtitle} numberOfLines={2}>
                {subtitle}
              </ThemedText>
            </View>
          </View>
          {item.lastMessage && (
            <ThemedText style={styles.chatTimestamp}>
              {new Date(item.lastMessage.timestamp).toLocaleString()}
            </ThemedText>
          )}
        </TouchableOpacity>
      );
    },
    [avatarIconColor, currentUserId, router, styles, t],
  );

  const keyExtractor = useCallback((item: ChatSummary) => item.chatId, []);

  const listHeader = useMemo(() => {
    return (
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('chatList.search.placeholder')}
          placeholderTextColor={placeholderColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          editable={Boolean(accessToken)}
        />
        {searchLoading && (
          <View style={styles.searchStatus}>
            <ActivityIndicator size="small" />
            <ThemedText style={styles.placeholderText}>{t('chatList.search.searching')}</ThemedText>
          </View>
        )}
        {!accessToken && (
          <View style={styles.searchStatus}>
            <ThemedText style={styles.placeholderText}>{t('chatList.search.signInRequired')}</ThemedText>
          </View>
        )}
        {searchError && (
          <View style={styles.searchStatus}>
            <ThemedText style={styles.errorText}>{searchError}</ThemedText>
          </View>
        )}
        {accessToken && searchQuery.trim().length > 0 && !searchLoading && !searchError && (
          <View style={styles.searchResultsContainer}>
            {searchResults.length === 0 ? (
              <View style={styles.searchResultItem}>
                <ThemedText style={styles.placeholderText}>{t('chatList.search.noResults')}</ThemedText>
              </View>
            ) : (
              searchResults.map((result) => {
                const disabled = creatingChatUserId === result.id;
                return (
                  <TouchableOpacity
                    key={result.id}
                    style={[styles.searchResultItem, disabled && styles.searchResultItemDisabled]}
                    onPress={() => handleSelectUser(result)}
                    disabled={disabled}
                  >
                    <View style={styles.searchResultContent}>
                      <View style={styles.searchResultAvatar}>
                        <IconSymbol name="person.circle.fill" size={18} color={avatarIconColor} />
                      </View>
                      <View style={styles.searchResultTextContainer}>
                        <ThemedText style={styles.searchResultTitle}>
                          {result.displayName ?? result.username}
                        </ThemedText>
                        {result.email ? (
                          <ThemedText style={styles.searchResultSubtitle}>{result.email}</ThemedText>
                        ) : null}
                      </View>
                    </View>
                    {disabled && <ActivityIndicator size="small" />}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </View>
    );
  }, [avatarIconColor, styles, placeholderColor, searchQuery, searchLoading, searchError, searchResults, creatingChatUserId, handleSelectUser, accessToken, t]);

  const emptyComponent = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      return null;
    }
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      );
    }
    if (!isAuthenticated) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.placeholderText}>{t('chatList.empty.unauthenticated')}</ThemedText>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.placeholderText}>{t('chatList.empty.noChats')}</ThemedText>
      </View>
    );
  }, [loading, error, styles, isAuthenticated, searchQuery, t]);

  if (shouldBlock) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={[styles.loadingContainer, { paddingBottom: insets.bottom }]}>
          <ActivityIndicator size="large" />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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

function createStyles(palette: Palette) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: palette.background,
    },
    container: {
      flex: 1,
      backgroundColor: palette.background,
      paddingTop: 12,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.background,
      paddingTop: 12,
    },
    listContent: {
      paddingVertical: 12,
    },
    chatItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.icon,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    chatItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    chatAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.tint,
    },
    chatTextContainer: {
      flex: 1,
      gap: 4,
    },
    chatTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    chatSubtitle: {
      fontSize: 14,
      color: palette.icon,
    },
    chatTimestamp: {
      fontSize: 12,
      color: palette.icon,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
    },
    placeholderText: {
      fontSize: 14,
      color: palette.icon,
    },
    errorText: {
      fontSize: 14,
      color: palette.error,
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 12,
      marginBottom: 12,
    },
    searchInput: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: palette.text,
      backgroundColor: palette.background,
    },
    searchStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    searchResultsContainer: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
      borderRadius: 8,
      overflow: 'hidden',
    },
    searchResultItem: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      backgroundColor: palette.background,
    },
    searchResultItemDisabled: {
      opacity: 0.6,
    },
    searchResultContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    searchResultAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.tint,
    },
    searchResultTextContainer: {
      flex: 1,
      gap: 2,
    },
    searchResultTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    searchResultSubtitle: {
      fontSize: 14,
      color: palette.icon,
    },
  });
}
