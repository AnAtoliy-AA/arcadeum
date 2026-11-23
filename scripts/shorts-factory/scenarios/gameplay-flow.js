'use strict';

/**
 * Glue between gameplay.js and the scenario modules, kept out of gameplay.js
 * so that file does not keep growing.
 */

const fs = require('fs');
const path = require('path');
const { pickForToday } = require('./picker');
const { recordScenario } = require('./history');
const {
  prepareScenario,
  recordPrepared,
  probeAvailability,
} = require('./runner');
const { buildScenario } = require('./library');
const { dateKey } = require('./seed');
const { FORMATS } = require('./constants');

/** Mobile short capture: 540x960 CSS px recorded at 1080x1920 (fills 9:16, no letterbox). */
const MOBILE_VIEWPORT = { width: 540, height: 960 };
const MOBILE_VIDEO_SIZE = { width: 1080, height: 1920 };

async function withRetry(
  fn,
  { retries = 2, label = 'task', log = () => {}, delayMs = 2000 } = {},
) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      log(
        'warn',
        `${label} failed (attempt ${attempt + 1}/${retries + 1}): ${err.message}`,
      );
      if (attempt < retries)
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
  throw lastError;
}

/**
 * Choose today's scenario. Explicit --game keeps the classic bot_match unless
 * --format says otherwise. The result is always a valid scenario; scene
 * formats have their data resolved (with fallback to bot_match).
 */
async function chooseScenario({ args, gameNames, log, date = dateKey() }) {
  const available = await probeAvailability().catch(() => ({
    replay: false,
    puzzle: true,
  }));
  if (args.format && !FORMATS.includes(args.format)) {
    log('warn', `Unknown --format "${args.format}", ignoring`);
  }
  const format =
    args.format && FORMATS.includes(args.format)
      ? args.format
      : args.game
        ? 'bot_match'
        : undefined;
  const scenario = pickForToday({
    date,
    game: args.game && gameNames.includes(args.game) ? args.game : undefined,
    format,
    theme: args.theme || undefined,
    available,
    salt: args.seed ? String(args.seed) : '',
  });
  const prepared = await prepareScenario(scenario);
  if (prepared.fellBack)
    log(
      'warn',
      `No replay data for ${scenario.format}, falling back to bot_match`,
    );
  return { prepared, date };
}

/** Sidecar for the render step (worker A): hook, voice, dramatic marker in output seconds. */
function writeSidecar(videoPath, scenario, extra = {}) {
  const file = videoPath.replace(/\.[^.]+$/, '') + '.scenario.json';
  const dramaticMomentSec =
    typeof extra.dramaticMomentMs === 'number'
      ? extra.dramaticMomentMs / 1000
      : null;
  fs.writeFileSync(
    file,
    JSON.stringify(
      {
        id: scenario.id,
        game: scenario.game,
        format: scenario.format,
        theme: scenario.theme,
        hook: scenario.hook,
        voiceScript: scenario.voiceScript,
        dramaticMoment: scenario.dramaticMoment,
        dramaticMomentSec,
        seed: scenario.seed,
      },
      null,
      2,
    ),
  );
  return file;
}

function markPublished(scenario, date) {
  try {
    recordScenario(scenario, date);
  } catch {
    // history is best effort; never fail a post over it
  }
}

module.exports = {
  MOBILE_VIEWPORT,
  MOBILE_VIDEO_SIZE,
  withRetry,
  chooseScenario,
  writeSidecar,
  markPublished,
  recordPrepared,
  buildScenario,
  path,
};
