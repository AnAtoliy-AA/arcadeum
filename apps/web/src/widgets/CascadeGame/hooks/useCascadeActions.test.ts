import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCascadeActions } from './useCascadeActions';

const emit = vi.fn();

vi.mock('@/shared/lib/socket', () => ({
  gameSocket: {
    emit: (...args: unknown[]) => emit(...args),
  },
}));

describe('useCascadeActions', () => {
  beforeEach(() => {
    emit.mockReset();
  });

  it('emits cascade.session.start with optional bot config', () => {
    const { result } = renderHook(() =>
      useCascadeActions({ roomId: 'r', userId: 'me' }),
    );
    result.current.startSession({ withBots: true, botCount: 3 });
    expect(emit).toHaveBeenCalledWith('cascade.session.start', {
      roomId: 'r',
      userId: 'me',
      withBots: true,
      botCount: 3,
    });
  });

  it('emits cascade.session.play_card with cardId + optional chosenColor', () => {
    const { result } = renderHook(() =>
      useCascadeActions({ roomId: 'r', userId: 'me' }),
    );
    result.current.playCard('card-1');
    expect(emit).toHaveBeenLastCalledWith('cascade.session.play_card', {
      roomId: 'r',
      userId: 'me',
      cardId: 'card-1',
      chosenColor: undefined,
    });

    result.current.playCard('wild-1', 'G');
    expect(emit).toHaveBeenLastCalledWith('cascade.session.play_card', {
      roomId: 'r',
      userId: 'me',
      cardId: 'wild-1',
      chosenColor: 'G',
    });
  });

  it('emits cascade.session.draw', () => {
    const { result } = renderHook(() =>
      useCascadeActions({ roomId: 'r', userId: 'me' }),
    );
    result.current.draw();
    expect(emit).toHaveBeenCalledWith('cascade.session.draw', {
      roomId: 'r',
      userId: 'me',
    });
  });

  it('emits cascade.session.name_color with the chosen color', () => {
    const { result } = renderHook(() =>
      useCascadeActions({ roomId: 'r', userId: 'me' }),
    );
    result.current.nameColor('B');
    expect(emit).toHaveBeenCalledWith('cascade.session.name_color', {
      roomId: 'r',
      userId: 'me',
      color: 'B',
    });
  });

  it('emits cascade.session.call_cascade', () => {
    const { result } = renderHook(() =>
      useCascadeActions({ roomId: 'r', userId: 'me' }),
    );
    result.current.callCascade();
    expect(emit).toHaveBeenCalledWith('cascade.session.call_cascade', {
      roomId: 'r',
      userId: 'me',
    });
  });

  it('emits cascade.session.forfeit', () => {
    const { result } = renderHook(() =>
      useCascadeActions({ roomId: 'r', userId: 'me' }),
    );
    result.current.forfeit();
    expect(emit).toHaveBeenCalledWith('cascade.session.forfeit', {
      roomId: 'r',
      userId: 'me',
    });
  });

  it('does not emit when userId is null', () => {
    const { result } = renderHook(() =>
      useCascadeActions({ roomId: 'r', userId: null }),
    );
    result.current.startSession();
    result.current.playCard('x');
    result.current.draw();
    result.current.nameColor('R');
    result.current.forfeit();
    expect(emit).not.toHaveBeenCalled();
  });

  it('calls onActionStart for each action', () => {
    const onActionStart = vi.fn();
    const { result } = renderHook(() =>
      useCascadeActions({ roomId: 'r', userId: 'me', onActionStart }),
    );
    result.current.playCard('c');
    result.current.draw();
    result.current.forfeit();
    expect(onActionStart).toHaveBeenCalledWith('play_card');
    expect(onActionStart).toHaveBeenCalledWith('draw');
    expect(onActionStart).toHaveBeenCalledWith('forfeit');
  });
});
