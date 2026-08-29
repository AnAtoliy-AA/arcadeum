import { describe, it, expect, vi } from 'vitest';
import { WorkerBridge } from './worker-bridge';

describe('WorkerBridge', () => {
  it('uses fallback handler when worker environment is absent', async () => {
    const fallback = vi
      .fn()
      .mockImplementation((p: { val: number }) => ({ result: p.val * 2 }));
    const bridge = new WorkerBridge<{ val: number }, { result: number }>(
      undefined,
      fallback,
    );

    expect(bridge.hasActiveWorker()).toBe(false);

    const res = await bridge.execute('CALC', { val: 5 });
    expect(res).toEqual({ result: 10 });
    expect(fallback).toHaveBeenCalledWith({ val: 5 });
  });

  it('rejects when cancellationToken is cancelled before execution', async () => {
    const fallback = vi.fn();
    const bridge = new WorkerBridge(undefined, fallback);

    await expect(
      bridge.execute('TASK', {}, { isCancelled: true }),
    ).rejects.toThrow('Task cancelled before execution');

    expect(fallback).not.toHaveBeenCalled();
  });

  it('handles cancellation and cleanup properly', () => {
    const bridge = new WorkerBridge();
    bridge.cancelAll();
    bridge.terminate();
    expect(bridge.hasActiveWorker()).toBe(false);
  });
});
