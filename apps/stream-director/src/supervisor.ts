import { isKilled } from './killSwitch';
import type { Pipeline } from './pipeline';
import type { Health } from './health';
import type { Alert, Logger, StreamConfig } from './types';

export interface SupervisorOptions {
  config: Pick<StreamConfig, 'ops'>;
  log: Logger;
  health: Pick<Health, 'update'>;
  alert: Alert;
  createPipeline: () => Pipeline;
  /** Called when a dry run finished on its own. */
  onFinished?: () => void;
  killed?: (ops: StreamConfig['ops']) => boolean;
}

/**
 * Owns the pipeline lifecycle. The stream runs only while neither the local
 * kill switch file nor the remote "enabled" flag says stop. The kill file
 * always wins and always stops immediately, exactly as before; a remote stop
 * can be graceful (finish the running game first).
 */
export class Supervisor {
  pipeline: Pipeline | null = null;
  remoteEnabled = true;
  remoteGraceful = false;
  private ticking = false;
  private readonly killed: (ops: StreamConfig['ops']) => boolean;

  constructor(private readonly o: SupervisorOptions) {
    this.killed = o.killed ?? ((ops) => isKilled(ops));
  }

  /** Desired state from the admin settings or a start/stop command. */
  setRemote(enabled: boolean, graceful: boolean): void {
    this.remoteEnabled = enabled;
    this.remoteGraceful = graceful;
  }

  markFfmpegDirty(): void {
    this.pipeline?.markFfmpegDirty();
  }

  /** Admin command. False when there is no running game to skip. */
  skip(): boolean {
    const d = this.pipeline?.director;
    if (!d || !d.inGame) return false;
    d.skipCurrent();
    return true;
  }

  async restartBrowser(): Promise<boolean> {
    const d = this.pipeline?.director;
    if (!d) return false;
    await d.restartBrowser();
    return true;
  }

  async tick(): Promise<void> {
    if (this.ticking) return;
    this.ticking = true;
    try {
      await this.reconcile();
    } finally {
      this.ticking = false;
    }
  }

  private async reconcile(): Promise<void> {
    const { log, health, alert } = this.o;
    const killed = this.killed(this.o.config.ops);
    if (killed) {
      if (this.pipeline) {
        log.warn('kill switch active, stopping stream');
        await alert('kill-switch', 'Kill switch active: stream stopped');
        await this.stopPipeline();
      }
      health.update({ state: 'killed', killed: true, currentGame: null });
      return;
    }
    health.update({ killed: false });

    if (!this.remoteEnabled) {
      const p = this.pipeline;
      if (!p) {
        health.update({ state: 'stopped', currentGame: null });
        return;
      }
      if (this.remoteGraceful && p.director.inGame) {
        // Finish the running game, then stop (see Director.onDrained).
        p.director.onDrained = () => void this.drained();
        p.director.requestStopAfterGame();
        health.update({ state: 'stopping' });
        return;
      }
      log.info('stopping stream (admin)');
      await this.stopPipeline();
      health.update({ state: 'stopped', currentGame: null });
      return;
    }

    if (this.pipeline) {
      this.pipeline.director.cancelStopAfterGame();
      return;
    }
    const p = this.o.createPipeline();
    this.pipeline = p;
    await p.start(this.o.onFinished);
  }

  private async drained(): Promise<void> {
    this.o.log.info('graceful stop: game finished, stopping stream');
    await this.stopPipeline();
    this.o.health.update({ state: 'stopped', currentGame: null });
  }

  async stopPipeline(): Promise<void> {
    const p = this.pipeline;
    this.pipeline = null;
    await p?.stop();
  }
}
