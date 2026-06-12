import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGameChatSend } from './useGameChatSend';

const emit = vi.fn();

vi.mock('@/shared/lib/socket', () => ({
  gameSocket: {
    emit: (...args: unknown[]) => emit(...args),
  },
}));

describe('useGameChatSend', () => {
  beforeEach(() => {
    emit.mockReset();
  });

  it('emits games.session.history_note for a session game', () => {
    const { result } = renderHook(() =>
      useGameChatSend('room-1', 'me', 'tic_tac_toe_v1'),
    );
    result.current('gg wp', 'all');
    expect(emit).toHaveBeenCalledWith('games.session.history_note', {
      roomId: 'room-1',
      userId: 'me',
      message: 'gg wp',
      scope: 'all',
    });
  });

  it('routes Texas Hold’em to its dedicated history-note event', () => {
    const { result } = renderHook(() =>
      useGameChatSend('room-2', 'me', 'texas_holdem_v1'),
    );
    result.current('nice hand', 'players');
    expect(emit).toHaveBeenCalledWith('games.session.holdem_history_note', {
      roomId: 'room-2',
      userId: 'me',
      message: 'nice hand',
      scope: 'players',
    });
  });

  it('no-ops when there is no userId (spectator / not signed in)', () => {
    const { result } = renderHook(() => useGameChatSend('room-3', null));
    result.current('hello', 'all');
    expect(emit).not.toHaveBeenCalled();
  });
});
