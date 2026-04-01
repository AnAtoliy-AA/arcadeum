import { describe, it, expect, beforeEach } from 'vitest';
import { useGameChatStore } from '../gameChatStore';
import type { ChatScope } from '../gameChatStore';

describe('gameChatStore', () => {
  beforeEach(() => {
    useGameChatStore.getState().clear();
  });

  it('starts with empty logs and null sendMessage', () => {
    const state = useGameChatStore.getState();
    expect(state.logs).toEqual([]);
    expect(state.sendMessage).toBeNull();
  });

  it('setLogs updates logs', () => {
    const logs = [
      {
        id: '1',
        message: 'hello',
        type: 'message' as const,
        createdAt: '2026-03-18T00:00:00Z',
        senderId: 'u1',
        senderName: 'Alice',
        scope: 'all' as const,
      },
    ];
    useGameChatStore.getState().setLogs(logs);
    expect(useGameChatStore.getState().logs).toEqual(logs);
  });

  it('registerSendMessage registers the function', () => {
    const fn = (_msg: string, _scope: ChatScope) => {};
    useGameChatStore.getState().registerSendMessage(fn);
    expect(useGameChatStore.getState().sendMessage).toBe(fn);
  });

  it('clear resets state', () => {
    const fn = (_msg: string, _scope: ChatScope) => {};
    useGameChatStore.getState().registerSendMessage(fn);
    useGameChatStore.getState().clear();
    expect(useGameChatStore.getState().logs).toEqual([]);
    expect(useGameChatStore.getState().sendMessage).toBeNull();
  });
});
