/**
 * Arcadeum stream director entry point.
 *
 *   node dist/index.js            live (needs STREAM_RTMP_URL) or dry run
 *   node dist/index.js --dry-run  force dry run
 *   node dist/index.js --stub     use the local stub BE + scenes
 */
import * as path from 'path';
import { ConfigError, loadConfig } from './config';
import { validateGames } from './games';
import { createLogger } from './log';
import { Health } from './health';
import { createAlerter } from './alerts';
import { isKilled } from './killSwitch';
import { createPipeline } from './pipeline';
import type { Pipeline } from './pipeline';
import { startStub } from './stubServer';
import type { StubServer } from './stubServer';

function loadDotenv(): void {
  try {
    // dist/ -> app -> apps -> repo root (.env is optional)
    process.loadEnvFile(path.join(__dirname, '..', '..', '..', '.env'));
  } catch {
    /* no .env file */
  }
}

async function main(): Promise<void> {
  loadDotenv();
  const log = createLogger();
  const config = loadConfig(process.env, process.argv.slice(2));
  const problems = validateGames(config.director.games);
  if (problems.length) {
    log.error('invalid game config', { problems });
    process.exit(2);
  }

  let stub: StubServer | null = null;
  if (config.stub) {
    stub = await startStub({ log });
    config.web.baseUrl = stub.url;
    config.be.url = stub.url;
    config.be.password ||= 'stub';
  }

  const health = new Health({ statusFile: config.ops.statusFile });
  health.update({ dryRun: config.dryRun });
  health.serve(config.ops.statusPort);
  const alert = createAlerter({
    url: config.ops.alertUrl,
    cooldownMs: config.ops.alertCooldownMs,
    log,
  });

  log.info('stream director starting', {
    mode: config.dryRun ? 'dry-run' : 'live',
    profile: config.profileName,
    resolution: `${config.profile.width}x${config.profile.height}@${config.profile.fps}`,
    capture: config.capture.mode,
  });

  let pipeline: Pipeline | null = null;
  let shuttingDown = false;
  const stopPipeline = async (): Promise<void> => {
    const p = pipeline;
    pipeline = null;
    await p?.stop();
  };
  const shutdown = async (reason: string, code = 0): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    log.info('shutting down', { reason });
    await stopPipeline();
    await stub?.close();
    health.update({ state: 'stopped' });
    process.exit(code);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  // Supervisor: the kill switch stops streaming gracefully and keeps the
  // process alive (so systemd does not flap); removing the flag resumes.
  const tick = async (): Promise<void> => {
    if (shuttingDown) return;
    const killed = isKilled(config.ops);
    if (killed && pipeline) {
      log.warn('kill switch active, stopping stream');
      await alert('kill-switch', 'Kill switch active: stream stopped');
      await stopPipeline();
      health.update({ state: 'killed', killed: true, currentGame: null });
    } else if (!killed && !pipeline) {
      health.update({ killed: false });
      pipeline = createPipeline({ config, log, health, alert });
      await pipeline.start(() => void shutdown('dry run finished'));
    }
  };
  await tick();
  setInterval(() => void tick(), config.ops.killPollMs);
}

main().catch((err: Error) => {
  const kind = err instanceof ConfigError ? 'config' : 'fatal';
  console.error(
    JSON.stringify({ level: 'error', msg: kind, error: err.message }),
  );
  process.exit(err instanceof ConfigError ? 2 : 1);
});
