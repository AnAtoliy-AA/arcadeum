#!/usr/bin/env node

/**
 * Daily Shorts Runner
 *
 * Automatically alternates between Gameplay Shorts (Sea Battle, Chess, Checkers,
 * Tic-Tac-Toe, Cascade, Critical) and App Showcase Shorts (browsing, themes, leaderboards)
 * for daily automated publishing across YouTube Shorts, Instagram Reels, TikTok, and X.
 */

const { spawn } = require('child_process');
const path = require('path');

const isPreview = process.argv.includes('--preview');
const targetGame = process.argv.find(
  (arg, i, arr) => arr[i - 1] === '--game' || arr[i - 1] === '-g',
);

// 60% chance gameplay match short, 40% chance feature showcase short
const runGameplay = targetGame || Math.random() < 0.6;

const scriptToRun = runGameplay
  ? path.join(__dirname, 'gameplay.js')
  : path.join(__dirname, 'factory.js');

const args = [];
if (isPreview) args.push('--preview');
if (targetGame) args.push('--game', targetGame);

console.log(
  `[DAILY SHORTS RUNNER] Starting ${runGameplay ? 'Gameplay Match Short' : 'App Showcase Short'}...`,
);
console.log(
  `[DAILY SHORTS RUNNER] Running: node ${path.basename(scriptToRun)} ${args.join(' ')}`,
);

const proc = spawn('node', [scriptToRun, ...args], {
  stdio: 'inherit',
  env: process.env,
});

proc.on('close', (code) => {
  if (code === 0) {
    console.log(
      '[DAILY SHORTS RUNNER] Successfully completed daily short pipeline.',
    );
    process.exit(0);
  } else {
    console.error(`[DAILY SHORTS RUNNER] Failed with exit code ${code}`);
    process.exit(code);
  }
});
