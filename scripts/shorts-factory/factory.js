#!/usr/bin/env node

/**
 * Shorts Factory - Automated Short-Form Video Generator
 *
 * Generates a 5-10 second 9:16 vertical short-form video of random
 * browsing across the Arcadeum app, injects random audio, applies
 * fade-out, and prepares for automated posting via Postiz scheduler.
 *
 * Usage:
 *   node scripts/shorts-factory/factory.js
 *
 * Requirements:
 *   - Playwright with Chromium
 *   - FFmpeg installed on system
 *   - xvfb-run for headless display (Linux)
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const { readdir, unlink, mkdir, stat, readFile } = require('fs/promises');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Video dimensions (9:16 vertical)
  viewport: {
    width: 1080,
    height: 1920,
  },

  // Base URL
  baseUrl: 'https://arcadeum.games',

  // Directories
  rawCapturesDir: path.join(__dirname, '..', '..', 'raw_captures'),
  outputDir: path.join(__dirname, '..', '..', 'output'),

  // Video settings
  videoDuration: { min: 5, max: 10 }, // seconds (randomized)
  fadeOutDuration: 2, // seconds
  fadeOutStartOffset: 2, // seconds before end to start fade

  // Postiz API
  postizBaseUrl:
    process.env.POSTIZ_BASE_URL ||
    'https://postiz.arcadeum.games/api/public/v1',
  postizApiKey: process.env.POSTIZ_API_KEY || '',
  postizIntegrationId: process.env.POSTIZ_YOUTUBE_INTEGRATION_ID || '',
};

// ============================================================================
// CAPTIONS POOL
// ============================================================================

const CAPTIONS = [
  'Check out this awesome gaming platform! 🎮',
  'Play games, win rewards, have fun! 🏆',
  'The future of blockchain gaming is here ⚡',
  'Join the arcade revolution! 🕹️',
  'Free to play, easy to win 💰',
  'Gaming meets Web3 - experience the difference 🚀',
  'Your next favorite game is waiting 🎯',
  'Play. Compete. Earn. Repeat! 🔄',
];

// ============================================================================
// SCENARIOS - 30 pre-defined user journeys (one per day, no repeats)
// ============================================================================

const SCENARIOS = [
  // --- Week 1: Game Discovery ---
  { name: 'gameExplorer', caption: 'Which game will you play first? 🎮', steps: [
    { type: 'navigate', url: '/en/games', wait: 2500 }, { type: 'scroll', y: 300, wait: 800 },
    { type: 'scroll', y: 400, wait: 600 }, { type: 'click', x: 540, y: 800, wait: 3000 },
    { type: 'scroll', y: 200, wait: 800 }, { type: 'scroll', y: -100, wait: 600 },
  ]},
  { name: 'seaBattleIntro', caption: 'Sea Battle - classic naval warfare ⚓', steps: [
    { type: 'navigate', url: '/en/games', wait: 2500 }, { type: 'scroll', y: 200, wait: 600 },
    { type: 'click', x: 540, y: 600, wait: 3000 }, { type: 'scroll', y: 200, wait: 800 },
    { type: 'hover', x: 300, y: 900, wait: 1000 }, { type: 'hover', x: 780, y: 900, wait: 1000 },
  ]},
  { name: 'criticalClicks', caption: 'Critical - how fast can you react? ⚡', steps: [
    { type: 'navigate', url: '/en/games/critical', wait: 3000 }, { type: 'scroll', y: 200, wait: 800 },
    { type: 'click', x: 540, y: 800, wait: 2000 }, { type: 'hover', x: 540, y: 600, wait: 1500 },
    { type: 'scroll', y: 150, wait: 600 }, { type: 'click', x: 540, y: 1000, wait: 2000 },
  ]},
  { name: 'tictactoeFun', caption: 'Tic Tac Toe - classic battle of minds ❌⭕', steps: [
    { type: 'navigate', url: '/en/games/tic-tac-toe', wait: 3000 }, { type: 'scroll', y: 200, wait: 800 },
    { type: 'click', x: 360, y: 700, wait: 800 }, { type: 'click', x: 540, y: 900, wait: 800 },
    { type: 'click', x: 720, y: 700, wait: 1500 }, { type: 'scroll', y: 200, wait: 600 },
  ]},

  { name: 'cascadeChaos', caption: 'Cascade - match and conquer 🎲', steps: [
    { type: 'navigate', url: '/en/games/cascade', wait: 3000 }, { type: 'scroll', y: 200, wait: 800 },
    { type: 'click', x: 350, y: 750, wait: 800 }, { type: 'click', x: 540, y: 850, wait: 800 },
    { type: 'click', x: 730, y: 750, wait: 1500 }, { type: 'scroll', y: 200, wait: 600 },
  ]},
  { name: 'createYourGame', caption: 'Create your own game on Arcadeum! 🛠️', steps: [
    { type: 'navigate', url: '/en/games/create', wait: 3000 }, { type: 'scroll', y: 250, wait: 800 },
    { type: 'hover', x: 540, y: 700, wait: 1000 }, { type: 'scroll', y: 300, wait: 600 },
    { type: 'click', x: 540, y: 900, wait: 2000 }, { type: 'scroll', y: 150, wait: 600 },
  ]},

  // --- Week 2: Social & Community ---
  { name: 'leaderboardClimb', caption: 'Top players on Arcadeum 🏆', steps: [
    { type: 'navigate', url: '/en/leaderboards', wait: 2500 }, { type: 'scroll', y: 200, wait: 800 },
    { type: 'hover', x: 540, y: 600, wait: 1200 }, { type: 'scroll', y: 300, wait: 800 },
    { type: 'hover', x: 540, y: 800, wait: 1000 }, { type: 'scroll', y: 250, wait: 800 },
  ]},
  { name: 'communityBuzz', caption: 'Join the Arcadeum community! 💬', steps: [
    { type: 'navigate', url: '/en/community', wait: 2500 }, { type: 'scroll', y: 300, wait: 800 },
    { type: 'hover', x: 540, y: 700, wait: 1000 }, { type: 'scroll', y: 350, wait: 600 },
    { type: 'scroll', y: 300, wait: 800 }, { type: 'hover', x: 540, y: 600, wait: 1000 },
  ]},
  { name: 'tournamentTime', caption: 'Compete in tournaments! 🏅', steps: [
    { type: 'navigate', url: '/en/tournaments', wait: 2500 }, { type: 'scroll', y: 250, wait: 800 },
    { type: 'click', x: 540, y: 700, wait: 3000 }, { type: 'scroll', y: 200, wait: 800 },
    { type: 'hover', x: 540, y: 900, wait: 1000 }, { type: 'scroll', y: 150, wait: 600 },
  ]},
  { name: 'chatHighlights', caption: 'Real-time chats with fellow gamers 🗣️', steps: [
    { type: 'navigate', url: '/en/community', wait: 2500 }, { type: 'scroll', y: 200, wait: 800 },
    { type: 'click', x: 540, y: 600, wait: 2500 }, { type: 'scroll', y: 200, wait: 600 },
    { type: 'hover', x: 540, y: 800, wait: 1000 }, { type: 'scroll', y: 150, wait: 600 },
  ]},
  { name: 'playerProfiles', caption: 'Check out top player profiles 👤', steps: [
    { type: 'navigate', url: '/en/leaderboards', wait: 2500 }, { type: 'scroll', y: 200, wait: 600 },
    { type: 'click', x: 540, y: 500, wait: 3000 }, { type: 'scroll', y: 250, wait: 800 },
    { type: 'hover', x: 540, y: 700, wait: 1000 }, { type: 'scroll', y: 200, wait: 600 },
  ]},
  { name: 'statsDeepDive', caption: 'Your gaming stats, all in one place 📊', steps: [
    { type: 'navigate', url: '/en/stats', wait: 2500 }, { type: 'scroll', y: 300, wait: 800 },
    { type: 'hover', x: 540, y: 700, wait: 1200 }, { type: 'scroll', y: 250, wait: 600 },
    { type: 'scroll', y: 300, wait: 800 }, { type: 'hover', x: 540, y: 600, wait: 1000 },
  ]},
  { name: 'referralRewards', caption: 'Invite friends, earn rewards! 🎁', steps: [
    { type: 'navigate', url: '/en/referrals', wait: 2500 }, { type: 'scroll', y: 250, wait: 800 },
    { type: 'hover', x: 540, y: 700, wait: 1000 }, { type: 'scroll', y: 300, wait: 600 },
    { type: 'click', x: 540, y: 900, wait: 2000 }, { type: 'scroll', y: 150, wait: 600 },
  ]},

  // --- Week 3: Rewards & Economy ---
  { name: 'rewardHunter', caption: 'Earn rewards while you play! 💰', steps: [
    { type: 'navigate', url: '/en/rewards', wait: 2500 }, { type: 'scroll', y: 300, wait: 800 },
    { type: 'scroll', y: 350, wait: 600 }, { type: 'hover', x: 540, y: 700, wait: 1200 },
    { type: 'scroll', y: 250, wait: 800 }, { type: 'click', x: 540, y: 800, wait: 2000 },
  ]},
  { name: 'shopWindow', caption: 'Check out the Arcadeum shop! 🛒', steps: [
    { type: 'navigate', url: '/en/shop', wait: 2500 }, { type: 'scroll', y: 350, wait: 800 },
    { type: 'scroll', y: 300, wait: 600 }, { type: 'hover', x: 540, y: 700, wait: 1000 },
    { type: 'scroll', y: 250, wait: 800 }, { type: 'click', x: 540, y: 900, wait: 2000 },
  ]},
  { name: 'shopInventory', caption: 'Your inventory awaits! 🎒', steps: [
    { type: 'navigate', url: '/en/shop/inventory', wait: 2500 }, { type: 'scroll', y: 300, wait: 800 },
    { type: 'hover', x: 540, y: 600, wait: 1200 }, { type: 'scroll', y: 250, wait: 600 },
    { type: 'click', x: 540, y: 800, wait: 2000 }, { type: 'scroll', y: 150, wait: 600 },
  ]},
  { name: 'walletWatch', caption: 'Track your tokens in the wallet 💎', steps: [
    { type: 'navigate', url: '/en/wallet', wait: 2500 }, { type: 'scroll', y: 250, wait: 800 },
    { type: 'hover', x: 540, y: 700, wait: 1200 }, { type: 'scroll', y: 300, wait: 600 },
    { type: 'scroll', y: 200, wait: 800 }, { type: 'hover', x: 540, y: 600, wait: 1000 },
  ]},
  { name: 'tokenInfo', caption: 'Learn about the Arcadeum token 🪙', steps: [
    { type: 'navigate', url: '/en/token', wait: 2500 }, { type: 'scroll', y: 300, wait: 800 },
    { type: 'hover', x: 540, y: 700, wait: 1200 }, { type: 'scroll', y: 250, wait: 600 },
    { type: 'scroll', y: 350, wait: 800 }, { type: 'hover', x: 540, y: 600, wait: 1000 },
  ]},
  { name: 'battlePass', caption: 'Battle Pass - unlock exclusive rewards! 🎫', steps: [
    { type: 'navigate', url: '/en/battle-pass', wait: 2500 }, { type: 'scroll', y: 300, wait: 800 },
    { type: 'hover', x: 540, y: 700, wait: 1200 }, { type: 'scroll', y: 250, wait: 600 },
    { type: 'click', x: 540, y: 900, wait: 2000 }, { type: 'scroll', y: 150, wait: 600 },
  ]},
  { name: 'shopBrowse', caption: 'So many items to choose from! 🎨', steps: [
    { type: 'navigate', url: '/en/shop', wait: 2500 }, { type: 'scroll', y: 200, wait: 600 },
    { type: 'hover', x: 300, y: 600, wait: 800 }, { type: 'hover', x: 780, y: 600, wait: 800 },
    { type: 'scroll', y: 300, wait: 600 }, { type: 'hover', x: 540, y: 800, wait: 1000 },
  ]},

  // --- Week 4: Exploration & Flow ---
  { name: 'homepageTour', caption: 'Welcome to Arcadeum! 🚀', steps: [
    { type: 'navigate', url: '/en', wait: 3000 }, { type: 'scroll', y: 400, wait: 800 },
    { type: 'scroll', y: 500, wait: 600 }, { type: 'hover', x: 540, y: 700, wait: 1000 },
    { type: 'scroll', y: 300, wait: 800 }, { type: 'click', x: 540, y: 900, wait: 2500 },
  ]},
  { name: 'blogRead', caption: 'Read the latest from Arcadeum 📰', steps: [
    { type: 'navigate', url: '/en/blog', wait: 2500 }, { type: 'scroll', y: 300, wait: 800 },
    { type: 'click', x: 540, y: 600, wait: 3000 }, { type: 'scroll', y: 250, wait: 600 },
    { type: 'scroll', y: 300, wait: 800 }, { type: 'scroll', y: 200, wait: 600 },
  ]},
  { name: 'multiPageFlow', caption: 'So much to explore on Arcadeum! ✨', steps: [
    { type: 'navigate', url: '/en/games', wait: 2500 }, { type: 'scroll', y: 300, wait: 800 },
    { type: 'navigate', url: '/en/leaderboards', wait: 2500 }, { type: 'scroll', y: 250, wait: 600 },
    { type: 'navigate', url: '/en/shop', wait: 2500 }, { type: 'scroll', y: 300, wait: 800 },
  ]},
  { name: 'gameToLeaderboard', caption: 'Play games, climb the leaderboard! 📈', steps: [
    { type: 'navigate', url: '/en/games', wait: 2500 }, { type: 'scroll', y: 250, wait: 600 },
    { type: 'click', x: 540, y: 700, wait: 2500 }, { type: 'navigate', url: '/en/leaderboards', wait: 2500 },
    { type: 'scroll', y: 200, wait: 800 }, { type: 'hover', x: 540, y: 600, wait: 1000 },
  ]},
  { name: 'shopToRewards', caption: 'Shop and earn rewards! 🛍️', steps: [
    { type: 'navigate', url: '/en/shop', wait: 2500 }, { type: 'scroll', y: 300, wait: 800 },
    { type: 'scroll', y: 250, wait: 600 }, { type: 'navigate', url: '/en/rewards', wait: 2500 },
    { type: 'scroll', y: 300, wait: 800 }, { type: 'hover', x: 540, y: 700, wait: 1000 },
  ]},
  { name: 'communityToTournament', caption: 'From community to tournament! 🏆', steps: [
    { type: 'navigate', url: '/en/community', wait: 2500 }, { type: 'scroll', y: 250, wait: 800 },
    { type: 'hover', x: 540, y: 600, wait: 1000 }, { type: 'navigate', url: '/en/tournaments', wait: 2500 },
    { type: 'scroll', y: 200, wait: 600 }, { type: 'click', x: 540, y: 700, wait: 2500 },
  ]},
  { name: 'settingsCheck', caption: 'Customize your Arcadeum experience ⚙️', steps: [
    { type: 'navigate', url: '/en/settings', wait: 2500 }, { type: 'scroll', y: 250, wait: 800 },
    { type: 'hover', x: 540, y: 600, wait: 1200 }, { type: 'scroll', y: 300, wait: 600 },
    { type: 'hover', x: 540, y: 800, wait: 1000 }, { type: 'scroll', y: 200, wait: 600 },
  ]},
  { name: 'developersPortal', caption: 'Build on Arcadeum - developers welcome! 👨‍💻', steps: [
    { type: 'navigate', url: '/en/developers', wait: 2500 }, { type: 'scroll', y: 300, wait: 800 },
    { type: 'hover', x: 540, y: 700, wait: 1200 }, { type: 'scroll', y: 250, wait: 600 },
    { type: 'scroll', y: 350, wait: 800 }, { type: 'hover', x: 540, y: 600, wait: 1000 },
  ]},
  { name: 'historyReplay', caption: 'Relive your best game moments 🎬', steps: [
    { type: 'navigate', url: '/en/history', wait: 2500 }, { type: 'scroll', y: 300, wait: 800 },
    { type: 'click', x: 540, y: 600, wait: 3000 }, { type: 'scroll', y: 200, wait: 600 },
    { type: 'hover', x: 540, y: 800, wait: 1000 }, { type: 'scroll', y: 150, wait: 600 },
  ]},
  { name: 'contactPage', caption: 'Get in touch with the team! 📬', steps: [
    { type: 'navigate', url: '/en/contact', wait: 2500 }, { type: 'scroll', y: 250, wait: 800 },
    { type: 'hover', x: 540, y: 600, wait: 1200 }, { type: 'scroll', y: 300, wait: 600 },
    { type: 'hover', x: 540, y: 800, wait: 1000 }, { type: 'scroll', y: 200, wait: 600 },
  ]},
];

// ============================================================================
// AUDIO TRACKS (same as in-game music player)
// ============================================================================

const CDN_BASE = process.env.SHORTS_CDN_URL;
const MUSIC_FOLDER = 'music';
const MUSIC_CDN_URL = `${CDN_BASE}/${MUSIC_FOLDER}`;

const AUDIO_TRACKS = [
  `${MUSIC_CDN_URL}/battleship-grid.mp3`,
  `${MUSIC_CDN_URL}/battleship-grid-v2.mp3`,
  `${MUSIC_CDN_URL}/clockwork-horizon.mp3`,
  `${MUSIC_CDN_URL}/clockwork-horizon-v2.mp3`,
  `${MUSIC_CDN_URL}/glass-grid.mp3`,
  `${MUSIC_CDN_URL}/glass-grid-v2.mp3`,
  `${MUSIC_CDN_URL}/grid-of-torpedoes.mp3`,
  `${MUSIC_CDN_URL}/grid-of-torpedoes-v2.mp3`,
  `${MUSIC_CDN_URL}/gridline-armada.mp3`,
  `${MUSIC_CDN_URL}/gridline-armada-v2.mp3`,
  `${MUSIC_CDN_URL}/gridwater-clash.mp3`,
  `${MUSIC_CDN_URL}/gridwater-clash-v2.mp3`,
  `${MUSIC_CDN_URL}/iron-tide.mp3`,
  `${MUSIC_CDN_URL}/iron-tide-v2.mp3`,
  `${MUSIC_CDN_URL}/iron-wake.mp3`,
  `${MUSIC_CDN_URL}/iron-wake-v2.mp3`,
  `${MUSIC_CDN_URL}/iron-wake-v3.mp3`,
  `${MUSIC_CDN_URL}/saltwater-coordinates-v2.mp3`,
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Logs messages with timestamp for debugging
 */
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (data) {
    console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

/**
 * Returns a random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random element from an array
 */
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ensure directory exists, create if not
 */
async function ensureDir(dirPath) {
  try {
    await mkdir(dirPath, { recursive: true });
    log('info', `Directory ensured: ${dirPath}`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Get the latest file in a directory
 */
async function getLatestFile(dirPath) {
  const files = await readdir(dirPath);
  if (files.length === 0) {
    return null;
  }

  let latestFile = null;
  let latestTime = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileStat = await stat(filePath);
    if (fileStat.mtimeMs > latestTime) {
      latestTime = fileStat.mtimeMs;
      latestFile = filePath;
    }
  }

  return latestFile;
}

/**
 * Delete all files in a directory
 */
async function cleanDirectory(dirPath) {
  try {
    const files = await readdir(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      await unlink(filePath);
      log('info', `Deleted: ${filePath}`);
    }
  } catch (error) {
    log('warn', `Could not clean directory: ${dirPath}`, {
      error: error.message,
    });
  }
}

// ============================================================================
// PLAYWRIGHT AUTOMATION
// ============================================================================

/**
 * Waits for page content to be rendered (not just loading spinner)
 */
async function waitForContent(page, timeout = 10000) {
  try {
    await page.waitForFunction(
      () => {
        const body = document.body;
        if (!body) return false;
        return (body.innerText || '').length > 50;
      },
      { timeout },
    );
  } catch {
    // Continue even if timeout — page might still be usable
  }
}

/**
 * Executes a single scenario step
 */
async function executeStep(page, step) {
  switch (step.type) {
    case 'navigate': {
      const url = `${CONFIG.baseUrl}${step.url}`;
      log('info', `Step: Navigate to ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await waitForContent(page);
      if (step.wait) await sleep(step.wait);
      break;
    }
    case 'scroll': {
      log('info', `Step: Scroll ${step.y}px`);
      await page.mouse.wheel(0, step.y);
      if (step.wait) await sleep(step.wait);
      break;
    }
    case 'click': {
      log('info', `Step: Click at (${step.x}, ${step.y})`);
      await page.mouse.move(step.x, step.y, { steps: 5 });
      await sleep(200);
      await page.mouse.click(step.x, step.y);
      await waitForContent(page).catch(() => {});
      if (step.wait) await sleep(step.wait);
      break;
    }
    case 'hover': {
      log('info', `Step: Hover at (${step.x}, ${step.y})`);
      await page.mouse.move(step.x, step.y, { steps: 8 });
      if (step.wait) await sleep(step.wait);
      break;
    }
  }
}

/**
 * Captures video using a pre-defined scenario
 */
async function captureBrowsing() {
  log('info', 'Starting Playwright automation...');

  let browser = null;

  try {
    await ensureDir(CONFIG.rawCapturesDir);

    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    log('info', 'Browser launched successfully');

    const context = await browser.newContext({
      viewport: CONFIG.viewport,
      recordVideo: {
        dir: CONFIG.rawCapturesDir,
        size: CONFIG.viewport,
      },
    });
    log('info', 'Browser context created with video recording');

    const page = await context.newPage();
    log('info', 'New page created');

    // Pick a random scenario
    const scenario = randomElement(SCENARIOS);
    log('info', `Running scenario: ${scenario.name}`);
    log('info', `Caption will be: "${scenario.caption}"`);

    // Execute all steps in the scenario
    const startTime = Date.now();
    for (let i = 0; i < scenario.steps.length; i++) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= CONFIG.videoDuration.max * 1000) {
        log('info', `Max duration reached, stopping at step ${i + 1}`);
        break;
      }
      log('info', `Executing step ${i + 1}/${scenario.steps.length}`);
      await executeStep(page, scenario.steps[i]);
    }

    const finalDuration = Date.now() - startTime;
    log('info', `Scenario complete (${finalDuration}ms total)`);

    await context.close();
    log('info', 'Browser context closed, video saved');

    await browser.close();
    browser = null;
    log('info', 'Browser closed successfully');

    await sleep(1000);

    const latestVideo = await getLatestFile(CONFIG.rawCapturesDir);
    if (!latestVideo) {
      throw new Error('No video file found in raw captures directory');
    }

    log('info', `Raw video captured: ${latestVideo}`);
    return {
      videoPath: latestVideo,
      duration: finalDuration,
      caption: scenario.caption,
    };
  } catch (error) {
    log('error', 'Failed to capture browsing', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      log('info', 'Browser closed in finally block');
    }
  }
}

// ============================================================================
// FFMPEG VIDEO PROCESSING
// ============================================================================

/**
 * Processes the raw video with FFmpeg to add audio and trim to target duration
 */
async function processVideo(rawVideoPath, recordedDuration) {
  log('info', 'Starting FFmpeg video processing...');

  // Ensure output directory exists
  await ensureDir(CONFIG.outputDir);

  // Select a random audio track
  const audioTrack = randomElement(AUDIO_TRACKS);
  log('info', `Selected audio track: ${audioTrack}`);

  // Calculate trim duration (cap at 8 seconds for social media, or use recorded length)
  const trimDuration = Math.min(Math.ceil(recordedDuration / 1000), 8);
  const fadeOutStart = Math.max(0, trimDuration - CONFIG.fadeOutDuration);

  log(
    'info',
    `Trim duration: ${trimDuration}s, fade-out starts at: ${fadeOutStart}s`,
  );

  // Generate unique output filename
  const timestamp = Date.now();
  const outputPath = path.join(CONFIG.outputDir, `arcadeum-${timestamp}.mp4`);

  // Build FFmpeg command
  const ffmpegArgs = [
    '-i',
    rawVideoPath,
    '-i',
    audioTrack,
    '-t',
    String(trimDuration),
    '-af',
    `afade=t=out:st=${fadeOutStart}:d=${CONFIG.fadeOutDuration}`,
    '-c:v',
    'libx264',
    '-preset',
    'fast',
    '-crf',
    '23',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-y',
    '-shortest',
    outputPath,
  ];

  log('info', 'Executing FFmpeg command', { args: ffmpegArgs });

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    let stdout = '';
    let stderr = '';

    ffmpeg.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        log('info', `FFmpeg processing complete: ${outputPath}`);
        resolve(outputPath);
      } else {
        log('error', 'FFmpeg processing failed', { code, stderr });
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
      }
    });

    ffmpeg.on('error', (error) => {
      log('error', 'Failed to spawn FFmpeg', { error: error.message });
      reject(error);
    });
  });
}

// ============================================================================
// DISTRIBUTION LAYER
// ============================================================================

/**
 * Publishes video to YouTube via Postiz Public API
 */
async function publishToSocials(videoPath, caption) {
  log('info', 'Publishing to YouTube via Postiz API...');

  if (!CONFIG.postizApiKey || !CONFIG.postizIntegrationId) {
    throw new Error(
      'POSTIZ_API_KEY and POSTIZ_YOUTUBE_INTEGRATION_ID must be set',
    );
  }

  const headers = {
    Authorization: CONFIG.postizApiKey,
  };

  // Step 1: Upload video to Postiz
  log('info', 'Step 1: Uploading video...');
  const { readFile } = require('fs/promises');
  const videoBuffer = await readFile(videoPath);

  const form = new FormData();
  form.append('file', videoBuffer, {
    filename: path.basename(videoPath),
    contentType: 'video/mp4',
  });

  const uploadResponse = await axios.post(
    `${CONFIG.postizBaseUrl}/upload`,
    form,
    {
      headers: {
        ...headers,
        ...form.headers,
      },
      timeout: 120000,
    },
  );

  const uploadedFile = uploadResponse.data;
  log('info', 'Video uploaded', {
    id: uploadedFile.id,
    path: uploadedFile.path,
  });

  // Step 2: Create YouTube post
  log('info', 'Step 2: Creating YouTube post...');
  const postData = {
    type: 'now',
    date: new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: [
      {
        integration: { id: CONFIG.postizIntegrationId },
        value: [
          {
            content: caption,
            image: [{ id: uploadedFile.id, path: uploadedFile.path }],
          },
        ],
        settings: {
          __type: 'youtube',
          title: caption
            .replace(/[🎮🏆⚡🕹️💰🚀🎯🔄]/g, '')
            .trim()
            .slice(0, 100),
          type: 'public',
          selfDeclaredMadeForKids: 'no',
        },
      },
    ],
  };

  const postResponse = await axios.post(
    `${CONFIG.postizBaseUrl}/posts`,
    postData,
    {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    },
  );

  log('info', 'YouTube post created successfully', {
    response: postResponse.data,
  });

  return {
    success: true,
    message: 'Published to YouTube',
    data: postResponse.data,
  };
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Cleans up temporary raw capture files
 */
async function cleanup() {
  log('info', 'Cleaning up temporary files...');
  await cleanDirectory(CONFIG.rawCapturesDir);
  log('info', 'Cleanup complete');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

/**
 * Main factory execution function
 */
async function main() {
  const startTime = Date.now();
  log('info', '=== Shorts Factory Started ===');

  let rawVideoPath = null;
  let outputVideoPath = null;

  try {
    // Step 1: Capture browsing video
    log('info', 'Step 1: Capturing browsing session...');
    const captureResult = await captureBrowsing();
    rawVideoPath = captureResult.videoPath;
    log(
      'info',
      `Raw video captured at: ${rawVideoPath} (${captureResult.duration}ms)`,
    );

    // Step 2: Process video with FFmpeg
    log('info', 'Step 2: Processing video with FFmpeg...');
    outputVideoPath = await processVideo(rawVideoPath, captureResult.duration);
    log('info', `Processed video saved at: ${outputVideoPath}`);

    // Step 3: Prepare for social media posting
    log('info', 'Step 3: Preparing social media post...');
    const caption = captureResult.caption || randomElement(CAPTIONS);
    log('info', `Selected caption: "${caption}"`);
    await publishToSocials(outputVideoPath, caption);

    // Step 4: Cleanup temporary files
    log('info', 'Step 4: Cleaning up...');
    await cleanup();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log('info', `=== Shorts Factory Completed in ${duration}s ===`);
    log('info', `Output video: ${outputVideoPath}`);

    return {
      success: true,
      videoPath: outputVideoPath,
      caption,
    };
  } catch (error) {
    log('error', '=== Shorts Factory Failed ===', {
      error: error.message,
      stack: error.stack,
    });

    // Attempt cleanup even on failure
    await cleanup().catch(() => {});

    process.exit(1);
  }
}

// Run the factory
main();
