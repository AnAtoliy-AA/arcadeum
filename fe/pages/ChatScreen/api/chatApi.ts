import { fetchWithRefresh, FetchWithRefreshOptions } from '@/lib/fetchWithRefresh';
import { resolveApiBase } from '@/lib/apiBase';

export interface MessageView {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  receiverIds: string[];
  content: string;
  timestamp: string;
}

export interface ChatParticipant {
  id: string;
  username: string;
  email: string | null;
  displayName: string | null;
}

export interface ChatSummary {
  chatId: string;
  participants: ChatParticipant[];
  lastMessage: MessageView | null;
}

type RawChatParticipant = {
  id: string;
  username?: string;
  email?: string | null;
  displayName?: string | null;
};

type RawMessageView = {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername?: string;
  receiverIds?: string[];
  content: string;
  timestamp: string;
};

type RawChatSummary = {
  chatId: string;
  participants?: RawChatParticipant[];
  lastMessage?: RawMessageView | null;
};

type RawUserSummary = {
  id: string;
  username?: string;
  email?: string | null;
  displayName?: string | null;
};

async function authorizedJson<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
  options?: FetchWithRefreshOptions,
): Promise<T> {
  const url = `${resolveApiBase()}${path}`;
  const method = init.method?.toUpperCase() ?? 'GET';
  const headers = new Headers(init.headers);
  if (method !== 'GET' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetchWithRefresh(url, { ...init, method, headers }, {
    accessToken,
    refreshTokens: options?.refreshTokens,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

function mapParticipant(raw: RawChatParticipant): ChatParticipant {
  return {
    id: raw.id,
    username: raw.username ?? raw.id,
    email: raw.email ?? null,
    displayName: raw.displayName ?? raw.username ?? raw.id ?? null,
  };
}

function mapMessage(raw: RawMessageView): MessageView {
  return {
    id: raw.id,
    chatId: raw.chatId,
    senderId: raw.senderId,
    senderUsername: raw.senderUsername ?? raw.senderId,
    receiverIds: Array.isArray(raw.receiverIds) ? raw.receiverIds : [],
    content: raw.content,
    timestamp: raw.timestamp,
  };
}

function mapChatSummary(raw: RawChatSummary): ChatSummary {
  return {
    chatId: raw.chatId,
    participants: Array.isArray(raw.participants)
      ? raw.participants.map(mapParticipant)
      : [],
    lastMessage: raw.lastMessage ? mapMessage(raw.lastMessage) : null,
  };
}

export async function fetchChats(
  accessToken: string,
  options?: FetchWithRefreshOptions,
): Promise<ChatSummary[]> {
  const data = await authorizedJson<RawChatSummary[]>('/chat', accessToken, undefined, options);
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map(mapChatSummary);
}

export async function searchUsers(
  query: string,
  accessToken: string,
  signal?: AbortSignal,
  options?: FetchWithRefreshOptions,
): Promise<ChatParticipant[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }
  const params = new URLSearchParams({ q: trimmed });
  const data = await authorizedJson<RawUserSummary[]>(
    `/auth/users/search?${params.toString()}`,
    accessToken,
    { signal },
    options,
  );
  if (!Array.isArray(data)) {
    return [];
  }
  return data
    .filter((item) => typeof item?.id === 'string' && item.id.trim().length > 0)
    .map(({ id, username, email, displayName }) =>
      mapParticipant({ id, username, email, displayName }),
    );
}

export async function createChat(
  participantIds: string[],
  accessToken: string,
  chatId?: string,
  options?: FetchWithRefreshOptions,
): Promise<ChatSummary> {
  const payload: { users: string[]; chatId?: string } = {
    users: participantIds,
  };
  if (chatId) {
    payload.chatId = chatId;
  }

  const data = await authorizedJson<RawChatSummary>('/chat', accessToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, options);
  return mapChatSummary(data);
}
