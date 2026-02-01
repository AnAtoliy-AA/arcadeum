import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchChats,
  searchUsers,
  type ChatSummary,
} from '@/pages/ChatScreen/api/chatApi';
import type {
  UseChatListParams,
  UseChatListResult,
  UseUserSearchParams,
  UseUserSearchResult,
} from './ChatListScreen.types';

export function useChatList(params: UseChatListParams): UseChatListResult {
  const { accessToken, refreshTokens } = params;
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatSummary[]>([]);

  const fetchOptions = useMemo(
    () => (refreshTokens ? { refreshTokens } : undefined),
    [refreshTokens],
  );

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

  return {
    loading,
    refreshing,
    chats,
    error,
    refresh,
    reload: loadChats,
    upsertChat,
    fetchOptions,
  };
}

export function useUserSearch(
  params: UseUserSearchParams,
): UseUserSearchResult {
  const { searchQuery, accessToken, currentUserId, fetchOptions } = params;
  const [searchResults, setSearchResults] = useState<
    UseUserSearchResult['searchResults']
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

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
        const results = await searchUsers(
          trimmed,
          accessToken,
          abortController.signal,
          fetchOptions,
        );
        setSearchResults(
          results.filter((participant) => participant.id !== currentUserId),
        );
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

  return {
    searchResults,
    searchLoading,
    searchError,
  };
}
