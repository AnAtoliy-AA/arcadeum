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
import { createPipeline } from './pipeline';
import { createApi } from './api';
import { ControlLoop } from './control';
import { createControlClient } from './controlClient';
import { ErrorRing, withErrorRing } from './errorRing';
import { Supervisor } from './supervisor';
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

  const ring = new ErrorRing(10);
  const rlog = withErrorRing(log, ring);

  let shuttingDown = false;
  const supervisor = new Supervisor({
    config,
    log: rlog,
    health,
    alert,
    createPipeline: () => createPipeline({ config, log: rlog, health, alert }),
    onFinished: () => void shutdown('dry run finished'),
  });
  let control: ControlLoop | null = null;

  const shutdown = async (reason: string, code = 0): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    log.info('shutting down', { reason });
    control?.stop();
    await supervisor.stopPipeline();
    await stub?.close();
    health.update({ state: 'stopped' });
    process.exit(code);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  if (config.control.enabled) {
    const api = createApi({ be: config.be });
    control = new ControlLoop({
      config,
      client: createControlClient({
        baseUrl: config.be.url,
        serviceToken: config.control.serviceToken,
        getToken: (force) => api.getToken(force),
      }),
      supervisor,
      health,
      ring,
      log: rlog,
      alert,
    });
    log.info('admin control enabled', {
      auth: config.control.serviceToken ? 'service-token' : 'stream-user-jwt',
    });
  } else {
    log.info('admin control disabled (local settings only)');
  }

  // The kill switch file stops the stream gracefully within about 3s and
  // keeps the process alive (so systemd does not flap); removing it resumes.
  // The remote "enabled" flag is reconciled by the same supervisor.
  await supervisor.tick();
  setInterval(() => void supervisor.tick(), config.ops.killPollMs);
  control?.start();
}

main().catch((err: Error) => {
  const kind = err instanceof ConfigError ? 'config' : 'fatal';
  console.error(
    JSON.stringify({ level: 'error', msg: kind, error: err.message }),
  );
  process.exit(err instanceof ConfigError ? 2 : 1);
});
