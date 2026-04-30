export type WormId = string;
export interface Vec2 {
  x: number;
  y: number;
}

export type PowerupKind = 'speed' | 'shield' | 'shrink' | 'ghost';

export interface Worm {
  id: WormId;
  color: string;
  segments: Vec2[];
  heading: number;
  speed: number;
  alive: boolean;
  livesLeft: number;
  score: number;
  ready: boolean; // lobby readiness toggle
  activePowerup: { kind: PowerupKind; expiresAt: number } | null;
  inventoryPowerup: PowerupKind | null;
  disconnected?: boolean;
  disconnectedAt?: number;
  respawnAt?: number;
  isBot?: boolean;
}

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

export interface GlimwormSession {
  roomId: string;
  hostUserId: string;
  variant: GlimwormVariant;
  powerupsEnabled: boolean;
  status: 'lobby' | 'countdown' | 'playing' | 'ended';
  startedAt: number | null;
  endsAt: number | null;
  arena: Arena;
  worms: Record<WormId, Worm>;
  food: Food[];
  powerups: Powerup[];
  winner: WormId | null;
  tickNum: number;
  lastInputAt: Record<WormId, number>;
  lastPowerupSpawnAt: number;
  damageTickAt: Record<WormId, number>;
}

export interface GlimwormWormSnapshot {
  id: WormId;
  color: string;
  segments: Vec2[];
  alive: boolean;
  livesLeft: number;
  score: number;
  activePowerup: Worm['activePowerup'];
  self?: boolean;
  heading?: number;
  speed?: number;
  inventoryPowerup?: PowerupKind | null;
}

export interface GlimwormSnapshot {
  roomId: string;
  tickNum: number;
  serverTime: number;
  status: GlimwormSession['status'];
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
  | { type: 'powerup_used'; wormId: WormId; kind: PowerupKind; tickNum: number }
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
