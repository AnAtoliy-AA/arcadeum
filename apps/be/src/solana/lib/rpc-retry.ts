import type { Connection } from '@solana/web3.js';

export class ArcRpcError extends Error {
  constructor(
    message: string,
    readonly attempts: number,
  ) {
    super(message);
    this.name = 'ArcRpcError';
  }
}

export interface RpcRetryOptions {
  attemptsPerUrl?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

const RETRYABLE =
  /429|too many requests|rate limit|50[0-4]|fetch failed|econnreset|etimedout|enotfound|socket hang up|timed out|timeout|blockhash not found|node is behind/i;

export function isRetryableRpcError(err: unknown): boolean {
  return RETRYABLE.test(err instanceof Error ? err.message : String(err));
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`RPC timed out after ${ms}ms`)),
      ms,
    );
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Runs `fn` against each RPC target in order. Retryable failures (429, 5xx,
 * network, timeout) are retried with exponential backoff, then the next
 * target is tried. Non-retryable errors are thrown immediately.
 */
export async function callWithRpcFallback<T>(
  targets: Array<() => Promise<Connection>>,
  fn: (connection: Connection) => Promise<T>,
  opts: RpcRetryOptions = {},
): Promise<T> {
  const attemptsPerUrl = opts.attemptsPerUrl ?? 3;
  const baseDelay = opts.baseDelayMs ?? 250;
  const timeoutMs = opts.timeoutMs ?? 10_000;
  const sleep =
    opts.sleep ?? ((ms: number) => new Promise((r) => setTimeout(r, ms)));

  let attempts = 0;
  let lastError: unknown;
  for (const getConnection of targets) {
    for (let i = 0; i < attemptsPerUrl; i++) {
      attempts++;
      try {
        const connection = await getConnection();
        return await withTimeout(fn(connection), timeoutMs);
      } catch (err) {
        lastError = err;
        if (!isRetryableRpcError(err)) throw err;
        if (i < attemptsPerUrl - 1) await sleep(baseDelay * 2 ** i);
      }
    }
  }
  const reason = lastError instanceof Error ? lastError.message : 'unknown';
  throw new ArcRpcError(
    `Solana RPC unavailable after ${attempts} attempts: ${reason}`,
    attempts,
  );
}
