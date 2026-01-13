import { apiClient, ApiClientOptions } from '@/shared/lib/api-client';

export interface ChatParticipant {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
}

export interface ChatSummary {
  chatId: string;
  participants: ChatParticipant[];
  lastMessage?: {
    senderUsername: string;
    content: string;
    timestamp: string;
  };
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  receiverIds: string[];
  content: string;
  timestamp: string;
}

export interface CreateChatPayload {
  users: string[];
}

export interface CreateChatResponse {
  chatId: string;
}

export const chatApi = {
  getChats: async (options?: ApiClientOptions): Promise<ChatSummary[]> => {
    return apiClient.get<ChatSummary[]>('/chat', options);
  },

  searchUsers: async (
    query: string,
    options?: ApiClientOptions,
  ): Promise<ChatParticipant[]> => {
    return apiClient.get<ChatParticipant[]>(
      `/chat/search?q=${encodeURIComponent(query)}`,
      options,
    );
  },

  createChat: async (
    payload: CreateChatPayload,
    options?: ApiClientOptions,
  ): Promise<CreateChatResponse> => {
    return apiClient.post<CreateChatResponse>('/chat', payload, options);
  },

  getMessages: async (
    chatId: string,
    options?: ApiClientOptions,
  ): Promise<ChatMessage[]> => {
    return apiClient.get<ChatMessage[]>(`/chat/${chatId}/messages`, options);
  },
};
