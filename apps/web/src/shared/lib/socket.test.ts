import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import type { Socket } from 'socket.io-client';
import * as encryption from './socket-encryption';
import { renderHook, waitFor } from '@testing-library/react';

const { mockSocket } = vi.hoisted(() => {
  return {
    mockSocket: {
      connected: false,
      connect: vi.fn().mockImplementation(function (this: {
        connected: boolean;
      }) {
        this.connected = true;
        return this;
      }),
      disconnect: vi.fn().mockImplementation(function (this: {
        connected: boolean;
      }) {
        this.connected = false;
        return this;
      }),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      auth: {},
    },
  };
});

vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(() => mockSocket),
  };
});

// Now import the module being tested
import {
  connectSockets,
  connectSocketsAnonymous,
  disconnectSockets,
  emitEncrypted,
  useSocket,
  useChatSocket,
} from './socket';

// Capture initial listeners
const initialOnCalls = [...(mockSocket.on as unknown as Mock).mock.calls];

describe('socket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
    mockSocket.auth = {};
    // Do not clear mockSocket.on because we need the listeners registered at import time
  });

  it('connects sockets with token', () => {
    connectSockets('test-token');
    expect(mockSocket.connect).toHaveBeenCalled();
    expect(mockSocket.auth).toEqual({ token: 'test-token' });
  });

  it('disconnects sockets', () => {
    mockSocket.connected = true;
    disconnectSockets();
    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(mockSocket.auth).toEqual({});
  });

  it('emits encrypted messages', async () => {
    vi.spyOn(encryption, 'maybeEncrypt').mockResolvedValue(
      'encrypted-data' as unknown as Uint8Array,
    );
    await emitEncrypted(mockSocket as unknown as Socket, 'test-event', {
      foo: 'bar',
    });
    expect(encryption.maybeEncrypt).toHaveBeenCalledWith({ foo: 'bar' });
    expect(mockSocket.emit).toHaveBeenCalledWith(
      'test-event',
      'encrypted-data',
    );
  });

  it('handles encryption key from server', async () => {
    const keyListener = initialOnCalls.find(
      (call: unknown[]) => call[0] === 'socket.encryption_key',
    )?.[1];

    expect(keyListener).toBeDefined();

    const setKeySpy = vi
      .spyOn(encryption, 'setEncryptionKey')
      .mockResolvedValue(true);

    await keyListener({ key: 'new-server-key' });

    expect(setKeySpy).toHaveBeenCalledWith('new-server-key');
  });

  it('connects sockets anonymously', () => {
    connectSocketsAnonymous();
    expect(mockSocket.connect).toHaveBeenCalled();
    expect(mockSocket.auth).toEqual({});
  });

  it('handles invalid encryption key from server', async () => {
    const keyListener = initialOnCalls.find(
      (call: unknown[]) => call[0] === 'socket.encryption_key',
    )?.[1];
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await keyListener(null);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Invalid encryption key'),
    );

    consoleSpy.mockRestore();
  });

  it('connects sockets anonymously after auth', () => {
    connectSockets('token');
    expect(mockSocket.auth).toEqual({ token: 'token' });

    // Reset mocks to track new calls
    vi.clearAllMocks();

    connectSocketsAnonymous();
    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(mockSocket.connect).toHaveBeenCalled();
    expect(mockSocket.auth).toEqual({});
  });

  it('disconnects chat socket when connected', () => {
    mockSocket.connected = true;
    // Override strict behavior for this test to allow both checks to pass on shared mock
    (mockSocket.disconnect as unknown as Mock).mockImplementation(
      function (this: { connected: boolean }) {
        return this;
      },
    );

    disconnectSockets();

    expect(mockSocket.disconnect).toHaveBeenCalledTimes(2);

    // Restore default behavior
    (mockSocket.disconnect as unknown as Mock).mockImplementation(
      function (this: { connected: boolean }) {
        this.connected = false;
        return this;
      },
    );
  });

  it('ignores invalid payload structures', () => {
    // Trigger a listener that processes payload
    // We need to simulate a message listener being registered
    renderHook(() => useSocket('test_event', vi.fn()));

    // Find the listener registered by useSocket
    // mockSocket.on was called with 'test_event'
    const call = (mockSocket.on as unknown as Mock).mock.calls.find(
      (c: unknown[]) => c[0] === 'test_event',
    );
    expect(call).toBeDefined();
    const listener = call![1];

    // Call with invalid payload (not object, or missing iv/data)
    listener('invalid string');
    listener({ data: 'missing iv' });
    listener({ iv: 'missing data' });

    // Expect no errors, basically ensuring safe handling
    expect(true).toBe(true);
  });

  it('handles disconnect and resets encryption', () => {
    const disconnectListener = initialOnCalls.find(
      (call: unknown[]) => call[0] === 'disconnect',
    )?.[1];

    expect(disconnectListener).toBeDefined();

    const resetSpy = vi.spyOn(encryption, 'resetEncryptionKey');
    disconnectListener();

    expect(resetSpy).toHaveBeenCalled();
  });
});

