import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { GAMES } from './games';
import type { Profile, StreamConfig } from './types';

export const PROFILES: Record<string, Profile> = {
  // Default: 720p30 at a mid bitrate.
  standard: {
    width: 1280,
    height: 720,
    fps: 30,
    videoKbps: 3500,
    preset: 'veryfast',
  },
  // Lower-cost profile for weak ARM boxes (3 cores shared with the BE).
  lite: {
    width: 1280,
    height: 720,
    fps: 25,
    videoKbps: 2500,
    preset: 'ultrafast',
  },
  hd: {
    width: 1920,
    height: 1080,
    fps: 30,
    videoKbps: 4500,
    preset: 'veryfast',
  },
};

type Env = Record<string, string | undefined>;

/** Empty string counts as unset so `FOO=` in an env file keeps the default. */
const blankToUndefined = (v: unknown): unknown =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const optStr = z.preprocess(blankToUndefined, z.string().optional());
const optInt = z.preprocess(
  blankToUndefined,
  z.coerce.number().int().nonnegative().optional(),
);
const optNum = z.preprocess(
  blankToUndefined,
  z.coerce.number().nonnegative().optional(),
);
const optBool = z.preprocess(
  blankToUndefined,
  z
    .string()
    .transform((v) => /^(1|true|yes|on)$/i.test(v))
    .optional(),
);

/** Schema for every environment variable the director reads. */
export const envSchema = z.object({
  STREAM_PROFILE: optStr,
  STREAM_RESOLUTION: z.preprocess(
    blankToUndefined,
    z
      .string()
      .regex(/^\d+x\d+$/, 'must look like 1280x720')
      .optional(),
  ),
  STREAM_FPS: optInt,
  STREAM_VIDEO_KBPS: optInt,
  STREAM_X264_PRESET: optStr,
  STREAM_RTMP_URL: optStr,
  STREAM_KEY: optStr,
  STREAM_KEY_FILE: optStr,
  STREAM_STUB: optBool,
  STREAM_DRYRUN_SECONDS: optInt,
  STREAM_DRYRUN_OUT: optStr,
  STREAM_DRYRUN_SINK: z.preprocess(
    blankToUndefined,
    z.enum(['file', 'null']).optional(),
  ),
  STREAM_CAPTURE: z.preprocess(
    blankToUndefined,
    z.enum(['x11grab', 'testsrc']).optional(),
  ),
  DISPLAY: optStr,
  // Present-but-empty is meaningful here: "" disables game audio capture.
  STREAM_PULSE_SOURCE: z.string().optional(),
  STREAM_MUSIC_DIR: optStr,
  STREAM_MUSIC_VOLUME: optNum,
  STREAM_GAME_VOLUME: optNum,
  STREAM_NICE: optInt,
  STREAM_FFMPEG_BIN: optStr,
  STREAM_STALL_SECONDS: optInt,
  STREAM_WEB_URL: optStr,
  STREAM_LOCALE: optStr,
  STREAM_BE_URL: optStr,
  BE_URL: optStr,
  STREAM_BOT_EMAIL: optStr,
  STREAM_BOT_PASSWORD: optStr,
  STREAM_IDLE_SECONDS: optInt,
  STREAM_POLL_SECONDS: optInt,
  STREAM_MOVE_DELAY_MS: z.preprocess(
    blankToUndefined,
    z.coerce
      .number()
      .refine(
        (n) => [1000, 2000, 5000].includes(n),
        'must be 1000, 2000 or 5000',
      )
      .optional(),
  ),
  STREAM_RECYCLE_BROWSER_EVERY: optInt,
  STREAM_KILL_FILE: optStr,
  STREAM_KILL_SWITCH: optBool,
  STREAM_STATUS_FILE: optStr,
  STREAM_STATUS_PORT: optInt,
  STREAM_ALERT_WEBHOOK_URL: optStr,
});

export type StreamEnv = z.infer<typeof envSchema>;

export class ConfigError extends Error {}

export function parseEnv(env: Env): StreamEnv {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new ConfigError(`invalid environment: ${issues}`);
  }
  return result.data;
}

type ReadFile = (file: string, encoding: 'utf8') => string;

/** Stream key from STREAM_KEY_FILE (preferred) or STREAM_KEY. Never logged. */
export function readStreamKey(
  env: Pick<StreamEnv, 'STREAM_KEY' | 'STREAM_KEY_FILE'>,
  readFile: ReadFile = (f, e) => fs.readFileSync(f, e),
): string {
  if (env.STREAM_KEY_FILE) {
    return String(readFile(env.STREAM_KEY_FILE, 'utf8')).trim();
  }
  return (env.STREAM_KEY ?? '').trim();
}

