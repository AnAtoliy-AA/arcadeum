'use strict';

const { spawn } = require('child_process');
const { EventEmitter } = require('events');
const {
  buildFfmpegArgs,
  redactArgs,
  withNice,
  parseProgressLine,
} = require('./ffmpeg');
const { nextBackoff } = require('./backoff');

/**
 * Keeps one ffmpeg process alive: restarts with backoff when it exits, and
 * kills it when the frame counter stops advancing (stall watchdog).
 *
 * Events: 'started', 'restart' ({reason, inMs}), 'progress' ({frame, fps}),
 *         'finished' (dry run reached -t), 'fatal'.
 */
class StreamRunner extends EventEmitter {
  constructor({
    config,
    outputFor,
    spawnFn = spawn,
    audioFor = () => ({}),
    log,
    now = Date.now,
  }) {
    super();
    this.config = config;
    this.outputFor = outputFor;
    this.audioFor = audioFor;
    this.spawn = spawnFn;
    this.log = log;
    this.now = now;
    this.child = null;
    this.stopping = false;
    this.attempt = 0;
    this.frame = 0;
    this.fps = 0;
    this.lastFrameAt = 0;
    this.startedAt = 0;
    this.timer = null;
    this.watchdog = null;
    this.restarts = 0;
    this.lastRestartReason = null;
  }

  start() {
    this.stopping = false;
    this._spawn();
  }

  _spawn() {
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
    const child = this.spawn(cmd, full, { stdio: ['ignore', 'pipe', 'pipe'] });
    this.child = child;
    let buf = '';
    child.stdout?.on('data', (d) => {
      buf += d.toString();
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        this._onLine(buf.slice(0, nl));
        buf = buf.slice(nl + 1);
      }
    });
    child.stderr?.on('data', (d) => {
      // ffmpeg warnings can echo the output URL; never log them verbatim.
      const text = d
        .toString()
        .replace(/rtmps?:\/\/\S+/gi, '[rtmp-target-redacted]');
      this.log.warn('ffmpeg stderr', { text: text.trim().slice(0, 500) });
    });
    child.on('error', (err) => this._onExit(null, null, err.message));
    child.on('exit', (code, signal) => this._onExit(code, signal));
    clearInterval(this.watchdog);
    this.watchdog = setInterval(
      () => this.checkStall(),
      Math.min(5000, this.config.stallMs),
    );
    this.watchdog.unref?.();
    this.emit('started');
  }

  _onLine(line) {
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
  checkStall() {
    if (!this.child || this.stopping) return false;
    if (this.now() - this.lastFrameAt >= this.config.stallMs) {
      this.log.warn('ffmpeg frames stalled, killing', { frame: this.frame });
      this.lastRestartReason = 'frames stalled';
      this.child.kill('SIGKILL');
      return true;
    }
    return false;
  }

  _onExit(code, signal, error) {
    clearInterval(this.watchdog);
    this.child = null;
    if (this.stopping) return;
    const output = this.outputFor();
    if (output.kind !== 'rtmp' && code === 0) {
      this.emit('finished');
      return;
    }
    const stable = this.now() - this.startedAt >= this.config.backoff.stableMs;
    if (stable) this.attempt = 0;
    const inMs = nextBackoff(this.attempt, this.config.backoff);
    this.attempt += 1;
    this.restarts += 1;
    const reason =
      this.lastRestartReason ||
      error ||
      (signal ? `signal ${signal}` : `exit code ${code}`);
    this.lastRestartReason = null;
    this.lastRestart = { reason, at: new Date(this.now()).toISOString() };
    this.log.warn('ffmpeg exited, reconnecting', {
      reason,
      inMs,
      attempt: this.attempt,
    });
    this.emit('restart', { reason, inMs });
    this.timer = setTimeout(() => {
      if (!this.stopping) this._spawn();
    }, inMs);
  }

  /** Graceful stop: ask ffmpeg to finalize ('q'), then SIGTERM/SIGKILL. */
  async stop() {
    this.stopping = true;
    clearTimeout(this.timer);
    clearInterval(this.watchdog);
    const child = this.child;
    if (!child) return;
    await new Promise((resolve) => {
      const kill = setTimeout(() => child.kill('SIGKILL'), 8000);
      child.once('exit', () => {
        clearTimeout(kill);
        resolve();
      });
      child.kill('SIGINT');
    });
  }
}

module.exports = { StreamRunner };
