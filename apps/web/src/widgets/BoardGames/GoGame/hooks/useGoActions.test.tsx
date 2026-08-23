import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/socket', () => ({
  gameSocket: { emit: vi.fn() },
}));

import { gameSocket } from '@/shared/lib/socket';
import { useGoActions } from './useGoActions';
import { renderHook } from '@testing-library/react';

const emitMock = vi.mocked(gameSocket.emit);

describe('useGoActions', () => {
  beforeEach(() => {
    emitMock.mockClear();
  });

  it('emits go.session.place_stone with row/col', () => {
    const { result } = renderHook(() =>
      useGoActions({ roomId: 'room-1', userId: 'user-1' }),
    );
    result.current.placeStone(4, 5);
    expect(emitMock).toHaveBeenCalledWith('go.session.place_stone', {
      roomId: 'room-1',
      userId: 'user-1',
      row: 4,
      col: 5,
    });
  });

  it('emits go.session.pass', () => {
    const { result } = renderHook(() =>
      useGoActions({ roomId: 'room-1', userId: 'user-1' }),
    );
    result.current.passTurn();
    expect(emitMock).toHaveBeenCalledWith('go.session.pass', {
      roomId: 'room-1',
      userId: 'user-1',
    });
  });

  it('emits go.session.start with bot options', () => {
    const { result } = renderHook(() =>
      useGoActions({ roomId: 'r', userId: 'u' }),
    );
    result.current.startSession({ withBots: true, botCount: 1 });
    expect(emitMock).toHaveBeenCalledWith('go.session.start', {
      roomId: 'r',
      userId: 'u',
      withBots: true,
      botCount: 1,
    });
  });

  it('does not emit when user is null', () => {
    const { result } = renderHook(() =>
      useGoActions({ roomId: 'r', userId: null }),
    );
    result.current.placeStone(0, 0);
    result.current.passTurn();
    expect(emitMock).not.toHaveBeenCalled();
  });
});
