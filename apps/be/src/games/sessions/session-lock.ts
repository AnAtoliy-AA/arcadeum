/** In-process FIFO mutex keyed by id (serialises actions on one session). */
export class KeyedLock {
  private readonly tails = new Map<string, Promise<void>>();

  async acquire(key: string): Promise<() => void> {
    let release!: () => void;
    const prev = this.tails.get(key) ?? Promise.resolve();
    const next = new Promise<void>((resolve) => {
      release = () => {
        resolve();
        this.tails.delete(key);
      };
    });
    this.tails.set(key, next);
    await prev;
    return release;
  }
}
