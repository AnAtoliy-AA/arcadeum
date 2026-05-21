import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLatestChatMessage } from '../useLatestChatMessage';
import type { ChatLogEntry } from '../../store/gameChatStore';

// Default createdAt is deliberately set to "future" so that messages arriving
// after the hook mounts qualify as fresh and trigger a popup.
const futureIso = () => new Date(Date.now() + 60_000).toISOString();
const pastIso = () => new Date(Date.now() - 60_000).toISOString();

const makeLog = (overrides: Partial<ChatLogEntry> = {}): ChatLogEntry => ({
  id: 'log-1',
  type: 'message',
  message: 'hello',
  createdAt: futureIso(),
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

  it('shows popup when a fresh message arrives after mount', () => {
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

  it('suppresses popup for historical messages already present at mount', () => {
    // Simulates a page-refresh snapshot — the most recent chat message was
    // created BEFORE the hook mounted, so it must not pop.
    const historicalLog = makeLog({ id: 'old-1', createdAt: pastIso() });
    const { result, rerender } = renderHook(
      ({ logs }) => useLatestChatMessage(logs),
      { initialProps: { logs: [] as ChatLogEntry[] } },
    );
    rerender({ logs: [historicalLog] });
    expect(result.current.latestMessage).toBeNull();
  });

  it('still pops a fresh message arriving after some history was present', () => {
    const historicalLog = makeLog({ id: 'old-1', createdAt: pastIso() });
    const newLog = makeLog({ id: 'new-1', message: 'just sent' });
    const { result, rerender } = renderHook(
      ({ logs }) => useLatestChatMessage(logs),
      { initialProps: { logs: [] as ChatLogEntry[] } },
    );
    rerender({ logs: [historicalLog] });
    expect(result.current.latestMessage).toBeNull();
    rerender({ logs: [historicalLog, newLog] });
    expect(result.current.latestMessage).toMatchObject({
      id: 'new-1',
      message: 'just sent',
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
