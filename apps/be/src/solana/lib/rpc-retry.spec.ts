import type { Connection } from '@solana/web3.js';
import {
  ArcRpcError,
  callWithRpcFallback,
  isRetryableRpcError,
} from './rpc-retry';

const conn = (name: string) => ({ name }) as unknown as Connection;
const noSleep = () => Promise.resolve();

describe('callWithRpcFallback', () => {
  it('retries a 429 with exponential backoff then succeeds', async () => {
    const sleep = jest.fn((_ms: number) => Promise.resolve());
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('429 Too Many Requests'))
      .mockRejectedValueOnce(new Error('503 Service Unavailable'))
      .mockResolvedValue('ok');

    const out = await callWithRpcFallback(
      [() => Promise.resolve(conn('a'))],
      fn,
      { sleep, baseDelayMs: 100 },
    );

    expect(out).toBe('ok');
    expect(sleep.mock.calls.map((c) => c[0])).toEqual([100, 200]);
  });

  it('falls through to the fallback RPC after the primary keeps failing', async () => {
    const fn = jest.fn((c: Connection) =>
      (c as unknown as { name: string }).name === 'primary'
        ? Promise.reject(new Error('429 rate limit'))
        : Promise.resolve('from-fallback'),
    );

    const out = await callWithRpcFallback(
      [
        () => Promise.resolve(conn('primary')),
        () => Promise.resolve(conn('fallback')),
      ],
      fn,
      { sleep: noSleep, attemptsPerUrl: 2 },
    );

    expect(out).toBe('from-fallback');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws a clear ArcRpcError when every endpoint is exhausted', async () => {
    await expect(
      callWithRpcFallback(
        [() => Promise.resolve(conn('a')), () => Promise.resolve(conn('b'))],
        () => Promise.reject(new Error('fetch failed')),
        { sleep: noSleep, attemptsPerUrl: 2 },
      ),
    ).rejects.toThrow(/unavailable after 4 attempts: fetch failed/);
  });

  it('does not retry a non-retryable error', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('invalid signature'));
    await expect(
      callWithRpcFallback([() => Promise.resolve(conn('a'))], fn, {
        sleep: noSleep,
      }),
    ).rejects.toThrow('invalid signature');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('times out a hung call and treats it as retryable', async () => {
    const fn = jest
      .fn()
      .mockImplementationOnce(() => new Promise(() => undefined))
      .mockResolvedValue('after-timeout');
    const out = await callWithRpcFallback(
      [() => Promise.resolve(conn('a'))],
      fn,
      { sleep: noSleep, timeoutMs: 20 },
    );
    expect(out).toBe('after-timeout');
  });

  it('classifies errors', () => {
    expect(isRetryableRpcError(new Error('ETIMEDOUT'))).toBe(true);
    expect(isRetryableRpcError(new Error('bad request'))).toBe(false);
    expect(new ArcRpcError('x', 3).attempts).toBe(3);
  });
});
