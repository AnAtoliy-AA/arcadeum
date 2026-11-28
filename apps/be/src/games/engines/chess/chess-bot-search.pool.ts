import { existsSync } from 'node:fs';
import { cpus } from 'node:os';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { Logger } from '@nestjs/common';
import {
  searchBotMove,
  type BotSearchMove,
  type BotSearchRequest,
} from '@arcadeum/games-core/games/chess/chess-bot-search';

interface WorkerReply {
  id: number;
  move?: BotSearchMove | null;
  error?: string;
}

interface Job {
  id: number;
  req: BotSearchRequest;
  resolve: (move: BotSearchMove | null) => void;
  reject: (err: Error) => void;
}

interface Slot {
  worker: Worker;
  job: Job | null;
  timer: ReturnType<typeof setTimeout> | null;
}

/** Grace on top of the search budget before a worker is considered hung. */
const HANG_GRACE_MS = 5_000;
/** Budget used when falling back to an in-process search. */
const FALLBACK_BUDGET_MS = 150;

/**
 * Small persistent pool of worker threads for chess bot searches. Searches
 * are CPU bound (up to several seconds), so running them on the main thread
 * stalled every other game on the server. When the compiled worker script
 * is unavailable (unit tests run from TypeScript sources) or a worker fails,
 * the pool falls back to a short in-process search so the bot still moves.
 */
export class ChessBotSearchPool {
  private readonly logger = new Logger(ChessBotSearchPool.name);
  private readonly slots: Slot[] = [];
  private readonly queue: Job[] = [];
  private nextId = 1;
  private closed = false;

  constructor(
    private readonly size: number = Math.max(1, Math.min(2, cpus().length - 1)),
    private readonly workerPath: string | null = resolveWorkerPath(),
  ) {}

  get usesWorkers(): boolean {
    return this.workerPath !== null;
  }

  search(req: BotSearchRequest): Promise<BotSearchMove | null> {
    if (!this.workerPath || this.closed) {
      return Promise.resolve(searchBotMove(req));
    }
    return new Promise<BotSearchMove | null>((resolve, reject) => {
      this.queue.push({ id: this.nextId++, req, resolve, reject });
      this.pump();
    }).catch((err: unknown) => {
      this.logger.warn(
        `Worker search failed, falling back in-process: ${String(err)}`,
      );
      return searchBotMove({
        ...req,
        timeBudgetMs: Math.min(req.timeBudgetMs, FALLBACK_BUDGET_MS),
      });
    });
  }

  async destroy(): Promise<void> {
    this.closed = true;
    const pending = this.queue.splice(0);
    pending.forEach((job) => job.reject(new Error('Pool closed')));
    await Promise.all(
      this.slots.splice(0).map(async (slot) => {
        if (slot.timer) clearTimeout(slot.timer);
        slot.job?.reject(new Error('Pool closed'));
        await slot.worker.terminate();
      }),
    );
  }

  private pump(): void {
    while (this.queue.length > 0) {
      let slot = this.slots.find((s) => s.job === null);
      if (!slot && this.slots.length < this.size) slot = this.spawn();
      if (!slot) return;
      this.run(slot, this.queue.shift()!);
    }
  }

  private spawn(): Slot {
    const worker = new Worker(this.workerPath!);
    worker.unref();
    const slot: Slot = { worker, job: null, timer: null };
    worker.on('message', (reply: WorkerReply) => this.onReply(slot, reply));
    worker.on('error', (err) => this.fail(slot, err));
    worker.on('exit', (code) => {
      if (slot.job) this.fail(slot, new Error(`Worker exited (${code})`));
      this.remove(slot);
    });
    this.slots.push(slot);
    return slot;
  }

  private run(slot: Slot, job: Job): void {
    slot.job = job;
    slot.timer = setTimeout(() => {
      this.fail(slot, new Error('Worker search timed out'));
      void slot.worker.terminate();
    }, job.req.timeBudgetMs + HANG_GRACE_MS);
    slot.worker.postMessage({ id: job.id, req: job.req });
  }

  private onReply(slot: Slot, reply: WorkerReply): void {
    const job = slot.job;
    if (!job || job.id !== reply.id) return;
    this.release(slot);
    if (reply.error) job.reject(new Error(reply.error));
    else job.resolve(reply.move ?? null);
    this.pump();
  }

  private fail(slot: Slot, err: Error): void {
    const job = slot.job;
    this.release(slot);
    this.remove(slot);
    job?.reject(err);
    if (!this.closed) this.pump();
  }

  private release(slot: Slot): void {
    if (slot.timer) clearTimeout(slot.timer);
    slot.timer = null;
    slot.job = null;
  }

  private remove(slot: Slot): void {
    const idx = this.slots.indexOf(slot);
    if (idx >= 0) this.slots.splice(idx, 1);
  }
}

/** Compiled worker next to this file; null when running from TS sources. */
function resolveWorkerPath(): string | null {
  const candidate = join(__dirname, 'chess-bot.worker.js');
  return existsSync(candidate) ? candidate : null;
}
