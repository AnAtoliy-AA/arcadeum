import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatApi } from './api';
import { apiClient } from '@/shared/lib/api-client';

vi.mock('@/shared/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('chatApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getChats calls the correct endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([]);
    await chatApi.getChats();
    expect(apiClient.get).toHaveBeenCalledWith('/chat', undefined);
  });

  it('searchUsers encodes query correctly', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([]);
    await chatApi.searchUsers('john doe');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/chat/search?q=john%20doe',
      undefined,
    );
  });

  it('createChat sends POST request', async () => {
    const payload = { users: ['u1', 'u2'] };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ chatId: 'c1' });
    await chatApi.createChat(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/chat', payload, undefined);
  });

  it('getMessages calls the correct endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([]);
    await chatApi.getMessages('chat-123');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/chat/chat-123/messages',
      undefined,
    );
  });
});
