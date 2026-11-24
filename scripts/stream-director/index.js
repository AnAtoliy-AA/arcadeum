#!/usr/bin/env node
'use strict';

/**
 * Arcadeum stream director entry point.
 *
 *   node scripts/stream-director/index.js            live (needs STREAM_RTMP_URL) or dry run
 *   node scripts/stream-director/index.js --dry-run  force dry run
 *   node scripts/stream-director/index.js --stub     use the local stub BE + scenes
 */

try {
  require('dotenv').config({
    path: require('path').join(__dirname, '..', '..', '.env'),
  });
} catch {
  /* dotenv is optional */
}

const { loadConfig } = require('./config');
const { validateGames } = require('./games');
const { createLogger } = require('./log');
const { Health } = require('./health');
const { createAlerter } = require('./alerts');
const { isKilled } = require('./killSwitch');
const { createPipeline } = require('./pipeline');

async function main() {
  const log = createLogger();
  const config = loadConfig(process.env, process.argv.slice(2));
  const problems = validateGames(config.director.games);
  if (problems.length) {
    log.error('invalid game config', { problems });
    process.exit(2);
  }

  let stub = null;
  if (config.stub) {
    stub = await require('./stubServer').startStub({ log });
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

  let pipeline = null;
  let shuttingDown = false;
  const stopPipeline = async () => {
    if (!pipeline) return;
    const p = pipeline;
    pipeline = null;
    await p.stop();
  };
  const shutdown = async (reason, code = 0) => {
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
  const tick = async () => {
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

main().catch((err) => {
  console.error(
    JSON.stringify({ level: 'error', msg: 'fatal', error: err.message }),
  );
  process.exit(1);
});
