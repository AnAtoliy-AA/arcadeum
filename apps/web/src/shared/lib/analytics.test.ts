import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  track,
  setAnalyticsDispatcher,
  type AnalyticsDispatcher,
} from './analytics';

describe('track (analytics dispatch layer)', () => {
  beforeEach(() => {
    setAnalyticsDispatcher(null);
    // Drain anything buffered by earlier tests into a throwaway sink so each
    // test starts with an empty queue (the queue lives on the module).
    setAnalyticsDispatcher(vi.fn());
    setAnalyticsDispatcher(null);
    vi.restoreAllMocks();
  });

  it('does not throw without a provider registered', () => {
    expect(() => track('shop.purchase.click')).not.toThrow();
  });

  it('is a no-op on the server', () => {
    vi.stubGlobal('window', undefined);
    expect(() =>
      track('solo.game.started', { gameId: 'solitaire_v1' }),
    ).not.toThrow();
    vi.unstubAllGlobals();
  });

  it('flushes buffered events to the provider when it registers later', () => {
    track('invite.shared', { channel: 'copy' });
    track('social.room.created', { gameId: 'chess_v1' });

    const dispatcher = vi.fn() as AnalyticsDispatcher;
    setAnalyticsDispatcher(dispatcher);

    expect(dispatcher).toHaveBeenCalledTimes(2);
    expect(dispatcher).toHaveBeenNthCalledWith(1, 'invite.shared', {
      channel: 'copy',
    });
    expect(dispatcher).toHaveBeenNthCalledWith(2, 'social.room.created', {
      gameId: 'chess_v1',
    });
  });

  it('delivers events directly once a provider is registered', () => {
    const dispatcher = vi.fn() as AnalyticsDispatcher;
    setAnalyticsDispatcher(dispatcher);

    track('solo.game.completed', { gameId: 'game_2048_v1', result: 'won' });
    expect(dispatcher).toHaveBeenCalledTimes(1);
    expect(dispatcher).toHaveBeenCalledWith('solo.game.completed', {
      gameId: 'game_2048_v1',
      result: 'won',
    });
  });

  it('caps the buffer so a missing provider cannot grow memory unbounded', () => {
    const dispatcher = vi.fn() as AnalyticsDispatcher;
    for (let i = 0; i < 500; i++) {
      track('stress.event', { i });
    }
    setAnalyticsDispatcher(dispatcher);
    expect(dispatcher).toHaveBeenCalledTimes(100);
  });

  it('unregistering routes new events back into the buffer', () => {
    const dispatcher = vi.fn() as AnalyticsDispatcher;
    setAnalyticsDispatcher(dispatcher);
    track('first.event');

    setAnalyticsDispatcher(null);
    track('second.event');
    expect(dispatcher).toHaveBeenCalledTimes(1);

    const nextDispatcher = vi.fn() as AnalyticsDispatcher;
    setAnalyticsDispatcher(nextDispatcher);
    expect(nextDispatcher).toHaveBeenCalledTimes(1);
    expect(nextDispatcher).toHaveBeenCalledWith('second.event', {});
  });

  it('stays quiet outside development mode', () => {
    const debugSpy = vi
      .spyOn(console, 'debug')
      .mockImplementation(() => undefined);
    track('quiet.event');
    expect(debugSpy).not.toHaveBeenCalled();
  });
});
