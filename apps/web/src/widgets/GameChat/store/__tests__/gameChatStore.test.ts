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

  it('setCurrentUserId updates currentUserId', () => {
    expect(useGameChatStore.getState().currentUserId).toBeNull();
    useGameChatStore.getState().setCurrentUserId('user-1');
    expect(useGameChatStore.getState().currentUserId).toBe('user-1');
  });

  it('registerResolveEquipped sets resolver', () => {
    const fn = (id?: string | null) =>
      id === 'u1'
        ? {
            equippedAvatarId: 'a1',
            equippedBadgeId: null,
            equippedNameColorId: null,
            equippedFrameId: null,
            equippedAuraId: null,
            equippedBannerId: null,
          }
        : null;
    useGameChatStore.getState().registerResolveEquipped(fn);
    expect(useGameChatStore.getState().resolveEquipped).toBe(fn);
  });

  it('registerFallbackResolveDisplayName sets fallback resolver', () => {
    const fn = (_id?: string | null, _fallback?: string | null) => 'Player';
    useGameChatStore.getState().registerFallbackResolveDisplayName(fn);
    expect(useGameChatStore.getState().fallbackResolveDisplayName).toBe(fn);
  });

  it('setChatPanelOpen updates chatPanelOpen', () => {
    expect(useGameChatStore.getState().chatPanelOpen).toBe(false);
    useGameChatStore.getState().setChatPanelOpen(true);
    expect(useGameChatStore.getState().chatPanelOpen).toBe(true);
  });

  it('clear resets new fields', () => {
    useGameChatStore.getState().setCurrentUserId('user-1');
    useGameChatStore.getState().registerResolveEquipped(() => null);
    useGameChatStore.getState().registerFallbackResolveDisplayName(() => 'X');
    useGameChatStore.getState().setChatPanelOpen(true);
    useGameChatStore.getState().clear();
    const s = useGameChatStore.getState();
    expect(s.currentUserId).toBeNull();
    expect(s.resolveEquipped).toBeNull();
    expect(s.fallbackResolveDisplayName).toBeNull();
    expect(s.chatPanelOpen).toBe(false);
  });
});
