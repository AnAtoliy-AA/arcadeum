export const GLIMWORM_TICK_HZ = 20;
export const GLIMWORM_TICK_MS = 1000 / GLIMWORM_TICK_HZ;
export const GLIMWORM_ARENA = { width: 2000, height: 2000 } as const;
export const GLIMWORM_BASE_SPEED = 200; // units / sec
export const GLIMWORM_SPEED_BURST_MULT = 1.7;
export const GLIMWORM_FOOD_CAP = 80;
export const GLIMWORM_POWERUP_CAP = 4;
export const GLIMWORM_START_LENGTH = 8;
export const GLIMWORM_GROW_PER_FOOD = { 1: 3, 3: 9 } as const;
export const GLIMWORM_RESPAWN_DELAY_MS = 1500;
export const GLIMWORM_INPUT_RATE_LIMIT_HZ = 30;
export const GLIMWORM_POWERUP_SPAWN_INTERVAL_MS = 8000;
export const GLIMWORM_POWERUP_SPAWN_CHANCE = 0.3;
export const GLIMWORM_POWERUP_WEIGHTS = {
  speed: 35,
  shield: 25,
  shrink: 20,
  ghost: 20,
} as const;
export const GLIMWORM_POWERUP_DURATION_MS = {
  speed: 3000,
  shield: 15000,
  shrink: 0,
  ghost: 2000,
} as const;
export const GLIMWORM_PALETTE = [
  '#ff5e5e',
  '#ffb05e',
  '#ffe65e',
  '#7cff5e',
  '#5effb6',
  '#5ee0ff',
  '#5e8cff',
  '#b15eff',
  '#ff5ed4',
  '#a0ffea',
] as const;
export const GLIMWORM_BR_SHRINK_DURATION_MS = 180_000; // 3 min
export const GLIMWORM_BR_SAFE_ZONE_DAMAGE_INTERVAL_MS = 500;
export const GLIMWORM_COUNTDOWN_MS = 3000;
export const GLIMWORM_TIME_ATTACK_DURATION_MS = 90_000;
export const GLIMWORM_LIVES_HEATS_LIVES = 3;
export const GLIMWORM_LIVES_HEATS_TIMEOUT_MS = 300_000;
export const GLIMWORM_DISCONNECT_GRACE_MS = 30_000;
export const GLIMWORM_RECONNECT_BACKOFF_MS = [1000, 2000, 4000, 8000];
