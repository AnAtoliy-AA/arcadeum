import { spawn } from 'child_process';
import type { ChildProcess, SpawnOptions } from 'child_process';
import { EventEmitter } from 'events';
import {
  buildFfmpegArgs,
  parseProgressLine,
  redactArgs,
  withNice,
} from './ffmpeg';
import { nextBackoff } from './backoff';
import type { AudioInputs, FfmpegOutput, Logger, StreamConfig } from './types';

export type SpawnFn = (
  cmd: string,
  args: string[],
  opts: SpawnOptions,
) => ChildProcess;

export interface RunnerOptions {
  config: Pick<
    StreamConfig,
    'profile' | 'capture' | 'niceness' | 'ffmpegBin' | 'stallMs' | 'backoff'
  >;
  outputFor: () => FfmpegOutput;
  audioFor?: () => AudioInputs;
  spawnFn?: SpawnFn;
  log: Logger;
  now?: () => number;
}

/**
 * Keeps one ffmpeg process alive: restarts with backoff when it exits, and
 * kills it when the frame counter stops advancing (stall watchdog).
 *
 * Events: 'started', 'restart' ({reason, inMs}), 'progress' ({frame, fps}),
 *         'finished' (dry run reached -t).
 */
export class StreamRunner extends EventEmitter {
  private readonly config: RunnerOptions['config'];
  private readonly outputFor: () => FfmpegOutput;
  private readonly audioFor: () => AudioInputs;
  private readonly spawnFn: SpawnFn;
  private readonly log: Logger;
  private readonly now: () => number;
  private child: ChildProcess | null = null;
  private stopping = false;
  private attempt = 0;
  private lastFrameAt = 0;
  private startedAt = 0;
  private timer: NodeJS.Timeout | null = null;
  private watchdog: NodeJS.Timeout | null = null;
  frame = 0;
  fps = 0;
  restarts = 0;
  lastRestartReason: string | null = null;

  constructor(opts: RunnerOptions) {
    super();
    this.config = opts.config;
    this.outputFor = opts.outputFor;
    this.audioFor = opts.audioFor ?? (() => ({}));
    this.spawnFn = opts.spawnFn ?? ((c, a, o) => spawn(c, a, o));
    this.log = opts.log;
    this.now = opts.now ?? Date.now;
  }

  start(): void {
    this.stopping = false;
    this.spawnChild();
  }

  private spawnChild(): void {
    const args = buildFfmpegArgs({
      profile: this.config.profile,
      capture: this.config.capture,
      audio: this.audioFor(),
      output: this.outputFor(),
    });
    const { cmd, args: full } = withNice(
      this.config.ffmpegBin,
      args,
      this.config.niceness,
    );
    this.log.info('ffmpeg starting', { args: redactArgs(full) });
    this.startedAt = this.lastFrameAt = this.now();
    this.frame = 0;
    this.fps = 0;
    const child = this.spawnFn(cmd, full, {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    this.child = child;
    let buf = '';
    child.stdout?.on('data', (d: Buffer | string) => {
      buf += d.toString();
      let nl: number;
      while ((nl = buf.indexOf('\n')) >= 0) {
        this.onLine(buf.slice(0, nl));
        buf = buf.slice(nl + 1);
      }
    });
    child.stderr?.on('data', (d: Buffer | string) => {
      // ffmpeg warnings can echo the output URL; never log them verbatim.
      const text = d
        .toString()
        .replace(/rtmps?:\/\/\S+/gi, '[rtmp-target-redacted]');
      this.log.warn('ffmpeg stderr', { text: text.trim().slice(0, 500) });
    });
    child.on('error', (err: Error) => this.onExit(null, null, err.message));
    child.on('exit', (code: number | null, signal: string | null) =>
      this.onExit(code, signal),
    );
    if (this.watchdog) clearInterval(this.watchdog);
    this.watchdog = setInterval(
      () => this.checkStall(),
      Math.min(5000, this.config.stallMs),
    );
    this.watchdog.unref();
    this.emit('started');
  }

  private onLine(line: string): void {
    const p = parseProgressLine(line);
    if (!p) return;
    if (p.key === 'fps') this.fps = p.value;
    if (p.key === 'frame') {
      if (p.value > this.frame) this.lastFrameAt = this.now();
      this.frame = p.value;
      this.emit('progress', { frame: this.frame, fps: this.fps });
    }
  }

  /** Kill ffmpeg when no new frame arrived within stallMs. */
  checkStall(): boolean {
    if (!this.child || this.stopping) return false;
    if (this.now() - this.lastFrameAt >= this.config.stallMs) {
      this.log.warn('ffmpeg frames stalled, killing', { frame: this.frame });
      this.lastRestartReason = 'frames stalled';
      this.child.kill('SIGKILL');
      return true;
    }
    return false;
  }

  private onExit(
    code: number | null,
    signal: string | null,
    error?: string,
  ): void {
    if (this.watchdog) clearInterval(this.watchdog);
    this.child = null;
    if (this.stopping) return;
    if (this.outputFor().kind !== 'rtmp' && code === 0) {
      this.emit('finished');
      return;
    }
    const stable = this.now() - this.startedAt >= this.config.backoff.stableMs;
    if (stable) this.attempt = 0;
    const inMs = nextBackoff(this.attempt, this.config.backoff);
    this.attempt += 1;
    this.restarts += 1;
    const reason =
      this.lastRestartReason ??
      error ??
      (signal ? `signal ${signal}` : `exit code ${String(code)}`);
    this.lastRestartReason = null;
    this.log.warn('ffmpeg exited, reconnecting', {
      reason,
      inMs,
      attempt: this.attempt,
    });
    this.emit('restart', { reason, inMs });
    this.timer = setTimeout(() => {
      if (!this.stopping) this.spawnChild();
    }, inMs);
  }

  /** Graceful stop: ask ffmpeg to finalize (SIGINT), then SIGKILL after 8s. */
  async stop(): Promise<void> {
    this.stopping = true;
    if (this.timer) clearTimeout(this.timer);
    if (this.watchdog) clearInterval(this.watchdog);
    const child = this.child;
    if (!child) return;
    await new Promise<void>((resolve) => {
      const kill = setTimeout(() => child.kill('SIGKILL'), 8000);
      child.once('exit', () => {
        clearTimeout(kill);
        resolve();
      });
      child.kill('SIGINT');
    });
  }
}
