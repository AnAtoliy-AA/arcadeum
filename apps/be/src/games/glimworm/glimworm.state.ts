import { GLIMWORM_ARENA } from './glimworm.constants';
import type { GlimwormSession, GlimwormVariant } from './glimworm.types';

export interface CreateSessionInput {
  roomId: string;
  hostUserId: string;
  variant: GlimwormVariant;
  powerupsEnabled: boolean;
}

export class GlimwormStateStore {
  private readonly sessions = new Map<string, GlimwormSession>();

  create(input: CreateSessionInput): GlimwormSession {
    const session: GlimwormSession = {
      roomId: input.roomId,
      hostUserId: input.hostUserId,
      variant: input.variant,
      powerupsEnabled: input.powerupsEnabled,
      status: 'lobby',
      startedAt: null,
      endsAt: null,
      arena: { width: GLIMWORM_ARENA.width, height: GLIMWORM_ARENA.height },
      worms: {},
      food: [],
      powerups: [],
      winner: null,
      tickNum: 0,
      lastInputAt: {},
      lastPowerupSpawnAt: 0,
      damageTickAt: {},
    };
    this.sessions.set(input.roomId, session);
    return session;
  }

  get(roomId: string): GlimwormSession | undefined {
    return this.sessions.get(roomId);
  }

  remove(roomId: string): void {
    this.sessions.delete(roomId);
  }

  list(): GlimwormSession[] {
    return [...this.sessions.values()];
  }
}
