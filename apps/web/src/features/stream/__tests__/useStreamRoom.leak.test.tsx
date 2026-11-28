import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

type Listener = (...args: unknown[]) => void;

/**
 * Minimal socket double that counts listeners, so we can prove that cycling
 * through many rooms never accumulates handlers (the 24/7 leak risk).
 */
const fake = vi.hoisted(() => {
  const listeners = new Map<string, Set<Listener>>();
  const socket = {
    connected: true,
    io: {
      _readyState: 'open',
      reconnectionAttempts: vi.fn(),
    },
    on(event: string, fn: Listener) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(fn);
      return socket;
    },
    off(event: string, fn: Listener) {
      listeners.get(event)?.delete(fn);
      return socket;
    },
    emit: vi.fn(),
  };
  return {
    socket,
    listeners,
    total: () =>
      [...listeners.values()].reduce((sum, set) => sum + set.size, 0),
    connectAnon: vi.fn(),
    disconnectAll: vi.fn(),
  };
});

vi.mock('@/shared/lib/socket', () => ({
  gameSocket: fake.socket,
  getGamesSocket: () => fake.socket,
  connectSocketsAnonymous: fake.connectAnon,
  disconnectSockets: fake.disconnectAll,
}));
vi.mock('@/shared/lib/api-client', () => ({
  getOrCreateAnonymousId: vi.fn().mockResolvedValue('anon_test'),
}));
vi.mock('@/features/games/api', () => ({
  gamesApi: {
    getRoomInfo: vi.fn().mockResolvedValue({
      room: { id: 'x', gameId: 'chess_v1', status: 'in_progress' },
      session: null,
    }),
  },
}));
vi.mock('@/features/offline/lib/offline-bus', () => ({
  offlineBusOn: () => () => {},
}));

import { useStreamRoom } from '../hooks/useStreamRoom';

function Probe({ roomId }: { roomId: string }): ReactNode {
  useStreamRoom(roomId);
  return null;
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('useStreamRoom listener hygiene', () => {
  beforeEach(() => {
    fake.listeners.clear();
    fake.connectAnon.mockClear();
    fake.disconnectAll.mockClear();
  });
  afterEach(() => vi.useRealTimers());

  it('leaves no socket listeners behind after unmount', async () => {
    const { unmount } = render(<Probe roomId="room-0" />);
    await flush();
    expect(fake.total()).toBeGreaterThan(0);
    unmount();
    expect(fake.total()).toBe(0);
    expect(fake.disconnectAll).toHaveBeenCalled();
  });

  it('does not accumulate listeners across 200 room changes', async () => {
    const { rerender, unmount } = render(<Probe roomId="room-0" />);
    await flush();
    const baseline = fake.total();
    expect(baseline).toBeGreaterThan(0);

    for (let i = 1; i <= 200; i += 1) {
      rerender(<Probe roomId={`room-${i}`} />);
      await flush();
      expect(fake.total()).toBeLessThanOrEqual(baseline);
    }
    expect(fake.total()).toBe(baseline);

    unmount();
    expect(fake.total()).toBe(0);
  });

  it('does not accumulate listeners across 100 mount/unmount cycles', async () => {
    for (let i = 0; i < 100; i += 1) {
      const { unmount } = render(<Probe roomId={`cycle-${i}`} />);
      await flush();
      unmount();
    }
    expect(fake.total()).toBe(0);
  });

  it('clears its watchdog timer on unmount', async () => {
    vi.useFakeTimers();
    const { unmount } = render(<Probe roomId="timer-room" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('re-dials the anonymous socket when it drops and keeps trying', async () => {
    vi.useFakeTimers();
    fake.socket.connected = false;
    const { unmount } = render(<Probe roomId="drop-room" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    const first = fake.connectAnon.mock.calls.length;
    expect(first).toBeGreaterThan(0);
    expect(fake.connectAnon).toHaveBeenCalledWith('anon_test');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });
    expect(fake.connectAnon.mock.calls.length).toBeGreaterThan(first);

    fake.socket.connected = true;
    const before = fake.connectAnon.mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });
    expect(fake.connectAnon.mock.calls.length).toBe(before);
    unmount();
  });

  it('lifts the socket.io reconnection attempt cap', async () => {
    const { unmount } = render(<Probe roomId="cap-room" />);
    await flush();
    expect(fake.socket.io.reconnectionAttempts).toHaveBeenCalledWith(Infinity);
    unmount();
  });
});
