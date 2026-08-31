import { describe, it, expect, beforeEach } from 'vitest';
import {
  useMatchmakingStore,
  type MatchmakingStatus,
} from './MatchmakingQueue';

describe('useMatchmakingStore', () => {
  beforeEach(() => {
    useMatchmakingStore.setState({
      isQueued: false,
      isMinimized: false,
      gameId: null,
      variant: null,
      ranked: null,
      startTime: null,
      queueSize: null,
      position: null,
      playersAhead: null,
      estimatedWaitSeconds: null,
      activeQueues: {},
    });
  });

  it('starts the queue with game and variant and initializes queue state', () => {
    useMatchmakingStore.getState().startQueue('sea_battle_v1', 'classic');

    const state = useMatchmakingStore.getState();
    expect(state.isQueued).toBe(true);
    expect(state.isMinimized).toBe(false);
    expect(state.gameId).toBe('sea_battle_v1');
    expect(state.variant).toBe('classic');
    expect(state.queueSize).toBe(1);
    expect(state.position).toBe(1);
    expect(state.playersAhead).toBe(0);
    expect(state.estimatedWaitSeconds).toBeNull();
  });

  it('stops the queue and clears all fields', () => {
    const store = useMatchmakingStore.getState();
    store.startQueue('sea_battle_v1');
    store.setStatus({
      gameId: 'sea_battle_v1',
      queueSize: 1,
      position: 1,
      playersAhead: 0,
      estimatedWaitSeconds: 30,
    } satisfies MatchmakingStatus);
    store.stopQueue();

    const state = useMatchmakingStore.getState();
    expect(state.isQueued).toBe(false);
    expect(state.isMinimized).toBe(false);
    expect(state.gameId).toBeNull();
    expect(state.queueSize).toBeNull();
    expect(state.position).toBeNull();
    expect(state.playersAhead).toBeNull();
    expect(state.estimatedWaitSeconds).toBeNull();
  });

  it('applies matchmaking status updates and calculates playersAhead', () => {
    const store = useMatchmakingStore.getState();
    store.startQueue('sea_battle_v1');
    store.setStatus({
      gameId: 'sea_battle_v1',
      queueSize: 3,
      position: 2,
      playersAhead: 1,
      estimatedWaitSeconds: 12,
      activeQueues: { chess_v1: 2 },
    } satisfies MatchmakingStatus);

    const state = useMatchmakingStore.getState();
    expect(state.queueSize).toBe(3);
    expect(state.position).toBe(2);
    expect(state.playersAhead).toBe(1);
    expect(state.estimatedWaitSeconds).toBe(12);
    expect(state.activeQueues).toEqual({ chess_v1: 2 });
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

  it('resets status when re-queuing', () => {
    const store = useMatchmakingStore.getState();
    store.startQueue('sea_battle_v1');
    store.setStatus({
      gameId: 'sea_battle_v1',
      queueSize: 2,
      position: 1,
      playersAhead: 0,
      estimatedWaitSeconds: 12,
    } satisfies MatchmakingStatus);
    store.startQueue('sea_battle_v1', 'blitz');

    const state = useMatchmakingStore.getState();
    expect(state.variant).toBe('blitz');
    expect(state.queueSize).toBe(1);
    expect(state.position).toBe(1);
    expect(state.playersAhead).toBe(0);
  });
});
