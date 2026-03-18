import { describe, it, expect, beforeEach } from 'vitest';
import { useGameChatStore } from '../gameChatStore';

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
        senderId: 'u1',
        senderName: 'Alice',
        scope: 'all' as const,
      },
    ];
    useGameChatStore.getState().setLogs(logs);
    expect(useGameChatStore.getState().logs).toEqual(logs);
  });

  it('registerSendMessage registers the function', () => {
    const fn = (msg: string) => {
      void msg;
    };
    useGameChatStore.getState().registerSendMessage(fn as never);
    expect(useGameChatStore.getState().sendMessage).toBe(fn);
  });

  it('clear resets state', () => {
    const fn = (msg: string) => {
      void msg;
    };
    useGameChatStore.getState().registerSendMessage(fn as never);
    useGameChatStore.getState().clear();
    expect(useGameChatStore.getState().logs).toEqual([]);
    expect(useGameChatStore.getState().sendMessage).toBeNull();
  });
});
