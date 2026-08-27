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
const {
  readdir,
  unlink,
  mkdir,
  stat,
  readFile,
  writeFile,
  chmod,
} = require('fs/promises');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Parse CLI arguments
const parsedArgs = {
  testScenario: null,
  aspectRatio: null,
};

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--test-scenario' && process.argv[i + 1]) {
    parsedArgs.testScenario = process.argv[i + 1];
    i++;
  } else if (process.argv[i] === '--aspect-ratio' && process.argv[i + 1]) {
    parsedArgs.aspectRatio = process.argv[i + 1];
    i++;
  }
}

// Aspect ratio mapping
const VIEWPORTS = {
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '16:9': { width: 1920, height: 1080 },
};

const selectedAspectRatio = parsedArgs.aspectRatio || '9:16';
const selectedViewport = VIEWPORTS[selectedAspectRatio] || VIEWPORTS['9:16'];

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Video dimensions
  viewport: selectedViewport,
  aspectRatio: selectedAspectRatio,

  // Base URL
  baseUrl: 'https://arcadeum.games',

  // Directories
  rawCapturesDir: path.join(__dirname, '..', '..', 'raw_captures'),
  outputDir: path.join(__dirname, '..', '..', 'output'),
  pendingDir: path.join(__dirname, '..', '..', 'pending'),

  // Video settings
  videoDuration: { min: 5, max: 10 }, // seconds (randomized)
  fadeOutDuration: 2, // seconds
  fadeOutStartOffset: 2, // seconds before end to start fade
  musicVolume: 0.35, // 35% volume

  // Postiz API
  postizBaseUrl:
    process.env.POSTIZ_BASE_URL ||
    'https://postiz.arcadeum.games/api/public/v1',
  postizApiKey: process.env.POSTIZ_API_KEY || '',
  postizIntegrationId: process.env.POSTIZ_YOUTUBE_INTEGRATION_ID || '',
  postizInstagramId: process.env.POSTIZ_INSTAGRAM_INTEGRATION_ID || '',
  postizTiktokId: process.env.POSTIZ_TIKTOK_INTEGRATION_ID || '',
  postizXId: process.env.POSTIZ_X_INTEGRATION_ID || '',

  // Telegram Bot API
  tgBotUrl: process.env.TG_BOT_URL || 'http://localhost:4001',

  // Factory bot account for gameplay recording (optional)
  factoryBotToken: process.env.SHORTS_FACTORY_BOT_TOKEN || '',
  factoryBotRefreshToken: process.env.SHORTS_FACTORY_BOT_REFRESH_TOKEN || '',

  // Approval settings
  approvalTimeoutMs: 3 * 60 * 60 * 1000, // 3 hours
  pollIntervalMs: 30 * 1000, // 30 seconds
  enableApproval: process.env.SHORTS_FACTORY_APPROVAL === 'true',
};

// ============================================================================
// APPROVAL FLOW
// ============================================================================

/**
 * Generates a unique ID for pending videos
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Ensures the pending directory exists
 */
async function ensurePendingDir() {
  await mkdir(CONFIG.pendingDir, { recursive: true });
}

/**
 * Saves video to pending directory and notifies Telegram bot
 */
