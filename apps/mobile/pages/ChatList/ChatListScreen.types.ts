import type {
  ChatParticipant,
  ChatSummary,
} from '@/pages/ChatScreen/api/chatApi';
import type { SessionTokensSnapshot } from '@/stores/sessionTokens';

export interface UseChatListParams {
  accessToken?: string | null;
  refreshTokens?: () => Promise<SessionTokensSnapshot>;
}

export interface UseChatListResult {
  loading: boolean;
  refreshing: boolean;
  chats: ChatSummary[];
  error: string | null;
  refresh: () => Promise<void>;
  reload: () => Promise<void>;
  upsertChat: (chat: ChatSummary) => void;
  fetchOptions?: { refreshTokens: () => Promise<SessionTokensSnapshot> };
}

export interface UseUserSearchParams {
  searchQuery: string;
  accessToken?: string | null;
  currentUserId: string;
  fetchOptions?: { refreshTokens: () => Promise<SessionTokensSnapshot> };
}

export interface UseUserSearchResult {
  searchResults: ChatParticipant[];
  searchLoading: boolean;
  searchError: string | null;
}

export type { ChatParticipant, ChatSummary };
