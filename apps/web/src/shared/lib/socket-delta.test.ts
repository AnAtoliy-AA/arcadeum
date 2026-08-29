import { describe, it, expect, vi } from 'vitest';
import { SocketDeltaReconciler, StateDeltaPacket } from './socket-delta';

describe('SocketDeltaReconciler', () => {
  it('handles initial full snapshot correctly', () => {
    const reconciler = new SocketDeltaReconciler();
    const packet: StateDeltaPacket<{ count: number; name: string }> = {
      version: 1,
      sequenceId: 1,
      isFullSnapshot: true,
      targetChecksum: SocketDeltaReconciler.calculateChecksum({
        count: 0,
        name: 'arcade',
      }),
      diff: {},
      snapshot: { count: 0, name: 'arcade' },
    };

    const state = reconciler.processPacket(packet);
    expect(state).toEqual({ count: 0, name: 'arcade' });
    expect(reconciler.getLastSequenceId()).toBe(1);
  });

  it('applies sequential incremental diffs', () => {
    const reconciler = new SocketDeltaReconciler();
    const snap: StateDeltaPacket<{ count: number; score: number }> = {
      version: 1,
      sequenceId: 1,
      isFullSnapshot: true,
      targetChecksum: SocketDeltaReconciler.calculateChecksum({
        count: 1,
        score: 100,
      }),
      diff: {},
      snapshot: { count: 1, score: 100 },
    };
    reconciler.processPacket(snap);

    const nextState = { count: 2, score: 100 };
    const diffPacket: StateDeltaPacket<{ count: number; score: number }> = {
      version: 1,
      sequenceId: 2,
      isFullSnapshot: false,
      baseChecksum: SocketDeltaReconciler.calculateChecksum({
        count: 1,
        score: 100,
      }),
      targetChecksum: SocketDeltaReconciler.calculateChecksum(nextState),
      diff: { count: 2 },
    };

    const result = reconciler.processPacket(diffPacket);
    expect(result).toEqual({ count: 2, score: 100 });
    expect(reconciler.getLastSequenceId()).toBe(2);
  });

  it('triggers onFullResyncRequired when sequence is skipped', () => {
    const onResync = vi.fn();
    const reconciler = new SocketDeltaReconciler({
      onFullResyncRequired: onResync,
    });
    const snap: StateDeltaPacket<{ count: number }> = {
      version: 1,
      sequenceId: 1,
      isFullSnapshot: true,
      targetChecksum: SocketDeltaReconciler.calculateChecksum({ count: 1 }),
      diff: {},
      snapshot: { count: 1 },
    };
    reconciler.processPacket(snap);

    const skippedPacket: StateDeltaPacket<{ count: number }> = {
      version: 1,
      sequenceId: 5,
      isFullSnapshot: false,
      baseChecksum: SocketDeltaReconciler.calculateChecksum({ count: 1 }),
      targetChecksum: SocketDeltaReconciler.calculateChecksum({ count: 5 }),
      diff: { count: 5 },
    };

    reconciler.processPacket(skippedPacket);
    expect(onResync).toHaveBeenCalledTimes(1);
  });

  it('resets state correctly', () => {
    const reconciler = new SocketDeltaReconciler({
      initialState: { count: 10 },
    });
    expect(reconciler.getState()).toEqual({ count: 10 });
    reconciler.reset();
    expect(reconciler.getState()).toBeNull();
    expect(reconciler.getLastSequenceId()).toBe(0);
  });
});