async function requestApproval(videoPath, caption, scenario) {
  if (!CONFIG.enableApproval) {
    log('info', 'Approval flow disabled, posting directly');
    return { approved: true, autoApproved: false, pendingId: null };
  }

  await ensurePendingDir();
  const id = generateId();

  const pending = {
    id,
    videoPath,
    caption,
    scenario,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  // Save pending metadata
  const metadataPath = path.join(CONFIG.pendingDir, `${id}.json`);
  await writeFile(metadataPath, JSON.stringify(pending, null, 2), {
    mode: 0o666,
  });
  await chmod(metadataPath, 0o666).catch(() => {});
  log('info', `Saved pending video metadata: ${metadataPath}`);

  // Notify Telegram bot
  try {
    const response = await axios.post(
      `${CONFIG.tgBotUrl}/shorts-factory/pending`,
      pending,
      { timeout: 15000 },
    );

    if (response.data?.messageId) {
      pending.messageId = response.data.messageId;
      await writeFile(metadataPath, JSON.stringify(pending, null, 2), {
        mode: 0o666,
      });
    }
  } catch (err) {
    log('error', 'Failed to notify Telegram bot', { error: err.message });
    // Continue without approval if bot is unavailable
    return { approved: true, autoApproved: true, pendingId: id };
  }

  // Poll for approval
  const pollResult = await pollForApproval(id, metadataPath);
  return { ...pollResult, pendingId: id };
}

/**
 * Polls the pending metadata file for status changes
 */
async function pollForApproval(id, metadataPath) {
  const startTime = Date.now();
  log(
    'info',
    `Polling for approval (timeout: ${CONFIG.approvalTimeoutMs / 1000 / 60}min)...`,
  );

  while (Date.now() - startTime < CONFIG.approvalTimeoutMs) {
    await new Promise((r) => setTimeout(r, CONFIG.pollIntervalMs));

    try {
      const raw = await readFile(metadataPath, 'utf-8');
      const pending = JSON.parse(raw);

      if (pending.status === 'approved') {
        log('info', 'Video approved by admin');
        return { approved: true, autoApproved: false };
      }

      if (pending.status === 'regenerated') {
        log('info', 'Video regeneration requested by admin');
        return { approved: false, regenerated: true };
      }

      const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
      log('info', `Still pending... (${elapsed}min elapsed)`);
    } catch (err) {
      log('error', 'Error reading pending metadata', { error: err.message });
    }
  }

  // Auto-approve after timeout
  log('info', 'Approval timeout reached, auto-approving');
  try {
    const raw = await readFile(metadataPath, 'utf-8');
    const pending = JSON.parse(raw);
    pending.status = 'approved';
    await writeFile(metadataPath, JSON.stringify(pending, null, 2));
  } catch (err) {
    log('error', 'Failed to auto-approve', { error: err.message });
  }

  return { approved: true, autoApproved: true };
}

/**
 * Reports the posting result to Telegram bot
 */
async function reportResult(id, success, message, platforms) {
  if (!CONFIG.enableApproval) return;

  try {
    await axios.post(
      `${CONFIG.tgBotUrl}/shorts-factory/result`,
      {
        id,
        status: success ? 'posted' : 'failed',
        result: { success, message, platforms },
      },
      { timeout: 120000 },
    );
    log('info', 'Reported result to Telegram bot');
  } catch (err) {
    log('error', 'Failed to report result', { error: err.message });
  }
}

// ============================================================================
// CAPTIONS POOL
// ============================================================================

const CAPTIONS = [
  'This is what web3 gaming actually looks like 🎮⚡',
  'Play games, win real rewards, no wallet needed 💰🏆',
  'The future of multiplayer gaming is live on Arcadeum ⚡',
  'POV: you just found the best gaming platform online 🕹️🔥',
  'Free to play. Easy to win. Impossible to stop 🚀',
  'Gaming meets Web3 — and it slaps 🎯',
  'Your next favorite game is one click away 🌟',
  'Play. Compete. Earn. Repeat! 🔄💎',
  'Level up your gaming experience today! ⬆️',
  'Where casual gamers become champions 👑',
  'Unlock exclusive drops just by playing 🔓🎁',
  'The ultimate gaming destination just dropped 🌟',
  'Real multiplayer. Real stakes. Real fun 🏅',
  'Web3 gaming that actually works — no gas fees 😤⚡',
  'Sink ships, climb ranks, collect rewards ⚓🏆',
  'Chess with stakes? Sign me up 👑♟️',
  'This snake game goes HARD 🐍🔥',
  'Classic games, Web3 rewards — best combo ever 🎲💰',
  'Drop in, play a quick game, win something epic 🎮🏆',
  'Arcadeum just changed the game. Literally. 🚀',
];

// ============================================================================
// GAMEPLAY AUTH HELPER
// ============================================================================

/**
 * Injects bot auth tokens into the browser context so gameplay pages load
 * as an authenticated user. Requires SHORTS_FACTORY_BOT_TOKEN in env.
 * Returns true if tokens were injected, false if no token configured.
 */
async function injectBotAuth(context) {
  if (!CONFIG.factoryBotToken) {
    return false;
  }
  await context.addInitScript(
    ({ accessToken, refreshToken }) => {
      try {
        const session = {
          accessToken,
          refreshToken,
          expiresAt: Date.now() + 60 * 60 * 1000,
        };
        localStorage.setItem('arcadeum_session', JSON.stringify(session));
        localStorage.setItem('arcadeum_access_token', accessToken);
        if (refreshToken) {
          localStorage.setItem('arcadeum_refresh_token', refreshToken);
        }
      } catch {}
    },
    {
      accessToken: CONFIG.factoryBotToken,
      refreshToken: CONFIG.factoryBotRefreshToken,
    },
  );
  return true;
}

// ============================================================================
// SCENARIOS — 50 pre-defined user journeys (one per day, no repeats)
// ============================================================================

const SCENARIOS = [
  // ─── GAMEPLAY ROOMS (require SHORTS_FACTORY_BOT_TOKEN) ──────────────────

  {
    name: 'seaBattleGameplay',
    requiresAuth: true,
    caption:
      'Live Sea Battle gameplay on Arcadeum! Sink fleets, earn rewards ⚓🔥 #seabattle #web3gaming',
    steps: [
      { type: 'navigate', url: '/en/games/sea-battle', wait: 2000 },
      {
        type: 'click',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 6000,
      },
      { type: 'scroll', y: 200, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid="game-board-area"]',
        wait: 2000,
      },
      { type: 'scroll', y: 100, wait: 600 },
    ],
  },
  {
    name: 'chessGameplay',
    requiresAuth: true,
    caption:
      'Play chess vs AI for real rewards on Arcadeum! ♟️👑 #chess #web3gaming #onlinechess',
    steps: [
      { type: 'navigate', url: '/en/games/chess', wait: 2000 },
      {
        type: 'click',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 6000,
      },
      { type: 'scroll', y: 200, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid="game-board-area"]',
        wait: 2000,
      },
      { type: 'scroll', y: 100, wait: 600 },
    ],
  },
  {
    name: 'ticTacToeGameplay',
    requiresAuth: true,
    caption:
      'Tic-Tac-Toe with real stakes — can you beat the AI? ❌⭕🔥 #tictactoe #gaming',
    steps: [
      { type: 'navigate', url: '/en/games/tic-tac-toe', wait: 2000 },
      {
        type: 'click',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 6000,
      },
      {
        type: 'hover',
        selector: '[data-testid="game-board-area"]',
        wait: 2000,
      },
      { type: 'scroll', y: 200, wait: 800 },
    ],
  },
  {
    name: 'criticalGameplay',
    requiresAuth: true,
    caption:
      'Critical card game — high pressure, high reward ⚡🃏 #cardgame #arcade #web3',
    steps: [
      { type: 'navigate', url: '/en/games/critical', wait: 2000 },
      {
        type: 'click',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 6000,
      },
      {
        type: 'hover',
        selector: '[data-testid="game-board-area"]',
        wait: 2000,
      },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'glimwormGameplay',
    requiresAuth: true,
    caption:
      'Snake game goes multiplayer! Glimworm is wild 🐍⚡ #snakegame #gaming #arcade',
    steps: [
      { type: 'navigate', url: '/en/games/glimworm', wait: 2000 },
      {
        type: 'click',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 6000,
      },
      {
        type: 'hover',
        selector: '[data-testid="game-board-area"]',
        wait: 2500,
      },
      { type: 'scroll', y: 100, wait: 600 },
    ],
  },
  {
    name: 'checkersGameplay',
    requiresAuth: true,
    caption:
      'Checkers online for real rewards — can you dominate? 🔴⚫🏆 #checkers #boardgame',
    steps: [
      { type: 'navigate', url: '/en/games/checkers', wait: 2000 },
      {
        type: 'click',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 6000,
      },
      {
        type: 'hover',
        selector: '[data-testid="game-board-area"]',
        wait: 2000,
      },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'cascadeGameplay',
    requiresAuth: true,
    caption:
      'Cascade card game — the strategy is DEEP 🎴🏆 #cardgame #strategy #gaming',
    steps: [
      { type: 'navigate', url: '/en/games/cascade', wait: 2000 },
      {
        type: 'click',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 6000,
      },
      {
        type: 'hover',
        selector: '[data-testid="game-board-area"]',
        wait: 2000,
      },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },

  // ─── GAME LANDINGS — rich scrolling demos ────────────────────────────────

  {
    name: 'gameExplorer',
    caption:
      'Ready to level up? Discover next-gen web3 multiplayer games instantly on Arcadeum! ⚡🎮 #web3gaming #gaming',
    steps: [
      { type: 'navigate', url: '/en', wait: 2500 },
      { type: 'scroll', y: 500, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid="games-catalog-card-sea_battle_v1"]',
        wait: 1500,
      },
      { type: 'scroll', y: 400, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="games-catalog-card-chess_v1"]',
        wait: 1000,
      },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'seaBattleIntro',
    caption:
      'Sink enemy fleets & claim real rewards! ⚓ Play Sea Battle live on Arcadeum 🔥 #seabattle #indiegames',
    steps: [
      { type: 'navigate', url: '/en/games/sea-battle', wait: 2500 },
      { type: 'scroll', y: 200, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 1000,
      },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'chessLanding',
    caption:
      'Play chess with real stakes vs. live opponents 👑♟️ Ranked matches on Arcadeum! #chess #gaming',
    steps: [
      { type: 'navigate', url: '/en/games/chess', wait: 2500 },
      { type: 'scroll', y: 200, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 1200,
      },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 400, wait: 800 },
    ],
  },
  {
    name: 'glimwormLanding',
    caption:
      'A snake game that went MULTIPLAYER 🐍⚡ Glimworm on Arcadeum is insane #snakegame #arcade',
    steps: [
      { type: 'navigate', url: '/en/games/glimworm', wait: 2500 },
      { type: 'scroll', y: 200, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 1200,
      },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'criticalLanding',
    caption:
      'Test your nerve in Critical! High stakes, fast turns, endless thrill ⚡🔥 #arcade #gaming',
    steps: [
      { type: 'navigate', url: '/en/games/critical', wait: 3000 },
      { type: 'scroll', y: 200, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 1500,
      },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'tictactoeLanding',
    caption:
      'Think Tic-Tac-Toe is easy? Try competing for real ranks on Arcadeum! ❌⭕ #boardgames #onlinegaming',
    steps: [
      { type: 'navigate', url: '/en/games/tic-tac-toe', wait: 3000 },
      { type: 'scroll', y: 200, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 1500,
      },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'cascadeLanding',
    caption:
      'Master the ultimate card cascade! Outsmart opponents & flex your strategy 🎲🏆 #cardgame #strategy',
    steps: [
      { type: 'navigate', url: '/en/games/cascade', wait: 3000 },
      { type: 'scroll', y: 200, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 1500,
      },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'checkersLanding',
    caption:
      'Classic checkers with a competitive edge 🔴⚫ Ranked online play on Arcadeum! #checkers',
    steps: [
      { type: 'navigate', url: '/en/games/checkers', wait: 3000 },
      { type: 'scroll', y: 200, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 1500,
      },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'backgammonLanding',
    caption:
      'Backgammon online with real opponents — the OG strategy game is back 🎲♟️ #backgammon',
    steps: [
      { type: 'navigate', url: '/en/games/backgammon', wait: 3000 },
      { type: 'scroll', y: 200, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 1500,
      },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'heartsLanding',
    caption:
      'Hearts card game online — avoid the Queen, win the round! 🃏❤️ #cardgame #gaming',
    steps: [
      { type: 'navigate', url: '/en/games/hearts', wait: 3000 },
      { type: 'scroll', y: 200, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 1500,
      },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'spadesLanding',
    caption:
      'Spades online — team up & dominate the table! 🃏♠️ #spades #cardgame #multiplayer',
    steps: [
      { type: 'navigate', url: '/en/games/spades', wait: 3000 },
      { type: 'scroll', y: 200, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 1500,
      },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'catDashLanding',
    caption:
      'Cat Dash — the most chaotic runner game on web3 🐱💨 #catdash #arcade #gaming',
    steps: [
      { type: 'navigate', url: '/en/games/cat-dash', wait: 3000 },
      { type: 'scroll', y: 200, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 1500,
      },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: '2048Landing',
    caption:
      '2048 online with multiplayer twist — how high can you score? 🧩🏆 #2048 #puzzle',
    steps: [
      { type: 'navigate', url: '/en/games/2048', wait: 3000 },
      { type: 'scroll', y: 200, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="quickplay-ai-button"]',
        wait: 1500,
      },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },

  // ─── GAMES CATALOG ───────────────────────────────────────────────────────

  {
    name: 'gamesCatalogBrowse',
    caption:
      '20+ games and counting! The Arcadeum catalog keeps growing 🎮🌟 #gaming #web3',
    steps: [
      { type: 'navigate', url: '/en/games', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid="games-catalog-card-sea_battle_v1"]',
        wait: 1000,
      },
      { type: 'scroll', y: 400, wait: 600 },
      {
        type: 'hover',
        selector: '[data-testid="games-catalog-card-chess_v1"]',
        wait: 1000,
      },
      { type: 'scroll', y: 400, wait: 600 },
    ],
  },
  {
    name: 'gamesCatalogFilter',
    caption:
      'Strategy, action, cards — Arcadeum has it all 🎯🃏⚔️ #web3gaming #gaming',
    steps: [
      { type: 'navigate', url: '/en/games', wait: 2500 },
      {
        type: 'click',
        selector: '[data-testid="category-filter-strategy"]',
        wait: 1500,
      },
      { type: 'scroll', y: 300, wait: 800 },
      {
        type: 'click',
        selector: '[data-testid="category-filter-action"]',
        wait: 1500,
      },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'createYourGame',
    caption:
      'Create your custom game room in under 10 seconds and challenge your friends! 🛠️🔥 #gamedev #multiplayer',
    steps: [
      { type: 'navigate', url: '/en/games/create', wait: 3000 },
      { type: 'scroll', y: 300, wait: 800 },
      {
        type: 'hover',
        selector: 'form button[type="submit"]',
        wait: 1500,
      },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },

  // ─── SOCIAL & COMMUNITY ──────────────────────────────────────────────────

  {
    name: 'leaderboardClimb',
    caption:
      'Climb the global leaderboards and earn recognition! 🏆 #gaming #leaderboard',
    steps: [
      { type: 'navigate', url: '/en/leaderboards', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'hover', selector: '[data-testid^="player-row-"]', wait: 1500 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'communityBuzz',
    caption:
      'Connect with gamers from around the world in real-time! 💬🌍 #gaming #community',
    steps: [
      { type: 'navigate', url: '/en/community', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid="chat-message-bubble"]',
        wait: 1500,
      },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'clansPage',
    caption:
      'Join or create a clan and compete together for epic rewards! ⚔️🏰 #clans #gaming #teamwork',
    steps: [
      { type: 'navigate', url: '/en/clans', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'friendsPage',
    caption:
      'Play with friends, challenge rivals, build your squad 🤝🎮 #friends #gaming',
    steps: [
      { type: 'navigate', url: '/en/friends', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'tournamentTime',
    caption:
      'Join daily tournaments and win massive prizes! 🏅🔥 #tournament #esports',
    steps: [
      { type: 'navigate', url: '/en/tournaments', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid^="tournament-card-"]',
        wait: 1500,
      },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'eventsPage',
    caption:
      "Special events with exclusive rewards — don't miss out! 🎉🎁 #events #gaming",
    steps: [
      { type: 'navigate', url: '/en/events', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'playerProfiles',
    caption:
      'Check out detailed player stats and achievements! 👤📊 #gaming #stats',
    steps: [
      { type: 'navigate', url: '/en/leaderboards', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'hover', selector: '[data-testid^="player-row-"]', wait: 1500 },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'referralRewards',
    caption:
      'Invite friends to Arcadeum and earn bonus rewards! 🎁🔗 #referral #gaming',
    steps: [
      { type: 'navigate', url: '/en/referrals', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid="referral-link-container"]',
        wait: 1500,
      },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },

  // ─── REWARDS & ECONOMY ───────────────────────────────────────────────────

  {
    name: 'rewardHunter',
    caption:
      'Earn tokens and gems daily just for playing! 💰💎 #playtoearn #web3',
    steps: [
      { type: 'navigate', url: '/en/rewards', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'hover', selector: '[data-testid="daily-rewards"]', wait: 1500 },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'shopAvatars',
    caption:
      'Get custom avatars and unique skins in the Arcadeum shop! 🛒🎨 #gaming #cosmetics',
    steps: [
      { type: 'navigate', url: '/en/shop', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid^="shop-card-avatar-"]',
        wait: 1500,
      },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'shopInventory',
    caption:
      'Manage and equip your custom collected skins! 🎒✨ #gaming #customization',
    steps: [
      { type: 'navigate', url: '/en/shop/inventory', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid^="inventory-item-"]',
        wait: 1500,
      },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'walletWatch',
    caption:
      'Securely manage your tokens and assets in the Arcadeum wallet! 💎🔐 #web3 #crypto',
    steps: [
      { type: 'navigate', url: '/en/wallet', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid="balance-coins-value"]',
        wait: 1500,
      },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'tokenInfo',
    caption:
      'Join the next generation web3 gaming ecosystem! 🪙🚀 #web3 #blockchain',
    steps: [
      { type: 'navigate', url: '/en/token', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid="tokenomics-chart"]',
        wait: 1500,
      },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'battlePass',
    caption:
      'Unlock legendary drops with the Arcadeum Battle Pass! 🎫🏆 #battlepass #gaming',
    steps: [
      { type: 'navigate', url: '/en/battle-pass', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid^="battlepass-tier-"]',
        wait: 1500,
      },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },

  // ─── EXPLORATION & FLOW ──────────────────────────────────────────────────

  {
    name: 'homepageTour',
    caption:
      'Welcome to Arcadeum — the ultimate web3 gaming playground! 🚀🎮 #web3gaming',
    steps: [
      { type: 'navigate', url: '/en', wait: 3000 },
      { type: 'scroll', y: 400, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid^="games-catalog-card-"]',
        wait: 1500,
      },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 400, wait: 600 },
    ],
  },
  {
    name: 'replaysPage',
    caption:
      'Replay your greatest victories and learn from your losses! 🎬🏆 #gaming #replay',
    steps: [
      { type: 'navigate', url: '/en/replays', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'hover', selector: '[data-testid="history-row"]', wait: 1500 },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'historyReplay',
    caption:
      'Review and replay your best game moments! 🎬⚡ #gaming #replay #arcadeum',
    steps: [
      { type: 'navigate', url: '/en/history', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'hover', selector: '[data-testid="history-row"]', wait: 1500 },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'statsDeepDive',
    caption:
      'Analyze your gameplay performance with in-depth stats! 📊🎮 #gaming #stats',
    steps: [
      { type: 'navigate', url: '/en/stats', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid="stats-overview-card"]',
        wait: 1500,
      },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'roadmapPage',
    caption:
      'Big things are coming to Arcadeum! Check out the roadmap 🗺️🚀 #gaming #web3',
    steps: [
      { type: 'navigate', url: '/en/roadmap', wait: 2500 },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'blogRead',
    caption:
      'Stay updated with the latest gaming news and updates! 📰🎮 #gaming #news',
    steps: [
      { type: 'navigate', url: '/en/blog', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      {
        type: 'hover',
        selector: '[data-testid^="blog-post-card-"]',
        wait: 1500,
      },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'multiPageFlow',
    caption:
      'A seamless, immersive web3 gaming experience! ✨🎮 #web3gaming #arcadeum',
    steps: [
      { type: 'navigate', url: '/en/games', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'navigate', url: '/en/leaderboards', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
    ],
  },
  {
    name: 'gameToLeaderboard',
    caption: 'Play hard, rank high, and win prizes! 📈🏆 #competitive #gaming',
    steps: [
      { type: 'navigate', url: '/en/games', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'navigate', url: '/en/leaderboards', wait: 2500 },
      { type: 'scroll', y: 200, wait: 800 },
    ],
  },
  {
    name: 'shopToRewards',
    caption:
      'Unlock premium cosmetics and climb the ranks! 🛍️🏆 #gaming #rewards',
    steps: [
      { type: 'navigate', url: '/en/shop', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'navigate', url: '/en/rewards', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
    ],
  },
  {
    name: 'communityToTournament',
    caption:
      'Engage with the community and join active matches! 🏆💬 #esports #gaming',
    steps: [
      { type: 'navigate', url: '/en/community', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'navigate', url: '/en/tournaments', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
    ],
  },
  {
    name: 'developersPortal',
    caption:
      'Build the future of gaming on the Arcadeum SDK! 👨‍💻🚀 #gamedev #web3',
    steps: [
      { type: 'navigate', url: '/en/developers', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'hover', selector: '[data-testid="developers-cta"]', wait: 1500 },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
  {
    name: 'changelogPage',
    caption:
      "Arcadeum ships fast — check out what's new! 🚢⚡ #gaming #updates #changelog",
    steps: [
      { type: 'navigate', url: '/en/changelog', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'scroll', y: 400, wait: 800 },
      { type: 'scroll', y: 300, wait: 600 },
    ],
  },
  {
    name: 'settingsCheck',
    caption:
      'Customize your theme and accessibility settings! ⚙️🎨 #gaming #customization',
    steps: [
      { type: 'navigate', url: '/en/settings', wait: 2500 },
      { type: 'scroll', y: 300, wait: 800 },
      { type: 'hover', selector: '[data-testid="settings-form"]', wait: 1500 },
      { type: 'scroll', y: 200, wait: 600 },
    ],
  },
];

// ============================================================================
// AUDIO TRACKS (fetched dynamically from CDN tracks.json)
// ============================================================================

const CDN_BASE = process.env.SHORTS_CDN_URL;
const MUSIC_FOLDER = 'music';
const MUSIC_CDN_URL = `${CDN_BASE}/${MUSIC_FOLDER}`;
const TRACKS_JSON_URL = `${CDN_BASE}/${MUSIC_FOLDER}/tracks.json`;

let cachedTracks = null;

/**
 * Fetches available audio tracks from CDN tracks.json.
 * Falls back to a small hardcoded list if the fetch fails.
 */
async function getAudioTracks() {
  if (cachedTracks) return cachedTracks;

  try {
    log('info', `Fetching tracks from ${TRACKS_JSON_URL}`);
    const response = await axios.get(TRACKS_JSON_URL, { timeout: 10000 });
    const tracks = response.data
      .filter((t) => t.src && t.src.endsWith('.mp3'))
      .map((t) => `${CDN_BASE}${t.src}`);
    if (tracks.length > 0) {
      cachedTracks = tracks;
      log('info', `Loaded ${tracks.length} audio tracks from CDN`);
      return tracks;
    }
  } catch (error) {
    log('warn', 'Failed to fetch tracks.json, using fallback', {
      error: error.message,
    });
  }

  // Fallback: tracks known to exist on CDN
  cachedTracks = [
    `${MUSIC_CDN_URL}/battleship-grid.mp3`,
    `${MUSIC_CDN_URL}/clockwork-horizon.mp3`,
    `${MUSIC_CDN_URL}/glass-grid.mp3`,
    `${MUSIC_CDN_URL}/grid-of-torpedoes.mp3`,
    `${MUSIC_CDN_URL}/gridline-armada.mp3`,
    `${MUSIC_CDN_URL}/gridwater-clash.mp3`,
    `${MUSIC_CDN_URL}/iron-tide.mp3`,
    `${MUSIC_CDN_URL}/iron-wake.mp3`,
  ];
  log('info', `Using ${cachedTracks.length} fallback audio tracks`);
  return cachedTracks;
}

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
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
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
      if (step.selector) {
        log('info', `Step: Click selector "${step.selector}"`);
        const el = page.locator(step.selector);
        await el
          .first()
          .scrollIntoViewIfNeeded()
          .catch(() => {});
        const box = await el
          .first()
          .boundingBox()
          .catch(() => null);
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
            steps: 10,
          });
        }
        await el
          .first()
          .click({ force: true })
          .catch(() => {});
      } else {
        log('info', `Step: Click at (${step.x}, ${step.y})`);
        await page.mouse.move(step.x, step.y, { steps: 5 });
        await sleep(200);
        await page.mouse.click(step.x, step.y);
      }
      await waitForContent(page).catch(() => {});
      if (step.wait) await sleep(step.wait);
      break;
    }
    case 'hover': {
      if (step.selector) {
        log('info', `Step: Hover selector "${step.selector}"`);
        const el = page.locator(step.selector);
        await el
          .first()
          .scrollIntoViewIfNeeded()
          .catch(() => {});
        const box = await el
          .first()
          .boundingBox()
          .catch(() => null);
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
            steps: 10,
          });
        }
      } else {
        log('info', `Step: Hover at (${step.x}, ${step.y})`);
        await page.mouse.move(step.x, step.y, { steps: 8 });
      }
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

    // Pick a scenario BEFORE creating context so we know if auth is needed
    let scenario;
    if (parsedArgs.testScenario) {
      scenario = SCENARIOS.find((s) => s.name === parsedArgs.testScenario);
      if (scenario) {
        log('info', `Using requested test scenario: ${scenario.name}`);
      } else {
        log(
          'warn',
          `Requested test scenario "${parsedArgs.testScenario}" not found, falling back to random.`,
        );
      }
    }
    if (!scenario) {
      const hasToken = Boolean(CONFIG.factoryBotToken);
      const eligible = hasToken
        ? SCENARIOS
        : SCENARIOS.filter((s) => !s.requiresAuth);
      if (!hasToken) {
        log(
          'info',
          'No SHORTS_FACTORY_BOT_TOKEN set — skipping gameplay scenarios. Set it to enable live gameplay recordings.',
        );
      }
      scenario = randomElement(eligible);
    }

    const context = await browser.newContext({
      viewport: CONFIG.viewport,
      recordVideo: {
        dir: CONFIG.rawCapturesDir,
        size: CONFIG.viewport,
      },
    });
    log('info', 'Browser context created with video recording');

    if (scenario.requiresAuth) {
      const injected = await injectBotAuth(context);
      log(
        'info',
        injected
          ? 'Bot auth tokens injected into browser context'
          : 'Auth scenario selected but no token available — will record unauthenticated',
      );
    }

    const page = await context.newPage();
    log('info', 'New page created');
    log('info', `Running scenario: ${scenario.name}`);
    log('info', `Caption will be: "${scenario.caption}"`);

    // Execute all steps in the scenario
    const startTime = Date.now();
    let startOffsetMs = 0;
    for (let i = 0; i < scenario.steps.length; i++) {
      const elapsed = Date.now() - startTime;
      if (elapsed >= CONFIG.videoDuration.max * 1000) {
        log('info', `Max duration reached, stopping at step ${i + 1}`);
        break;
      }
      log('info', `Executing step ${i + 1}/${scenario.steps.length}`);
      await executeStep(page, scenario.steps[i]);
      if (i === 0) {
        const stepWait = scenario.steps[i].wait || 0;
        startOffsetMs = Math.max(0, Date.now() - startTime - stepWait);
        log(
          'info',
          `Calculated startOffsetMs (trim offset for initial white screen): ${startOffsetMs}ms`,
        );
      }
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
      startOffsetMs,
      caption: scenario.caption,
      scenario: scenario.name,
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
 * Runs an FFmpeg command and returns a promise
 */
function runFFmpeg(args, label) {
  log('info', `Executing FFmpeg (${label})`, { args });

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args);
    let stderr = '';

    ffmpeg.stdout.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        log('info', `FFmpeg (${label}) complete`);
        resolve();
      } else {
        log('error', `FFmpeg (${label}) failed`, { code, stderr });
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
      }
    });

    ffmpeg.on('error', (error) => {
      log('error', `Failed to spawn FFmpeg (${label})`, {
        error: error.message,
      });
      reject(error);
    });
  });
}

const TRACK_VOLUME_OVERRIDES = {
  'battleship-grid.mp3': 0.3,
  'clockwork-horizon.mp3': 0.4,
  'glass-grid.mp3': 0.35,
  'grid-of-torpedoes.mp3': 0.25,
  'gridline-armada.mp3': 0.35,
  'gridwater-clash.mp3': 0.3,
  'iron-tide.mp3': 0.2,
  'iron-wake.mp3': 0.25,
};

function getTrackVolume(trackUrl) {
  const filename = path.basename(trackUrl);
  if (TRACK_VOLUME_OVERRIDES[filename] !== undefined) {
    return TRACK_VOLUME_OVERRIDES[filename];
  }
  return CONFIG.musicVolume;
}

const END_CARD_CTAS = [
  'Play Online Now!',
  'Join the Arena!',
  'Ready to Play?',
  'Play Free Games!',
  'Challenge Players!',
];

function getScenarioTags(scenarioName) {
  const name = (scenarioName || '').toLowerCase();
  const tags = ['#arcadeum', '#web3', '#gaming'];

  if (
    name.includes('gameplay') ||
    name.includes('game') ||
    name.includes('battle') ||
    name.includes('critical') ||
    name.includes('tictactoe') ||
    name.includes('cascade') ||
    name.includes('chess') ||
    name.includes('checkers') ||
    name.includes('glimworm') ||
    name.includes('backgammon') ||
    name.includes('hearts') ||
    name.includes('spades') ||
    name.includes('catdash') ||
    name.includes('2048') ||
    name.includes('sea')
  ) {
    tags.push('#gamers', '#p2e', '#onlinegaming');
  }

  if (name.includes('gameplay') || name.includes('room')) {
    tags.push('#liveplay', '#multiplayer');
  }

  if (
    name.includes('shop') ||
    name.includes('reward') ||
    name.includes('wallet') ||
    name.includes('token') ||
    name.includes('battlepass') ||
    name.includes('economy')
  ) {
    tags.push('#crypto', '#rewards', '#playtoearn');
  }

  if (
    name.includes('community') ||
    name.includes('leaderboard') ||
    name.includes('chat') ||
    name.includes('profile') ||
    name.includes('clan') ||
    name.includes('friend') ||
    name.includes('tournament')
  ) {
    tags.push('#community', '#social', '#esports');
  }

  if (name.includes('replay') || name.includes('history')) {
    tags.push('#highlights', '#clips');
  }

  if (
    name.includes('roadmap') ||
    name.includes('changelog') ||
    name.includes('developer')
  ) {
    tags.push('#gamedev', '#buildinpublic');
  }

  return tags.join(' ');
}

/**
 * Processes the raw video with FFmpeg: trim, add audio, append end card
 */
async function processVideo(rawVideoPath, recordedDuration, startOffsetMs = 0) {
  log('info', 'Starting FFmpeg video processing...');

  // Ensure output directory exists
  await ensureDir(CONFIG.outputDir);

  // Select a random audio track
  const tracks = await getAudioTracks();
  const audioTrack = randomElement(tracks);
  const trackVolume = getTrackVolume(audioTrack);
  log('info', `Selected audio track: ${audioTrack} with volume ${trackVolume}`);

  // Calculate trim duration (cap at 13 seconds for optimal 15s total duration with end card)
  const startOffsetSec = Math.max(0, startOffsetMs / 1000);
  const remainingDuration = Math.max(
    3,
    (recordedDuration - startOffsetMs) / 1000,
  );
  const trimDuration = Math.min(remainingDuration, 13);
  const fadeOutStart = Math.max(0, trimDuration - CONFIG.fadeOutDuration);
  const endCardDuration = 2;

  log(
    'info',
    `Trim offset: ${startOffsetSec.toFixed(3)}s, trim duration: ${trimDuration.toFixed(3)}s, end card: ${endCardDuration}s, fade-out starts at: ${fadeOutStart.toFixed(3)}s`,
  );

  const timestamp = Date.now();
  const mainVideoPath = path.join(
    CONFIG.outputDir,
    `arcadeum-main-${timestamp}.mp4`,
  );
  const endCardPath = path.join(
    CONFIG.outputDir,
    `arcadeum-endcard-${timestamp}.mp4`,
  );
  const outputPath = path.join(CONFIG.outputDir, `arcadeum-${timestamp}.mp4`);

  // Step 1: Trim video and add audio
  await runFFmpeg(
    [
      '-ss',
      startOffsetSec.toFixed(3),
      '-i',
      rawVideoPath,
      '-i',
      audioTrack,
      '-t',
      trimDuration.toFixed(3),
      '-vf',
      `eq=contrast=1.05:saturation=1.15,drawbox=x=0:y=ih-10:w=iw*t/${trimDuration.toFixed(3)}:h=10:color=yellow@0.8:t=fill,fade=t=out:st=${fadeOutStart.toFixed(3)}:d=${CONFIG.fadeOutDuration}`,
      '-af',
      `volume=${trackVolume},afade=t=out:st=${fadeOutStart.toFixed(3)}:d=${CONFIG.fadeOutDuration}`,
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
      mainVideoPath,
    ],
    'main video',
  );

  // Step 2: Create end card (black background + logo.png overlay + random CTA + fade-in audio)
  const logoPath = path.join(
    __dirname,
    '..',
    '..',
    'apps',
    'web',
    'public',
    'logo.png',
  );
  const endCardCta = randomElement(END_CARD_CTAS);
  const logoScale = Math.round(CONFIG.viewport.width * 0.45);
  const fontSize = Math.round(CONFIG.viewport.width * 0.055);
  const urlFontSize = Math.round(CONFIG.viewport.width * 0.07);
  const textOffsetY = Math.round(CONFIG.viewport.height * 0.06);
  const urlOffsetY = Math.round(CONFIG.viewport.height * 0.14);

  await runFFmpeg(
    [
      '-f',
      'lavfi',
      '-i',
      `color=c=black:s=${CONFIG.viewport.width}x${CONFIG.viewport.height}:d=${endCardDuration}:r=30`,
      '-i',
      logoPath,
      '-f',
      'lavfi',
      '-i',
      `anullsrc=r=44100:cl=stereo`,
      '-filter_complex',
      `[1:v]scale=${logoScale}:-1[logo];[0:v][logo]overlay=(W-w)/2:(H-h)/2-180:format=auto,drawtext=text='${endCardCta}':fontcolor=white:fontsize=${fontSize}:x=(w-text_w)/2:y=(h-text_h)/2+${textOffsetY}:font=sans-serif:alpha='if(lt(t,0.5),t/0.5,1)',drawtext=text='arcadeum.games':fontcolor=yellow:fontsize=${urlFontSize}:x=(w-text_w)/2:y=(h-text_h)/2+${urlOffsetY}:font=sans-serif:alpha='if(lt(t,0.5),t/0.5,1)'[v]`,
      '-map',
      '[v]',
      '-map',
      '2:a',
      '-af',
      `afade=t=in:st=0:d=0.5`,
      '-t',
      String(endCardDuration),
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
      '-shortest',
      '-y',
      endCardPath,
    ],
    'end card',
  );

  // Step 3: Concatenate main video + end card
  const concatListPath = path.join(CONFIG.outputDir, `concat-${timestamp}.txt`);
  const { writeFile } = require('fs/promises');
  await writeFile(
    concatListPath,
    `file '${mainVideoPath}'\nfile '${endCardPath}'`,
  );

  await runFFmpeg(
    [
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatListPath,
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
      outputPath,
    ],
    'concat',
  );

  // Cleanup temp files
  await unlink(mainVideoPath).catch(() => {});
  await unlink(endCardPath).catch(() => {});
  await unlink(concatListPath).catch(() => {});

  log('info', `Final video with end card: ${outputPath}`);
  return outputPath;
}

// ============================================================================
// DISTRIBUTION LAYER
// ============================================================================

/**
 * Publishes video to YouTube via Postiz Public API
 */
async function publishToSocials(videoPath, caption) {
  log('info', 'Publishing to social platforms via Postiz API...');

  if (!CONFIG.postizApiKey) {
    throw new Error('POSTIZ_API_KEY must be set');
  }

  const platforms = [];

  if (CONFIG.postizIntegrationId) {
    platforms.push({
      id: CONFIG.postizIntegrationId,
      type: 'youtube',
      buildPost: (uploadedFile, cap) => ({
        integration: { id: CONFIG.postizIntegrationId },
        value: [
          {
            content: cap,
            image: [{ id: uploadedFile.id, path: uploadedFile.path }],
          },
        ],
        settings: {
          __type: 'youtube',
          title: cap
            .replace(/[🎮🏆⚡🕹️💰🚀🎯🔄]/g, '')
            .trim()
            .slice(0, 100),
          type: 'public',
          selfDeclaredMadeForKids: 'no',
        },
      }),
    });
  }

  if (CONFIG.postizInstagramId) {
    platforms.push({
      id: CONFIG.postizInstagramId,
      type: 'Instagram',
      buildPost: (uploadedFile, cap) => ({
        integration: { id: CONFIG.postizInstagramId },
        value: [
          {
            content: cap,
            image: [{ id: uploadedFile.id, path: uploadedFile.path }],
          },
        ],
        settings: {
          __type: 'instagram',
          post_type: 'post',
        },
      }),
    });
  }

  if (CONFIG.postizTiktokId) {
    platforms.push({
      id: CONFIG.postizTiktokId,
      type: 'TikTok',
      buildPost: (uploadedFile, cap) => ({
        integration: { id: CONFIG.postizTiktokId },
        value: [
          {
            content: cap,
            image: [{ id: uploadedFile.id, path: uploadedFile.path }],
          },
        ],
        settings: {
          __type: 'tiktok',
          title: cap
            .replace(/[🎮🏆⚡🕹️💰🚀🎯🔄]/g, '')
            .trim()
            .slice(0, 90),
          privacy_level: 'PUBLIC_TO_EVERYONE',
          duet: true,
          stitch: true,
          comment: true,
          autoAddMusic: 'no',
          brand_content_toggle: false,
          brand_organic_toggle: false,
          video_made_with_ai: false,
          content_posting_method: 'DIRECT_POST',
        },
      }),
    });
  }

  if (CONFIG.postizXId) {
    platforms.push({
      id: CONFIG.postizXId,
      type: 'X/Twitter',
      buildPost: (uploadedFile, cap) => ({
        integration: { id: CONFIG.postizXId },
        value: [
          {
            content: cap.slice(0, 280),
            image: [{ id: uploadedFile.id, path: uploadedFile.path }],
          },
        ],
        settings: {
          __type: 'twitter',
          tweet_type: 'tweet',
        },
      }),
    });
  }

  if (platforms.length === 0) {
    throw new Error(
      'At least one integration ID must be set (POSTIZ_YOUTUBE_INTEGRATION_ID, POSTIZ_INSTAGRAM_INTEGRATION_ID, POSTIZ_TIKTOK_INTEGRATION_ID, or POSTIZ_X_INTEGRATION_ID)',
    );
  }

  const headers = {
    Authorization: CONFIG.postizApiKey,
  };

  // Step 1: Upload video to Postiz
  log('info', `Step 1: Uploading video...`);
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

  // Step 2: Create posts for each platform
  const results = [];
  for (const platform of platforms) {
    log('info', `Step 2: Creating ${platform.type} post...`);
    try {
      const postData = {
        type: 'now',
        date: new Date().toISOString(),
        shortLink: false,
        tags: [],
        posts: [platform.buildPost(uploadedFile, caption)],
      };

      const postResponse = await axios.post(
        `${CONFIG.postizBaseUrl}/posts`,
        postData,
        {
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        },
      );

      log('info', `${platform.type} post created successfully`, {
        response: postResponse.data,
      });
      results.push({
        platform: platform.type,
        success: true,
        data: postResponse.data,
      });
    } catch (error) {
      log('error', `${platform.type} post failed`, {
        error: error.message,
      });
      results.push({
        platform: platform.type,
        success: false,
        error: error.message,
      });
    }
  }

  const successes = results.filter((r) => r.success);
  const failures = results.filter((r) => !r.success);
  return {
    success: successes.length > 0,
    message: `Published to ${successes.map((r) => r.platform).join(', ') || 'none'}`,
    platforms: successes.map((r) => r.platform),
    failedPlatforms: failures.map((r) => ({
      platform: r.platform,
      error: r.error,
    })),
    results,
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

  // Clean old pending files (older than 24 hours)
  try {
    await mkdir(CONFIG.pendingDir, { recursive: true });
    const files = await readdir(CONFIG.pendingDir);
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(CONFIG.pendingDir, file);
      const fileStat = await stat(filePath);
      if (now - fileStat.mtimeMs > 24 * 60 * 60 * 1000) {
        await unlink(filePath);
        log('info', `Cleaned old pending file: ${file}`);
      }
    }
  } catch (err) {
    log('error', 'Error cleaning pending directory', { error: err.message });
  }

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
  let pendingId = null;

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
    outputVideoPath = await processVideo(
      rawVideoPath,
      captureResult.duration,
      captureResult.startOffsetMs,
    );
    log('info', `Processed video saved at: ${outputVideoPath}`);

    // Step 3: Request approval (if enabled)
    const baseCaption = captureResult.caption || randomElement(CAPTIONS);
    const scenario = captureResult.scenario || 'unknown';
    const hashtags = getScenarioTags(scenario);
    const caption = `${baseCaption}\n\nPlay now: ${CONFIG.baseUrl}\n\n${hashtags}`;
    log('info', `Selected caption: "${caption}"`);

    const approval = await requestApproval(outputVideoPath, caption, scenario);

    if (approval.approved) {
      // Step 4: Post to social media
      log('info', 'Step 3: Publishing to social platforms...');
      const result = await publishToSocials(outputVideoPath, caption);

      // Report result if we have a pending ID
      if (approval.pendingId) {
        await reportResult(
          approval.pendingId,
          result.success,
          result.message,
          result.platforms,
        );
      }
    } else if (approval.regenerated) {
      log(
        'info',
        'Regeneration requested — task-bot spawns a fresh run with --test-scenario',
      );
      await cleanup();
      process.exit(0);
    }

    // Step 5: Cleanup temporary files
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

    // Report failure
    if (pendingId) {
      await reportResult(pendingId, false, error.message);
    }

    // Attempt cleanup even on failure
    await cleanup().catch(() => {});

    process.exit(1);
  }
}

// Run the factory
main();
