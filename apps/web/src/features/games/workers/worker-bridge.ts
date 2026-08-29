export interface WorkerTask<TPayload, TResult> {
  id: string;
  type: string;
  payload: TPayload;
  resolve: (result: TResult) => void;
  reject: (error: Error) => void;
}

export interface WorkerMessage<T> {
  id: string;
  type: string;
  payload?: T;
  error?: string;
}

export type FallbackHandler<TPayload, TResult> = (
  payload: TPayload,
) => Promise<TResult> | TResult;

export class WorkerBridge<TPayload = unknown, TResult = unknown> {
  private worker: Worker | null = null;
  private pendingTasks = new Map<
    string,
    { resolve: (res: TResult) => void; reject: (err: Error) => void }
  >();
  private readonly fallbackHandler?: FallbackHandler<TPayload, TResult>;
  private isTerminated = false;

  constructor(
    workerUrlOrFactory?: string | (() => Worker),
    fallback?: FallbackHandler<TPayload, TResult>,
  ) {
    this.fallbackHandler = fallback;

    if (
      typeof window !== 'undefined' &&
      typeof Worker !== 'undefined' &&
      workerUrlOrFactory
    ) {
      try {
        if (typeof workerUrlOrFactory === 'string') {
          this.worker = new Worker(workerUrlOrFactory);
        } else {
          this.worker = workerUrlOrFactory();
        }

        this.worker.onmessage = this.handleMessage.bind(this);
        this.worker.onerror = this.handleError.bind(this);
      } catch {
        this.worker = null;
      }
    }
  }

  hasActiveWorker(): boolean {
    return this.worker !== null && !this.isTerminated;
  }

  getPendingTaskCount(): number {
    return this.pendingTasks.size;
  }

  async execute(
    type: string,
    payload: TPayload,
    cancellationToken?: { isCancelled: boolean },
  ): Promise<TResult> {
    if (cancellationToken?.isCancelled) {
      throw new Error('Task cancelled before execution');
    }

    if (!this.worker || this.isTerminated) {
      if (this.fallbackHandler) {
        return this.fallbackHandler(payload);
      }
      throw new Error('Worker unavailable and no fallback provided');
    }

    const taskId = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    return new Promise<TResult>((resolve, reject) => {
      if (cancellationToken?.isCancelled) {
        reject(new Error('Task cancelled'));
        return;
      }

      this.pendingTasks.set(taskId, { resolve, reject });

      try {
        this.worker?.postMessage({
          id: taskId,
          type,
          payload,
        });
      } catch (err) {
        this.pendingTasks.delete(taskId);
        if (this.fallbackHandler) {
          try {
            const fallbackResult = this.fallbackHandler(payload);
            resolve(fallbackResult);
          } catch (fallbackErr) {
            reject(
              fallbackErr instanceof Error
                ? fallbackErr
                : new Error(String(fallbackErr)),
            );
          }
        } else {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      }
    });
  }

  cancelTask(taskId: string): boolean {
    const task = this.pendingTasks.get(taskId);
    if (task) {
      task.reject(new Error(`Task ${taskId} cancelled`));
      this.pendingTasks.delete(taskId);
      return true;
    }
    return false;
  }

  cancelAll(): void {
    for (const [taskId, task] of this.pendingTasks.entries()) {
      task.reject(new Error(`Task ${taskId} aborted`));
    }
    this.pendingTasks.clear();
  }

  terminate(): void {
    this.cancelAll();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isTerminated = true;
  }

  private handleMessage(event: MessageEvent<WorkerMessage<TResult>>): void {
    const data = event.data;
    if (!data || !data.id) return;

    const task = this.pendingTasks.get(data.id);
    if (!task) return;

    this.pendingTasks.delete(data.id);

    if (data.error) {
      task.reject(new Error(data.error));
    } else {
      task.resolve(data.payload as TResult);
    }
  }

  private handleError(event: ErrorEvent): void {
    for (const task of this.pendingTasks.values()) {
      task.reject(new Error(event.message || 'Worker runtime error'));
    }
    this.pendingTasks.clear();
  }
}
