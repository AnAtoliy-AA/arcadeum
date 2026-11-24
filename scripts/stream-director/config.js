'use strict';

const fs = require('fs');
const path = require('path');
const { GAMES } = require('./games');

const PROFILES = {
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

const int = (v, d) => {
  const n = Number.parseInt(v ?? '', 10);
  return Number.isFinite(n) ? n : d;
};
const bool = (v, d = false) =>
  v === undefined || v === '' ? d : /^(1|true|yes|on)$/i.test(String(v));

/** Stream key from STREAM_KEY_FILE (preferred) or STREAM_KEY. Never logged. */
function readStreamKey(env, readFile = fs.readFileSync) {
  if (env.STREAM_KEY_FILE) {
    return String(readFile(env.STREAM_KEY_FILE, 'utf8')).trim();
  }
  return (env.STREAM_KEY || '').trim();
}

/** Join base RTMP URL and key into the final push URL. */
function buildRtmpTarget(baseUrl, key) {
  if (!baseUrl) return null;
  if (!key) return baseUrl;
  return `${baseUrl.replace(/\/+$/, '')}/${key}`;
}

function loadConfig(env = process.env, argv = [], readFile = fs.readFileSync) {
  const args = new Set(argv);
  const profileName = env.STREAM_PROFILE || 'standard';
  const base = PROFILES[profileName] || PROFILES.standard;
  const size = (env.STREAM_RESOLUTION || '').match(/^(\d+)x(\d+)$/);
  const profile = {
    ...base,
    ...(size
      ? { width: int(size[1], base.width), height: int(size[2], base.height) }
      : {}),
    fps: int(env.STREAM_FPS, base.fps),
    videoKbps: int(env.STREAM_VIDEO_KBPS, base.videoKbps),
    preset: env.STREAM_X264_PRESET || base.preset,
  };

  const rtmpBase = (env.STREAM_RTMP_URL || '').trim();
  // Dry run is the default whenever no RTMP URL is configured.
  const dryRun = args.has('--dry-run') || !rtmpBase;
  const key = dryRun ? '' : readStreamKey(env, readFile);

  return {
    dryRun,
    stub: args.has('--stub') || bool(env.STREAM_STUB),
    profileName,
    profile,
    rtmpTarget: dryRun ? null : buildRtmpTarget(rtmpBase, key),
    dry: {
      seconds: int(env.STREAM_DRYRUN_SECONDS, 180),
      out:
        env.STREAM_DRYRUN_OUT || path.join(process.cwd(), 'stream-dry-run.mp4'),
      // 'null' discards output (CPU test only).
      sink: env.STREAM_DRYRUN_SINK === 'null' ? 'null' : 'file',
    },
    capture: {
      mode:
        env.STREAM_CAPTURE ||
        (process.platform === 'linux' ? 'x11grab' : 'testsrc'),
      display: env.DISPLAY || ':99',
    },
    audio: {
      pulseSource: env.STREAM_PULSE_SOURCE ?? 'arcadeum_live.monitor',
      musicDir: env.STREAM_MUSIC_DIR || '',
      musicVolume: Number(env.STREAM_MUSIC_VOLUME ?? 0.25),
      gameVolume: Number(env.STREAM_GAME_VOLUME ?? 0.6),
    },
    niceness: int(env.STREAM_NICE, 0),
    ffmpegBin: env.STREAM_FFMPEG_BIN || 'ffmpeg',
    stallMs: int(env.STREAM_STALL_SECONDS, 30) * 1000,
    backoff: { minMs: 1000, maxMs: 60_000, stableMs: 60_000 },
    web: {
      baseUrl: (env.STREAM_WEB_URL || 'http://localhost:3000').replace(
        /\/+$/,
        '',
      ),
      locale: env.STREAM_LOCALE || 'en',
    },
    be: {
      url: (env.STREAM_BE_URL || env.BE_URL || 'http://localhost:4000').replace(
        /\/+$/,
        '',
      ),
      email: env.STREAM_BOT_EMAIL || 'arcadeum-live@test.com',
      password: env.STREAM_BOT_PASSWORD || '',
    },
    director: {
      idleSeconds: int(env.STREAM_IDLE_SECONDS, 15),
      pollMs: int(env.STREAM_POLL_SECONDS, 3) * 1000,
      moveDelayMs: env.STREAM_MOVE_DELAY_MS
        ? int(env.STREAM_MOVE_DELAY_MS, 2000)
        : null,
      recycleBrowserEvery: int(env.STREAM_RECYCLE_BROWSER_EVERY, 10),
      maxApiErrors: 5,
      games: GAMES,
    },
    ops: {
      killFile: env.STREAM_KILL_FILE || '/var/lib/arcadeum-stream/KILL',
      killEnv: bool(env.STREAM_KILL_SWITCH),
      killPollMs: 3000,
      statusFile: env.STREAM_STATUS_FILE || '',
      statusPort: int(env.STREAM_STATUS_PORT, 0),
      alertUrl: env.STREAM_ALERT_WEBHOOK_URL || '',
      alertCooldownMs: 5 * 60_000,
    },
  };
}

module.exports = { loadConfig, readStreamKey, buildRtmpTarget, PROFILES };
