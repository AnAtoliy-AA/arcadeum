// Mirrors apps/be/src/games/glimworm/glimworm.types.ts.
// Web cannot import from apps/be — the wire shape is duplicated here so the
// snapshot/event payloads stay in sync. If the BE shape changes, update both.

export type WormId = string;
export interface Vec2 {
  x: number;
  y: number;
}

export type PowerupKind = 'speed' | 'shield' | 'shrink' | 'ghost';

export interface Food {
  id: string;
  pos: Vec2;
  value: 1 | 3;
}

export interface Powerup {
  id: string;
  pos: Vec2;
  kind: PowerupKind;
  spawnedAt: number;
}

export interface Arena {
  width: number;
  height: number;
  safeZone?: { center: Vec2; radius: number; shrinkRate: number };
}

export type GlimwormVariant = 'battle_royale' | 'time_attack' | 'lives_heats';

export type GlimwormStatus = 'lobby' | 'countdown' | 'playing' | 'ended';

export interface GlimwormWormSnapshot {
  id: WormId;
  color: string;
  segments: Vec2[];
  alive: boolean;
  livesLeft: number;
  score: number;
  activePowerup: { kind: PowerupKind; expiresAt: number } | null;
  self?: boolean;
  heading?: number;
  speed?: number;
  inventoryPowerup?: PowerupKind | null;
}

export interface GlimwormSnapshot {
  roomId: string;
  tickNum: number;
  serverTime: number;
  status: GlimwormStatus;
  variant: GlimwormVariant;
  powerupsEnabled: boolean;
  arena: Arena;
  worms: GlimwormWormSnapshot[];
  food: Food[];
  powerups: Powerup[];
  endsAt: number | null;
  winner: WormId | null;
}

export type GlimwormDiscreteEvent =
  | {
      type: 'worm_died';
      wormId: WormId;
      killerId: WormId | null;
      tickNum: number;
    }
  | {
      type: 'powerup_picked';
      wormId: WormId;
      kind: PowerupKind;
      tickNum: number;
    }
  | {
      type: 'powerup_used';
      wormId: WormId;
      kind: PowerupKind;
      tickNum: number;
    }
  | { type: 'round_started'; tickNum: number; serverTime: number }
  | {
      type: 'round_ended';
      winner: WormId | null;
      scoreboard: Array<{ id: WormId; score: number }>;
      tickNum: number;
    };

export interface GlimwormInputPayload {
  angle: number;
  usePowerup: boolean;
}

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'slow';
