#!/usr/bin/env node

/**
 * Daily Shorts Runner
 *
 * Runs BOTH daily shorts pipelines by default:
 *   1. Gameplay Short (Sea Battle, Chess, Checkers, Tic-Tac-Toe, Cascade, Critical, Backgammon, etc.)
 *   2. App Showcase Short (Catalog, themes, features, social, tournaments)
 *
 * Automatically publishes across YouTube Shorts, Instagram Reels, TikTok, and X.
 *
 * Flags:
 *   --preview        Preview mode (no posting)
 *   --gameplay-only  Run only gameplay shorts pipeline
 *   --showcase-only  Run only app showcase shorts pipeline
 *   --game <name>    Run gameplay shorts for a specific game
 */

const { spawn } = require('child_process');
const path = require('path');

const isPreview = process.argv.includes('--preview');
const isGameplayOnly = process.argv.includes('--gameplay-only');
const isShowcaseOnly = process.argv.includes('--showcase-only');
const targetGame = process.argv.find(
  (arg, i, arr) => arr[i - 1] === '--game' || arr[i - 1] === '-g',
);

function runScript(scriptPath, extraArgs = []) {
  return new Promise((resolve) => {
    const scriptName = path.basename(scriptPath);
    console.log(
      `\n============================================================`,
    );
    console.log(
      `[DAILY RUNNER] Starting: ${scriptName} ${extraArgs.join(' ')}`,
    );
    console.log(
      `============================================================\n`,
    );

    const proc = spawn('node', [scriptPath, ...extraArgs], {
      stdio: 'inherit',
      env: process.env,
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`\n[DAILY RUNNER] ✓ Successfully completed ${scriptName}`);
        resolve(true);
      } else {
        console.error(
          `\n[DAILY RUNNER] ✗ ${scriptName} exited with code ${code}`,
        );
        resolve(false);
      }
    });

    proc.on('error', (err) => {
      console.error(
        `\n[DAILY RUNNER] ✗ Failed to start ${scriptName}:`,
        err.message,
      );
      resolve(false);
    });
  });
}

async function main() {
  console.log(
    `\n🚀 [DAILY SHORTS RUNNER] Starting Daily Publishing Pipeline...`,
  );
  const startTime = Date.now();
  const results = [];

  const baseArgs = [];
  if (isPreview) baseArgs.push('--preview');

  const shouldRunGameplay = !isShowcaseOnly;
  const shouldRunShowcase = !isGameplayOnly && !targetGame;

  // 1. Run Gameplay Shorts Pipeline
  if (shouldRunGameplay) {
    const gameplayArgs = [...baseArgs];
    if (targetGame) gameplayArgs.push('--game', targetGame);
    const gameplaySuccess = await runScript(
      path.join(__dirname, 'gameplay.js'),
      gameplayArgs,
    );
    results.push({ name: 'Gameplay Short', success: gameplaySuccess });
  }

  // 2. Run App Showcase Pipeline
  if (shouldRunShowcase) {
    const showcaseSuccess = await runScript(
      path.join(__dirname, 'factory.js'),
      baseArgs,
    );
    results.push({ name: 'App Showcase Short', success: showcaseSuccess });
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n============================================================`);
  console.log(`[DAILY RUNNER] Finished in ${durationSec}s. Summary:`);
  for (const r of results) {
    console.log(`  - ${r.name}: ${r.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  }
  console.log(`============================================================\n`);

  const allPassed = results.every((r) => r.success);
  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('[DAILY RUNNER] Unexpected error:', err);
  process.exit(1);
});
