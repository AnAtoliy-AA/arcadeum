import { WorkerBridge, FallbackHandler } from './worker-bridge';

export interface WorkerPoolConfig<TPayload, TResult> {
  poolSize?: number;
  workerFactory?: () => Worker;
  fallback?: FallbackHandler<TPayload, TResult>;
}

export class WorkerPool<TPayload = unknown, TResult = unknown> {
  private workers: WorkerBridge<TPayload, TResult>[] = [];
  private roundRobinIndex = 0;
  private isTerminated = false;

  constructor(config: WorkerPoolConfig<TPayload, TResult>) {
    const size = Math.max(1, config.poolSize ?? 2);

    for (let i = 0; i < size; i++) {
      this.workers.push(
        new WorkerBridge<TPayload, TResult>(
          config.workerFactory,
          config.fallback,
        ),
      );
    }
  }

  getPoolSize(): number {
    return this.workers.length;
  }

  getActiveWorkersCount(): number {
    return this.workers.filter((w) => w.hasActiveWorker()).length;
  }

  getTotalPendingTasks(): number {
    return this.workers.reduce((acc, w) => acc + w.getPendingTaskCount(), 0);
  }

  async execute(
    type: string,
    payload: TPayload,
    cancellationToken?: { isCancelled: boolean },
  ): Promise<TResult> {
    if (this.isTerminated) {
      throw new Error('WorkerPool is terminated');
    }

    if (this.workers.length === 0) {
      throw new Error('No workers available in pool');
    }

    const worker = this.getNextWorker();
    return worker.execute(type, payload, cancellationToken);
  }

  cancelAll(): void {
    for (const worker of this.workers) {
      worker.cancelAll();
    }
  }

  terminate(): void {
    this.cancelAll();
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.isTerminated = true;
  }

  private getNextWorker(): WorkerBridge<TPayload, TResult> {
    const available = this.workers.reduce((leastLoaded, current) => {
      return current.getPendingTaskCount() < leastLoaded.getPendingTaskCount()
        ? current
        : leastLoaded;
    }, this.workers[0]);

    if (available.getPendingTaskCount() === 0) {
      const selected = this.workers[this.roundRobinIndex % this.workers.length];
      this.roundRobinIndex++;
      return selected;
    }

    return available;
  }
}
