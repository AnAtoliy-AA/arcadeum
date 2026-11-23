#!/usr/bin/env node
'use strict';

/**
 * Dry run: pick (or force) ONE scenario and record it locally. Never posts,
 * never touches Postiz, never writes the variety history.
 *
 *   node scripts/shorts-factory/scenarios/dry-run.js
 *   node scripts/shorts-factory/scenarios/dry-run.js --format puzzle --theme cyberpunk
 *   node scripts/shorts-factory/scenarios/dry-run.js --game chess --format guess_the_move
 *   node scripts/shorts-factory/scenarios/dry-run.js --date 2026-12-01 --no-record
 *
 * Flags: --game --format --theme --date YYYY-MM-DD --out <dir> --no-record --json
 * Scene formats (puzzle, guess_the_move, replay formats) need only Playwright.
 * bot_match delegates to gameplay.js in --preview mode (needs the running app).
 */

const path = require('path');
const { spawnSync } = require('child_process');
const { pickForToday } = require('./picker');
const { dateKey } = require('./seed');
const {
  prepareScenario,
  recordPrepared,
  probeAvailability,
} = require('./runner');

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const date = arg('date') || dateKey();
  const available = await probeAvailability();
  const scenario = pickForToday({
    date,
    game: arg('game'),
    format: arg('format'),
    theme: arg('theme'),
    available,
  });
  const prepared = await prepareScenario(scenario);
  const final = prepared.scenario;
  const summary = {
    id: final.id,
    format: final.format,
    game: final.game,
    theme: final.theme,
    hook: final.hook,
    voiceScript: final.voiceScript,
    dramaticMoment: final.dramaticMoment,
    seed: final.seed,
    fellBack: Boolean(prepared.fellBack),
  };
  console.log(JSON.stringify(summary, null, 2));
  if (process.argv.includes('--no-record')) return;

  if (!prepared.html) {
    const r = spawnSync(
      'node',
      [
        path.join(__dirname, '..', 'gameplay.js'),
        '--preview',
        '--short-only',
        '--game',
        final.game,
        '--theme',
        final.theme,
        '--seed',
        String(final.seed),
      ],
      { stdio: 'inherit' },
    );
    process.exit(r.status || 0);
  }
  const outDir =
    arg('out') || path.join(__dirname, '..', '..', '..', 'output', 'dry-run');
  const rec = await recordPrepared(prepared, {
    outDir,
    log: (level, msg) => console.error(`[${level}] ${msg}`),
  });
  console.log(
    `Recorded ${rec.videoPath} (${(rec.durationMs / 1000).toFixed(1)}s, marker at ${rec.dramaticMomentMs}ms). Nothing was posted.`,
  );
}

main().catch((err) => {
  console.error('dry-run failed:', err.message);
  process.exit(1);
});
