export interface StateDeltaPacket<T = Record<string, unknown>> {
  version: number;
  sequenceId: number;
  isFullSnapshot: boolean;
  baseChecksum?: string;
  targetChecksum: string;
  diff: Record<string, unknown>;
  snapshot?: T;
}

export interface StateBufferReconcilerOptions<T = Record<string, unknown>> {
  onFullResyncRequired?: () => void;
  initialState?: T | null;
}

export class SocketDeltaReconciler<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  private currentState: T | null = null;
  private lastSequenceId = 0;
  private readonly onFullResyncRequired?: () => void;

  constructor(options?: StateBufferReconcilerOptions<T>) {
    this.currentState = options?.initialState ?? null;
    this.onFullResyncRequired = options?.onFullResyncRequired;
  }

  private static fnv1a(str: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  static calculateChecksum(data: unknown): string {
    if (data === null || data === undefined) return '00000000';
    const serialized = JSON.stringify(data);
    return this.fnv1a(serialized ?? '');
  }

  getState(): T | null {
    return this.currentState;
  }

  getLastSequenceId(): number {
    return this.lastSequenceId;
  }

  reset(state: T | null = null): void {
    this.currentState = state;
    this.lastSequenceId = 0;
  }

  processPacket(packet: StateDeltaPacket<T>): T {
    if (packet.isFullSnapshot || !this.currentState) {
      if (!packet.snapshot) {
        throw new Error('Malformed snapshot packet');
      }
      this.currentState = packet.snapshot;
      this.lastSequenceId = packet.sequenceId;
      return this.currentState;
    }

    if (packet.sequenceId !== this.lastSequenceId + 1) {
      if (this.onFullResyncRequired) {
        this.onFullResyncRequired();
      }
    }

    if (packet.baseChecksum) {
      const currentChecksum = SocketDeltaReconciler.calculateChecksum(
        this.currentState,
      );
      if (currentChecksum !== packet.baseChecksum) {
        if (this.onFullResyncRequired) {
          this.onFullResyncRequired();
        }
        throw new Error(
          `State base checksum mismatch: expected ${packet.baseChecksum}, current is ${currentChecksum}`,
        );
      }
    }

    const nextState = this.patchObject(this.currentState, packet.diff);
    const nextChecksum = SocketDeltaReconciler.calculateChecksum(nextState);

    if (nextChecksum !== packet.targetChecksum) {
      if (this.onFullResyncRequired) {
        this.onFullResyncRequired();
      }
      throw new Error(
        `Target checksum verification failed: expected ${packet.targetChecksum}, computed ${nextChecksum}`,
      );
    }

    this.currentState = nextState as T;
    this.lastSequenceId = packet.sequenceId;
    return this.currentState;
  }

  private patchObject(
    target: Record<string, unknown>,
    patch: Record<string, unknown>,
  ): Record<string, unknown> {
    const result: Record<string, unknown> = { ...target };

    for (const key of Object.keys(patch)) {
      const patchVal = patch[key];

      if (
        patchVal &&
        typeof patchVal === 'object' &&
        (patchVal as { __op?: string }).__op === 'delete'
      ) {
        delete result[key];
      } else if (
        this.isPlainObject(patchVal) &&
        this.isPlainObject(result[key]) &&
        !(patchVal as { __op?: string }).__op
      ) {
        result[key] = this.patchObject(
          result[key] as Record<string, unknown>,
          patchVal as Record<string, unknown>,
        );
      } else {
        result[key] = patchVal;
      }
    }

    return result;
  }

  private isPlainObject(val: unknown): boolean {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
  }
}
