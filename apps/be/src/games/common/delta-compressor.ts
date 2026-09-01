export interface StateDeltaPacket<T = Record<string, unknown>> {
  version: number;
  sequenceId: number;
  isFullSnapshot: boolean;
  baseChecksum?: string;
  targetChecksum: string;
  diff: Record<string, unknown>;
  snapshot?: T;
}

export class DeltaCompressor {
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

  static generateDelta<T extends Record<string, unknown>>(
    previousState: T | null,
    currentState: T,
    sequenceId: number,
  ): StateDeltaPacket<T> {
    const targetChecksum = this.calculateChecksum(currentState);

    if (!previousState) {
      return {
        version: 1,
        sequenceId,
        isFullSnapshot: true,
        targetChecksum,
        diff: {},
        snapshot: currentState,
      };
    }

    const baseChecksum = this.calculateChecksum(previousState);
    const diff = this.diffObjects(previousState, currentState);

    if (Object.keys(diff).length === 0) {
      return {
        version: 1,
        sequenceId,
        isFullSnapshot: false,
        baseChecksum,
        targetChecksum,
        diff: {},
      };
    }

    const diffJsonLength = JSON.stringify(diff).length;
    const fullJsonLength = JSON.stringify(currentState).length;

    if (diffJsonLength > fullJsonLength) {
      return {
        version: 1,
        sequenceId,
        isFullSnapshot: true,
        baseChecksum,
        targetChecksum,
        diff: {},
        snapshot: currentState,
      };
    }

    return {
      version: 1,
      sequenceId,
      isFullSnapshot: false,
      baseChecksum,
      targetChecksum,
      diff,
    };
  }

  static applyDelta<T extends Record<string, unknown>>(
    baseState: T | null,
    packet: StateDeltaPacket<T>,
  ): T {
    if (packet.isFullSnapshot || !baseState) {
      if (!packet.snapshot) {
        throw new Error('Full snapshot packet missing snapshot payload');
      }
      return packet.snapshot;
    }

    if (packet.baseChecksum) {
      const currentBaseChecksum = this.calculateChecksum(baseState);
      if (currentBaseChecksum !== packet.baseChecksum) {
        throw new Error(
          `Checksum mismatch: expected base ${packet.baseChecksum}, got ${currentBaseChecksum}`,
        );
      }
    }

    const nextState = this.patchObject(baseState, packet.diff);
    const nextChecksum = this.calculateChecksum(nextState);

    if (nextChecksum !== packet.targetChecksum) {
      throw new Error(
        `Checksum mismatch after patch: expected ${packet.targetChecksum}, got ${nextChecksum}`,
      );
    }

    return nextState as T;
  }

  private static diffObjects(
    prev: Record<string, unknown>,
    curr: Record<string, unknown>,
  ): Record<string, unknown> {
    const diff: Record<string, unknown> = {};
    const allKeys = new Set([...Object.keys(prev), ...Object.keys(curr)]);

    for (const key of allKeys) {
      const prevVal = prev[key];
      const currVal = curr[key];

      if (currVal === undefined) {
        diff[key] = { __op: 'delete' };
      } else if (prevVal === undefined) {
        diff[key] = currVal;
      } else if (this.isPlainObject(prevVal) && this.isPlainObject(currVal)) {
        const nestedDiff = this.diffObjects(
          prevVal as Record<string, unknown>,
          currVal as Record<string, unknown>,
        );
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = nestedDiff;
        }
      } else if (Array.isArray(prevVal) && Array.isArray(currVal)) {
        if (!this.areArraysEqual(prevVal, currVal)) {
          diff[key] = currVal;
        }
      } else if (prevVal !== currVal) {
        diff[key] = currVal;
      }
    }

    return diff;
  }

  private static patchObject(
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

  private static isPlainObject(val: unknown): boolean {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
  }

  private static areArraysEqual(a: unknown[], b: unknown[]): boolean {
    if (a.length !== b.length) return false;
    return JSON.stringify(a) === JSON.stringify(b);
  }
}
