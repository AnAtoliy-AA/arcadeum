import React from 'react';
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import type { ChatParticipant, ChatSummary } from './ChatListScreen.types';
import type { ChatListScreenStyles } from './ChatListScreen.styles';

type TranslateFn = (
  key: string,
  replacements?: Record<string, unknown>,
) => string;

interface ChatItemProps {
  item: ChatSummary;
  currentUserId: string;
  avatarIconColor: string;
  onPress: () => void;
  styles: ChatListScreenStyles;
  t: TranslateFn;
}

export function ChatItem({
  item,
  currentUserId,
  avatarIconColor,
  onPress,
  styles,
  t,
}: ChatItemProps): React.JSX.Element {
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

  return (
    <TouchableOpacity style={styles.chatItem} onPress={onPress}>
      <View style={styles.chatItemContent}>
        <View style={styles.chatAvatar}>
          <IconSymbol
            name="person.circle.fill"
            size={20}
            color={avatarIconColor}
          />
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
}

interface SearchHeaderProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchLoading: boolean;
  searchError: string | null;
  searchResults: ChatParticipant[];
  creatingChatUserId: string | null;
  accessToken?: string | null;
  avatarIconColor: string;
  placeholderColor: string;
  onSelectUser: (user: ChatParticipant) => void;
  styles: ChatListScreenStyles;
  t: TranslateFn;
}

export function SearchHeader({
  searchQuery,
  onSearchQueryChange,
  searchLoading,
  searchError,
  searchResults,
  creatingChatUserId,
  accessToken,
  avatarIconColor,
  placeholderColor,
  onSelectUser,
  styles,
  t,
}: SearchHeaderProps): React.JSX.Element {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder={t('chatList.search.placeholder')}
        placeholderTextColor={placeholderColor}
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        editable={Boolean(accessToken)}
      />
      {searchLoading && (
        <View style={styles.searchStatus}>
          <ActivityIndicator size="small" />
          <ThemedText style={styles.placeholderText}>
            {t('chatList.search.searching')}
          </ThemedText>
        </View>
      )}
      {!accessToken && (
        <View style={styles.searchStatus}>
          <ThemedText style={styles.placeholderText}>
            {t('chatList.search.signInRequired')}
          </ThemedText>
        </View>
      )}
      {searchError && (
        <View style={styles.searchStatus}>
          <ThemedText style={styles.errorText}>{searchError}</ThemedText>
        </View>
      )}
      {accessToken &&
        searchQuery.trim().length > 0 &&
        !searchLoading &&
        !searchError && (
          <View style={styles.searchResultsContainer}>
            {searchResults.length === 0 ? (
              <View style={styles.searchResultItem}>
                <ThemedText style={styles.placeholderText}>
                  {t('chatList.search.noResults')}
                </ThemedText>
              </View>
            ) : (
              searchResults.map((result) => {
                const disabled = creatingChatUserId === result.id;
                return (
                  <TouchableOpacity
                    key={result.id}
                    style={[
                      styles.searchResultItem,
                      disabled && styles.searchResultItemDisabled,
                    ]}
                    onPress={() => onSelectUser(result)}
                    disabled={disabled}
                  >
                    <View style={styles.searchResultContent}>
                      <View style={styles.searchResultAvatar}>
                        <IconSymbol
                          name="person.circle.fill"
                          size={18}
                          color={avatarIconColor}
                        />
                      </View>
                      <View style={styles.searchResultTextContainer}>
                        <ThemedText style={styles.searchResultTitle}>
                          {result.displayName ?? result.username}
                        </ThemedText>
                        {result.email ? (
                          <ThemedText style={styles.searchResultSubtitle}>
                            {result.email}
                          </ThemedText>
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
}

interface EmptyStateProps {
  searchQuery: string;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  styles: ChatListScreenStyles;
  t: TranslateFn;
}

export function EmptyState({
  searchQuery,
  loading,
  error,
  isAuthenticated,
  styles,
  t,
}: EmptyStateProps): React.JSX.Element | null {
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
        <ThemedText style={styles.placeholderText}>
          {t('chatList.empty.unauthenticated')}
        </ThemedText>
      </View>
    );
  }
  return (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.placeholderText}>
        {t('chatList.empty.noChats')}
      </ThemedText>
    </View>
  );
}
