import { describe, it, expect, beforeEach } from 'vitest';
import {
  useMatchmakingStore,
  type MatchmakingStatus,
} from './MatchmakingQueue';

describe('useMatchmakingStore', () => {
  beforeEach(() => {
    useMatchmakingStore.setState({
      isQueued: false,
      gameId: null,
      variant: null,
      startTime: null,
      queueSize: null,
      position: null,
      estimatedWaitSeconds: null,
    });
  });

  it('starts the queue with game and variant and resets status', () => {
    useMatchmakingStore.getState().startQueue('sea_battle_v1', 'classic');

    const state = useMatchmakingStore.getState();
    expect(state.isQueued).toBe(true);
    expect(state.gameId).toBe('sea_battle_v1');
    expect(state.variant).toBe('classic');
    expect(state.queueSize).toBeNull();
    expect(state.position).toBeNull();
    expect(state.estimatedWaitSeconds).toBeNull();
  });

  it('stops the queue and clears all fields', () => {
    const store = useMatchmakingStore.getState();
    store.startQueue('sea_battle_v1');
    store.setStatus({
      gameId: 'sea_battle_v1',
      queueSize: 1,
      position: 1,
      estimatedWaitSeconds: 30,
    } satisfies MatchmakingStatus);
    store.stopQueue();

    const state = useMatchmakingStore.getState();
    expect(state.isQueued).toBe(false);
    expect(state.gameId).toBeNull();
    expect(state.queueSize).toBeNull();
    expect(state.position).toBeNull();
    expect(state.estimatedWaitSeconds).toBeNull();
  });

  it('applies matchmaking status updates', () => {
    const store = useMatchmakingStore.getState();
    store.startQueue('sea_battle_v1');
    store.setStatus({
      gameId: 'sea_battle_v1',
      queueSize: 2,
      position: 1,
      estimatedWaitSeconds: 12,
    } satisfies MatchmakingStatus);

    const state = useMatchmakingStore.getState();
    expect(state.queueSize).toBe(2);
    expect(state.position).toBe(1);
    expect(state.estimatedWaitSeconds).toBe(12);
  });

  it('resets status when re-queuing', () => {
    const store = useMatchmakingStore.getState();
    store.startQueue('sea_battle_v1');
    store.setStatus({
      gameId: 'sea_battle_v1',
      queueSize: 2,
      position: 1,
      estimatedWaitSeconds: 12,
    } satisfies MatchmakingStatus);
    store.startQueue('sea_battle_v1', 'blitz');

    const state = useMatchmakingStore.getState();
    expect(state.variant).toBe('blitz');
    expect(state.queueSize).toBeNull();
    expect(state.position).toBeNull();
  });
});
