import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLatestChatMessage } from '../useLatestChatMessage';
import type { ChatLogEntry } from '../../store/gameChatStore';

const makeLog = (overrides: Partial<ChatLogEntry> = {}): ChatLogEntry => ({
  id: 'log-1',
  type: 'message',
  message: 'hello',
  createdAt: new Date().toISOString(),
  senderId: 'user-1',
  senderName: 'Alice',
  scope: 'all',
  ...overrides,
});

describe('useLatestChatMessage', () => {
  it('returns null when no logs', () => {
    const { result } = renderHook(() => useLatestChatMessage([]));
    expect(result.current.latestMessage).toBeNull();
  });

  it('shows popup when a new message log arrives', () => {
    const log = makeLog();
    const { result, rerender } = renderHook(
      ({ logs }) => useLatestChatMessage(logs),
      { initialProps: { logs: [] as ChatLogEntry[] } },
    );
    rerender({ logs: [log] });
    expect(result.current.latestMessage).toMatchObject({
      id: 'log-1',
      senderName: 'Alice',
      message: 'hello',
    });
  });

  it('does not show popup for system or action logs', () => {
    const systemLog = makeLog({ type: 'system', senderId: null });
    const { result, rerender } = renderHook(
      ({ logs }) => useLatestChatMessage(logs),
      { initialProps: { logs: [] as ChatLogEntry[] } },
    );
    rerender({ logs: [systemLog] });
    expect(result.current.latestMessage).toBeNull();
  });

  it('dismiss() clears the message immediately', () => {
    const log = makeLog();
    const { result, rerender } = renderHook(
      ({ logs }) => useLatestChatMessage(logs),
      { initialProps: { logs: [] as ChatLogEntry[] } },
    );
    rerender({ logs: [log] });
    act(() => {
      result.current.dismiss();
    });
    expect(result.current.latestMessage).toBeNull();
  });

  it('shows new message after dismissing previous one', () => {
    const log1 = makeLog({ id: 'log-1', message: 'first' });
    const log2 = makeLog({ id: 'log-2', message: 'second' });
    const { result, rerender } = renderHook(
      ({ logs }) => useLatestChatMessage(logs),
      { initialProps: { logs: [] as ChatLogEntry[] } },
    );

    rerender({ logs: [log1] });
    act(() => {
      result.current.dismiss();
    });
    expect(result.current.latestMessage).toBeNull();

    rerender({ logs: [log1, log2] });
    expect(result.current.latestMessage).toMatchObject({
      id: 'log-2',
      message: 'second',
    });
  });
});