describe('socket hooks', () => {
  it('useSocket sets up and tears down listener', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useSocket('test-event', handler));

    expect(mockSocket.on).toHaveBeenCalledWith(
      'test-event',
      expect.any(Function),
    );

    unmount();
    expect(mockSocket.off).toHaveBeenCalledWith(
      'test-event',
      expect.any(Function),
    );
  });

  it('useSocket handler decrypts messages if enabled', async () => {
    const handler = vi.fn();
    renderHook(() => useSocket('test-event', handler));

    // Find the most recent 'test-event' listener
    const listener = (mockSocket.on as unknown as Mock).mock.calls.findLast(
      (c: unknown[]) => c[0] === 'test-event',
    )?.[1];

    expect(listener).toBeDefined();

    vi.spyOn(encryption, 'isSocketEncryptionEnabled').mockReturnValue(true);
    vi.spyOn(encryption, 'hasEncryptionKey').mockReturnValue(true);
    vi.spyOn(encryption, 'maybeDecrypt').mockResolvedValue({
      decoded: 'data',
    });

    await listener('encrypted-payload');

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith({ decoded: 'data' });
    });
  });

  it('useChatSocket sets up and tears down listener', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useChatSocket('chat-event', handler));

    expect(mockSocket.on).toHaveBeenCalledWith(
      'chat-event',
      expect.any(Function),
    );

    unmount();
    expect(mockSocket.off).toHaveBeenCalledWith(
      'chat-event',
      expect.any(Function),
    );
  });

  it('useChatSocket handler decrypts messages if enabled', async () => {
    const handler = vi.fn();
    renderHook(() => useChatSocket('chat-event', handler));

    // Find the most recent 'chat-event' listener
    const listener = (mockSocket.on as unknown as Mock).mock.calls.findLast(
      (c: unknown[]) => c[0] === 'chat-event',
    )?.[1];

    expect(listener).toBeDefined();

    vi.spyOn(encryption, 'isSocketEncryptionEnabled').mockReturnValue(true);
    vi.spyOn(encryption, 'hasEncryptionKey').mockReturnValue(true);
    vi.spyOn(encryption, 'maybeDecrypt').mockResolvedValue({
      chat: 'msg',
    });

    await listener('encrypted-chat-payload');

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith({ chat: 'msg' });
    });
  });

  it('useChatSocket handler passes through unencrypted messages', async () => {
    const handler = vi.fn();
    renderHook(() => useChatSocket('chat-event', handler));

    const listener = (mockSocket.on as unknown as Mock).mock.calls.findLast(
      (c: unknown[]) => c[0] === 'chat-event',
    )?.[1];

    expect(listener).toBeDefined();

    vi.spyOn(encryption, 'isSocketEncryptionEnabled').mockReturnValue(false);

    await listener('plain-message');

    await waitFor(() => {
      expect(handler).toHaveBeenCalledWith('plain-message');
    });
  });
});
