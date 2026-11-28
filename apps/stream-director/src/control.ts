import { applyRemote, parseCommands, parseRemote } from './remoteConfig';
import type { RemoteCommand } from './remoteConfig';
import type { ControlClient } from './controlClient';
import type { ErrorRing } from './errorRing';
import type { Supervisor } from './supervisor';
import type { Health } from './health';
import type { Alert, Logger, StreamConfig } from './types';

export interface ControlOptions {
  config: StreamConfig;
  client: ControlClient;
  supervisor: Pick<
    Supervisor,
    'setRemote' | 'markFfmpegDirty' | 'skip' | 'restartBrowser' | 'tick'
  >;
  health: Pick<Health, 'snapshot'>;
  ring: ErrorRing;
  log: Logger;
  alert?: Alert;
}

/** Failed polls in a row before the backend counts as down (alert once). */
const DOWN_AFTER = 12;
const HANDLED_MAX = 100;

/**
 * Polls the backend for admin settings and commands and reports status.
 *
 * Safety rules:
 *  - invalid remote config is ignored (logged), the last good one stays;
 *  - backend unreachable: keep streaming with the last good config, the
 *    local kill switch file keeps working (it lives in the Supervisor);
 *  - the stream key never passes through here (it is not in the payload).
 */
export class ControlLoop {
  private readonly config: StreamConfig;
  private readonly client: ControlClient;
  private etag: string | null = null;
  private failures = 0;
  private readonly handled = new Set<string>();
  private timers: NodeJS.Timeout[] = [];
  private rejectedVersion = -1;
  appliedVersion = 0;
  backendUp: boolean | null = null;

  constructor(private readonly o: ControlOptions) {
    this.config = o.config;
    this.client = o.client;
  }

  start(): void {
    const { pollMs, statusMs } = this.config.control;
    const guard = (fn: () => Promise<void>) => () => void fn().catch(() => {});
    this.timers = [
      setInterval(
        guard(() => this.poll()),
        pollMs,
      ),
      setInterval(
        guard(() => this.report()),
        statusMs,
      ),
    ];
    for (const t of this.timers) t.unref();
    void this.poll().catch(() => {});
  }

  stop(): void {
    this.timers.forEach(clearInterval);
    this.timers = [];
  }

  async poll(): Promise<void> {
    await this.pollConfig();
    if (this.backendUp) await this.pollCommands();
  }

  async pollConfig(): Promise<void> {
    const { log } = this.o;
    try {
      const res = await this.client.fetchConfig(this.etag);
      this.markUp();
      if (res.kind === 'not_modified') return;
      const parsed = parseRemote(res.body);
      if (!parsed.ok) {
        const version = bodyVersion(res.body);
        if (version !== this.rejectedVersion) {
          this.rejectedVersion = version;
          log.warn(
            'ignoring invalid remote config, keeping the last good one',
            {
              error: parsed.reason,
            },
          );
        }
        return;
      }
      this.etag = res.etag;
      const report = applyRemote(this.config, parsed.settings);
      this.appliedVersion = parsed.version;
      this.o.supervisor.setRemote(report.enabled, report.stopGracefully);
      if (report.ffmpegRestart.length) this.o.supervisor.markFfmpegDirty();
      log.info('applied remote config', {
        version: parsed.version,
        live: report.live,
        nextGame: report.nextGame,
        ffmpegRestartAtNextGame: report.ffmpegRestart,
        enabled: report.enabled,
      });
      await this.o.supervisor.tick();
    } catch (err) {
      this.markDown((err as Error).message);
    }
  }

  private markUp(): void {
    if (this.backendUp === false) {
      this.o.log.info('backend reachable again');
    }
    this.backendUp = true;
    this.failures = 0;
  }

  private markDown(message: string): void {
    this.failures += 1;
    if (this.backendUp !== false) {
      // Once per outage; the stream keeps running on the last good config.
      this.o.log.warn('backend unreachable, keeping last good config', {
        error: message,
      });
    }
    this.backendUp = false;
    if (this.failures === DOWN_AFTER) {
      void this.o.alert?.(
        'backend-unreachable',
        'Stream control backend unreachable, running on last good config',
      );
    }
  }

  async pollCommands(): Promise<void> {
    let commands: RemoteCommand[];
    try {
      commands = parseCommands(await this.client.fetchCommands());
    } catch (err) {
      this.o.log.warn('command poll failed', { error: (err as Error).message });
      return;
    }
    for (const cmd of commands) {
      if (this.handled.has(cmd.id)) {
        await this.ack(cmd.id, 'done', 'already handled');
        continue;
      }
      this.handled.add(cmd.id);
      if (this.handled.size > HANDLED_MAX) {
        const first = this.handled.values().next().value;
        if (first !== undefined) this.handled.delete(first);
      }
      const outcome = await this.execute(cmd);
      await this.ack(cmd.id, outcome.ok ? 'done' : 'failed', outcome.message);
    }
  }

  async execute(
    cmd: RemoteCommand,
  ): Promise<{ ok: boolean; message?: string }> {
    const { supervisor, log } = this.o;
    log.info('executing command', { type: cmd.type });
    try {
      switch (cmd.type) {
        case 'start':
          supervisor.setRemote(true, false);
          await supervisor.tick();
          return { ok: true };
        case 'stop':
          supervisor.setRemote(false, cmd.graceful ?? false);
          await supervisor.tick();
          return { ok: true };
        case 'skip':
          return supervisor.skip()
            ? { ok: true }
            : { ok: false, message: 'no game is running' };
        case 'restart_browser':
          return (await supervisor.restartBrowser())
            ? { ok: true }
            : { ok: false, message: 'stream is not running' };
      }
    } catch (err) {
      return { ok: false, message: (err as Error).message };
    }
  }

  private async ack(
    id: string,
    result: 'done' | 'failed',
    message?: string,
  ): Promise<void> {
    try {
      await this.client.ackCommand(id, result, message);
    } catch (err) {
      this.o.log.warn('command ack failed', { error: (err as Error).message });
    }
  }

  /** Status payload: only fields the BE DTO accepts, nothing secret. */
  buildStatus(): Record<string, unknown> {
    const s = this.o.health.snapshot();
    return {
      state: s.state,
      currentGame: s.currentGame
        ? {
            id: s.currentGame.id,
            ...(s.currentGame.roomId ? { roomId: s.currentGame.roomId } : {}),
            ...(s.currentGame.theme ? { theme: s.currentGame.theme } : {}),
            ...(s.currentGame.startedAt
              ? { startedAt: s.currentGame.startedAt }
              : {}),
          }
        : null,
      uptimeSec: s.uptimeSec,
      ffmpegFps: Math.min(240, Math.max(0, Math.round(s.ffmpegFps))),
      ffmpegRestarts: s.ffmpegRestarts,
      gamesPlayed: s.gamesPlayed,
      dryRun: s.dryRun,
      lastRestartReason: s.lastRestartReason?.slice(0, 300) ?? null,
      lastRestartAt: s.lastRestartAt,
      appliedConfigVersion: this.appliedVersion,
      recentErrors: this.o.ring.list(),
    };
  }

  async report(): Promise<void> {
    try {
      await this.client.postStatus(this.buildStatus());
    } catch (err) {
      // Reporting is best effort; never affects the stream.
      this.o.log.warn('status report failed', {
        error: (err as Error).message,
      });
    }
  }
}

function bodyVersion(body: unknown): number {
  const v = (body as { version?: unknown } | null)?.version;
  return typeof v === 'number' ? v : -1;
}
