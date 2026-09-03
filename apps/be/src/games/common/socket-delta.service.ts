import { Injectable, Logger } from '@nestjs/common';
import { DeltaCompressor, type StateDeltaPacket } from './delta-compressor';

interface RoomDeltaSession {
  lastSequenceId: number;
  lastState: Record<string, unknown> | null;
  lastStateChecksum: string;
}

@Injectable()
export class SocketDeltaService {
  private readonly logger = new Logger(SocketDeltaService.name);
  private readonly roomSessions = new Map<string, RoomDeltaSession>();

  initRoom(
    roomId: string,
    initialState?: Record<string, unknown>,
  ): StateDeltaPacket {
    const session: RoomDeltaSession = {
      lastSequenceId: 1,
      lastState: initialState ?? null,
      lastStateChecksum: initialState
        ? DeltaCompressor.calculateChecksum(initialState)
        : '00000000',
    };
    this.roomSessions.set(roomId, session);

    return DeltaCompressor.generateDelta(null, initialState ?? {}, 1);
  }

  processStateUpdate(
    roomId: string,
    nextState: Record<string, unknown>,
  ): StateDeltaPacket {
    const session = this.roomSessions.get(roomId);
    if (!session) {
      return this.initRoom(roomId, nextState);
    }

    session.lastSequenceId += 1;
    const packet = DeltaCompressor.generateDelta(
      session.lastState,
      nextState,
      session.lastSequenceId,
    );

    session.lastState = nextState;
    session.lastStateChecksum = packet.targetChecksum;

    return packet;
  }

  getFullSnapshot(roomId: string): StateDeltaPacket | null {
    const session = this.roomSessions.get(roomId);
    if (!session || !session.lastState) return null;

    return {
      version: 1,
      sequenceId: session.lastSequenceId,
      isFullSnapshot: true,
      targetChecksum: session.lastStateChecksum,
      diff: {},
      snapshot: session.lastState,
    };
  }

  removeRoom(roomId: string): void {
    this.roomSessions.delete(roomId);
  }
}
