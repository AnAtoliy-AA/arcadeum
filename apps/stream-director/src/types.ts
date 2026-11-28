/** Shared types for the stream director. */

export type CaptureMode = 'x11grab' | 'testsrc';

export interface GameConfig {
  id: string;
  title: string;
  maxDurationMs: number;
  stuckMs: number;
  moveDelayMs: number;
  themes: string[];
  /** Relative frequency in the rotation (1 = normal). */
  weight: number;
  /** Optional [white, black] bot personality ids; BE picks random when null. */
  personalities: [string, string] | null;
}

/** Overlay options passed to the scenes as query params. */
export interface SceneOverlay {
  joinUrl: string;
  showQr: boolean;
  banner: string;
  /** Overlay parts to hide (players, status, cta, moves, arc). */
  hide: string[];
}

export interface Profile {
  width: number;
  height: number;
  fps: number;
  videoKbps: number;
  preset: string;
}

export interface CaptureConfig {
  mode: CaptureMode;
  display: string;
}

export interface AudioInputs {
  pulseSource?: string;
  musicList?: string;
  musicVolume?: number;
  gameVolume?: number;
}

export type FfmpegOutput =
  | { kind: 'rtmp'; target: string; durationSec?: number }
  | { kind: 'file'; path: string; durationSec?: number }
  | { kind: 'null'; durationSec?: number };

export interface StreamConfig {
  dryRun: boolean;
  stub: boolean;
  profileName: string;
  profile: Profile;
  rtmpTarget: string | null;
  dry: { seconds: number; out: string; sink: 'file' | 'null' };
  capture: CaptureConfig;
  audio: {
    pulseSource: string;
    musicDir: string;
    /** 0-1 fraction (admin setting 0-100 divided by 100). */
    musicVolume: number;
    gameVolume: number;
    /** Track file names the admin allows; null = every track in the folder. */
    trackNames: string[] | null;
  };
  niceness: number;
  ffmpegBin: string;
  stallMs: number;
  backoff: { minMs: number; maxMs: number; stableMs: number };
  web: { baseUrl: string; locale: string };
  scene: { overlay: SceneOverlay };
  control: {
    enabled: boolean;
    /** STREAM_SERVICE_TOKEN; empty = authenticate with the stream user JWT. */
    serviceToken: string;
    pollMs: number;
    statusMs: number;
  };
  be: { url: string; email: string; password: string };
  director: {
    idleSeconds: number;
    pollMs: number;
    moveDelayMs: number | null;
    botDifficulty: string | null;
    recycleBrowserEvery: number;
    maxApiErrors: number;
    games: GameConfig[];
  };
  ops: {
    killFile: string;
    killEnv: boolean;
    killPollMs: number;
    statusFile: string;
    statusPort: number;
    alertUrl: string;
    alertCooldownMs: number;
  };
}

/** Minimal logger surface used across modules. */
export interface Logger {
  info(msg: string, data?: Record<string, unknown>): void;
  warn(msg: string, data?: Record<string, unknown>): void;
  error(msg: string, data?: Record<string, unknown>): void;
}

export type Alert = (
  key: string,
  message: string,
  extra?: Record<string, unknown>,
) => Promise<boolean>;

// ---- BE API payloads ----

export interface CreateAiVsAiRequest {
  gameId: string;
  theme?: string;
  aiMoveDelayMs?: number;
  botDifficulty?: string;
  botPersonalityWhite?: string;
  botPersonalityBlack?: string;
}

export interface RoomSummary {
  id: string;
  status?: string;
}

export interface CreateAiVsAiResponse {
  room: RoomSummary;
}

export interface SessionSummary {
  status?: string;
  updatedAt?: string;
  state?: unknown;
}

export interface RoomInfoResponse {
  room?: RoomSummary;
  session?: SessionSummary | null;
}

export interface LoginResponse {
  accessToken?: string;
}

export type Verdict =
  | 'continue'
  | 'finished'
  | 'timeout'
  | 'stuck'
  | 'error'
  | 'stopped'
  | 'skipped';

export interface GameClockInput {
  now: number;
  startedAt: number;
  maxDurationMs: number;
  stuckMs: number;
  lastChangeAt: number;
  completed?: boolean;
  consecutiveErrors?: number;
  maxErrors?: number;
}

/** The slice of the BE client the director needs (easy to fake in tests). */
export interface DirectorApi {
  createAiVsAi(args: {
    gameId: string;
    theme: string;
    moveDelayMs: number;
    botDifficulty?: string | null;
    personalities: [string, string] | null;
  }): Promise<RoomSummary>;
  getRoomInfo(roomId: string): Promise<RoomInfoResponse>;
  abandonRoom(roomId: string): Promise<unknown>;
}

export interface SceneBrowser {
  goto(url: string): Promise<void>;
  recycle(): Promise<void>;
}

export interface HealthState {
  state: string;
  currentGame: {
    id: string;
    roomId?: string;
    theme?: string;
    startedAt?: string;
  } | null;
  gamesPlayed: number;
  lastRestartReason: string | null;
  lastRestartAt: string | null;
  ffmpegFps: number;
  ffmpegFrames: number;
  ffmpegRestarts: number;
  dryRun: boolean;
  killed: boolean;
}
