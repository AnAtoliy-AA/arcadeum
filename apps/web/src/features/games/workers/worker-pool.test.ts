import { describe, it, expect, vi } from 'vitest';
import { WorkerPool } from './worker-pool';

describe('WorkerPool', () => {
  it('initializes pool with requested size', () => {
    const pool = new WorkerPool({ poolSize: 3 });
    expect(pool.getPoolSize()).toBe(3);
  });

  it('delegates tasks using fallback across pool workers', async () => {
    const fallback = vi
      .fn()
      .mockImplementation((payload: { n: number }) => payload.n + 10);
    const pool = new WorkerPool<{ n: number }, number>({
      poolSize: 2,
      fallback,
    });

    const res1 = await pool.execute('ADD', { n: 1 });
    const res2 = await pool.execute('ADD', { n: 2 });

    expect(res1).toBe(11);
    expect(res2).toBe(12);
    expect(fallback).toHaveBeenCalledTimes(2);
  });

  it('handles cancellation and termination cleanly', () => {
    const pool = new WorkerPool({ poolSize: 2 });
    pool.cancelAll();
    pool.terminate();
    expect(pool.getPoolSize()).toBe(0);
  });
});
