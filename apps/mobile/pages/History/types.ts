import type { SessionTokensSnapshot } from '@/stores/sessionTokens';
import type { HistorySummary, HistoryStatus } from './api/historyApi';

export type HistoryHookParams = {
  accessToken?: string | null;
  refreshTokens?: () => Promise<SessionTokensSnapshot>;
};

export type ParticipantsSelection = Record<string, boolean>;

export type UseHistoryListParams = HistoryHookParams & {
  searchQuery?: string;
  statusFilter?: HistoryStatus | 'all';
};

export type UseHistoryListReturn = {
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  entries: HistorySummary[];
  error: string | null;
  refresh: () => Promise<void>;
  reload: () => void;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  totalCount: number;
  fetchOptions: { refreshTokens: () => Promise<SessionTokensSnapshot> } | undefined;
};
