import { describe, it, expect, beforeEach } from 'vitest';
import { useMatchmakingStore } from './MatchmakingQueue';

describe('useMatchmakingStore', () => {
  beforeEach(() => {
    useMatchmakingStore.setState({
      isQueued: false,
      isMinimized: false,
      gameId: null,
      variant: null,
      ranked: null,
      startTime: null,
    });
  });

  it('starts the queue with game and variant', () => {
    useMatchmakingStore.getState().startQueue('sea_battle_v1', 'classic');

    const state = useMatchmakingStore.getState();
    expect(state.isQueued).toBe(true);
    expect(state.isMinimized).toBe(false);
    expect(state.gameId).toBe('sea_battle_v1');
    expect(state.variant).toBe('classic');
    expect(state.startTime).toBeTypeOf('number');
  });

  it('stops the queue and clears all fields', () => {
    const store = useMatchmakingStore.getState();
    store.startQueue('sea_battle_v1');
    store.stopQueue();

    const state = useMatchmakingStore.getState();
    expect(state.isQueued).toBe(false);
    expect(state.isMinimized).toBe(false);
    expect(state.gameId).toBeNull();
    expect(state.variant).toBeNull();
    expect(state.ranked).toBeNull();
    expect(state.startTime).toBeNull();
  });

  it('toggles minimization state', () => {
    const store = useMatchmakingStore.getState();
    store.startQueue('sea_battle_v1');
    expect(useMatchmakingStore.getState().isMinimized).toBe(false);

    store.setMinimized(true);
    expect(useMatchmakingStore.getState().isMinimized).toBe(true);

    store.setMinimized(false);
    expect(useMatchmakingStore.getState().isMinimized).toBe(false);
  });

  it('resets state when re-queuing', () => {
    const store = useMatchmakingStore.getState();
    store.startQueue('sea_battle_v1');
    store.startQueue('sea_battle_v1', 'blitz');

    const state = useMatchmakingStore.getState();
    expect(state.variant).toBe('blitz');
    expect(state.startTime).toBeTypeOf('number');
  });
});