/** Join base RTMP URL and key into the final push URL. */
export function buildRtmpTarget(
  baseUrl: string | undefined,
  key: string,
): string | null {
  if (!baseUrl) return null;
  if (!key) return baseUrl;
  return `${baseUrl.replace(/\/+$/, '')}/${key}`;
}

const trimSlash = (u: string): string => u.replace(/\/+$/, '');

export function loadConfig(
  rawEnv: Env = process.env,
  argv: string[] = [],
  readFile: ReadFile = (f, e) => fs.readFileSync(f, e),
): StreamConfig {
  const env = parseEnv(rawEnv);
  const args = new Set(argv);
  const profileName = env.STREAM_PROFILE ?? 'standard';
  const base = PROFILES[profileName] ?? PROFILES.standard;
  const size = /^(\d+)x(\d+)$/.exec(env.STREAM_RESOLUTION ?? '');
  const profile: Profile = {
    ...base,
    ...(size ? { width: Number(size[1]), height: Number(size[2]) } : {}),
    fps: env.STREAM_FPS ?? base.fps,
    videoKbps: env.STREAM_VIDEO_KBPS ?? base.videoKbps,
    preset: env.STREAM_X264_PRESET ?? base.preset,
  };

  const rtmpBase = (env.STREAM_RTMP_URL ?? '').trim();
  // Dry run is the default whenever no RTMP URL is configured.
  const dryRun = args.has('--dry-run') || !rtmpBase;
  const key = dryRun ? '' : readStreamKey(env, readFile);

  return {
    dryRun,
    stub: args.has('--stub') || (env.STREAM_STUB ?? false),
    profileName,
    profile,
    rtmpTarget: dryRun ? null : buildRtmpTarget(rtmpBase, key),
    dry: {
      seconds: env.STREAM_DRYRUN_SECONDS ?? 180,
      out:
        env.STREAM_DRYRUN_OUT ?? path.join(process.cwd(), 'stream-dry-run.mp4'),
      // 'null' discards output (CPU test only).
      sink: env.STREAM_DRYRUN_SINK ?? 'file',
    },
    capture: {
      mode:
        env.STREAM_CAPTURE ??
        (process.platform === 'linux' ? 'x11grab' : 'testsrc'),
      display: env.DISPLAY ?? ':99',
    },
    audio: {
      pulseSource: env.STREAM_PULSE_SOURCE ?? 'arcadeum_live.monitor',
      musicDir: env.STREAM_MUSIC_DIR ?? '',
      musicVolume: env.STREAM_MUSIC_VOLUME ?? 0.25,
      gameVolume: env.STREAM_GAME_VOLUME ?? 0.6,
    },
    niceness: env.STREAM_NICE ?? 0,
    ffmpegBin: env.STREAM_FFMPEG_BIN ?? 'ffmpeg',
    stallMs: (env.STREAM_STALL_SECONDS ?? 30) * 1000,
    backoff: { minMs: 1000, maxMs: 60_000, stableMs: 60_000 },
    web: {
      baseUrl: trimSlash(env.STREAM_WEB_URL ?? 'http://localhost:3000'),
      locale: env.STREAM_LOCALE ?? 'en',
    },
    be: {
      url: trimSlash(
        env.STREAM_BE_URL ?? env.BE_URL ?? 'http://localhost:4000',
      ),
      email: env.STREAM_BOT_EMAIL ?? 'arcadeum-live@test.com',
      password: env.STREAM_BOT_PASSWORD ?? '',
    },
    director: {
      idleSeconds: env.STREAM_IDLE_SECONDS ?? 15,
      pollMs: (env.STREAM_POLL_SECONDS ?? 3) * 1000,
      moveDelayMs: env.STREAM_MOVE_DELAY_MS ?? null,
      recycleBrowserEvery: env.STREAM_RECYCLE_BROWSER_EVERY ?? 10,
      maxApiErrors: 5,
      games: GAMES,
    },
    ops: {
      killFile: env.STREAM_KILL_FILE ?? '/var/lib/arcadeum-stream/KILL',
      killEnv: env.STREAM_KILL_SWITCH ?? false,
      killPollMs: 3000,
      statusFile: env.STREAM_STATUS_FILE ?? '',
      statusPort: env.STREAM_STATUS_PORT ?? 0,
      alertUrl: env.STREAM_ALERT_WEBHOOK_URL ?? '',
      alertCooldownMs: 5 * 60_000,
    },
  };
}
