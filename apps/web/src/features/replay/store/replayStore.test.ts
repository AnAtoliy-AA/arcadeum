import { describe, it, expect, beforeEach } from 'vitest';
import { useReplayStore, getActionAtStep } from './replayStore';
import type { ReplayDetail } from '../lib/types';

function createMockReplay(overrides: Partial<ReplayDetail> = {}): ReplayDetail {
  return {
    replayId: 'test-replay-id',
    roomId: 'room-1',
    sessionId: 'session-1',
    gameId: 'chess_v1',
    playerIds: ['user-1', 'user-2'],
    players: [
      { id: 'user-1', displayName: 'Alice' },
      { id: 'user-2', displayName: 'Bob' },
    ],
    initialState: { board: [] },
    actions: [
      {
        action: 'move',
        userId: 'user-1',
        payload: { from: 'e2', to: 'e4' },
        timestamp: '2026-01-01T00:01:00Z',
      },
      {
        action: 'move',
        userId: 'user-2',
        payload: { from: 'e7', to: 'e5' },
        timestamp: '2026-01-01T00:02:00Z',
      },
      {
        action: 'move',
        userId: 'user-1',
        payload: { from: 'd2', to: 'd4' },
        timestamp: '2026-01-01T00:03:00Z',
      },
    ],
    result: { winnerIds: ['user-1'], isDraw: false },
    totalMoves: 3,
    durationMs: 180000,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('useReplayStore', () => {
  beforeEach(() => {
    useReplayStore.getState().reset();
  });

  describe('loadReplay', () => {
    it('should set replay and reset playback state', () => {
      const replay = createMockReplay();
      useReplayStore.getState().loadReplay(replay);

      const state = useReplayStore.getState();
      expect(state.replay).toEqual(replay);
      expect(state.currentStep).toBe(0);
      expect(state.isPlaying).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('stepForward', () => {
    it('should advance currentStep by 1', () => {
      useReplayStore.getState().loadReplay(createMockReplay());
      useReplayStore.getState().stepForward();

      expect(useReplayStore.getState().currentStep).toBe(1);
    });

    it('should not advance past total actions', () => {
      useReplayStore.getState().loadReplay(createMockReplay());

      useReplayStore.getState().goToStep(3);
      useReplayStore.getState().stepForward();

      expect(useReplayStore.getState().currentStep).toBe(3);
    });

    it('should pause playback when stepping', () => {
      useReplayStore.getState().loadReplay(createMockReplay());
      useReplayStore.setState({ isPlaying: true });
      useReplayStore.getState().stepForward();

      expect(useReplayStore.getState().isPlaying).toBe(false);
    });
  });

  describe('stepBackward', () => {
    it('should go back by 1', () => {
      useReplayStore.getState().loadReplay(createMockReplay());
      useReplayStore.getState().goToStep(2);
      useReplayStore.getState().stepBackward();

      expect(useReplayStore.getState().currentStep).toBe(1);
    });

    it('should not go below 0', () => {
      useReplayStore.getState().loadReplay(createMockReplay());
      useReplayStore.getState().stepBackward();

      expect(useReplayStore.getState().currentStep).toBe(0);
    });
  });

  describe('goToStep', () => {
    it('should set currentStep to the specified value', () => {
      useReplayStore.getState().loadReplay(createMockReplay());
      useReplayStore.getState().goToStep(2);

      expect(useReplayStore.getState().currentStep).toBe(2);
    });

    it('should clamp to valid range', () => {
      useReplayStore.getState().loadReplay(createMockReplay());
      useReplayStore.getState().goToStep(100);

      expect(useReplayStore.getState().currentStep).toBe(3);
    });

    it('should clamp negative values to 0', () => {
      useReplayStore.getState().loadReplay(createMockReplay());
      useReplayStore.getState().goToStep(-5);

      expect(useReplayStore.getState().currentStep).toBe(0);
    });
  });

  describe('setSpeed', () => {
    it('should update playback speed', () => {
      useReplayStore.getState().loadReplay(createMockReplay());
      useReplayStore.getState().setSpeed(4);

      expect(useReplayStore.getState().playbackSpeed).toBe(4);
    });
  });

  describe('reset', () => {
    it('should clear all state', () => {
      useReplayStore.getState().loadReplay(createMockReplay());
      useReplayStore.getState().goToStep(2);
      useReplayStore.getState().reset();

      const state = useReplayStore.getState();
      expect(state.replay).toBeNull();
      expect(state.currentStep).toBe(0);
      expect(state.isPlaying).toBe(false);
      expect(state.playbackSpeed).toBe(1);
    });
  });
});

describe('getActionAtStep', () => {
  const replay = createMockReplay();

  it('should return null at step 0 (initial state)', () => {
    expect(getActionAtStep(replay, 0)).toBeNull();
  });

  it('should return the action at step 1', () => {
    const action = getActionAtStep(replay, 1);
    expect(action?.action).toBe('move');
    expect(action?.userId).toBe('user-1');
  });

  it('should return the last action', () => {
    const action = getActionAtStep(replay, 3);
    expect(action?.userId).toBe('user-1');
    expect(action?.payload).toEqual({ from: 'd2', to: 'd4' });
  });

  it('should return null for out-of-range step', () => {
    expect(getActionAtStep(replay, 10)).toBeNull();
  });
});
