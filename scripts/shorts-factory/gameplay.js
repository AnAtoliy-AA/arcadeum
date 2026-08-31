#!/usr/bin/env node

/**
 * Gameplay Factory - Records actual gameplay footage
 *
 * Two separate Playwright sessions:
 *   1. Desktop (1920x1080) → full video → YouTube Video
 *   2. Mobile (1080x1920) → short clip → YouTube Short + Instagram Reel
 *
 * Both get an arcadeum.games end card.
 *
 * Usage:
 *   node scripts/shorts-factory/gameplay.js
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const {
  readdir,
  unlink,
  mkdir,
  stat,
  readFile,
  writeFile,
} = require('fs/promises');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const rootDir = path.join(__dirname, '..', '..');
require('dotenv').config({ path: path.join(rootDir, '.env') });
require('dotenv').config({ path: path.join(rootDir, '.env.local') });
require('dotenv').config({
  path: path.join(rootDir, 'apps', 'web', '.env.local'),
});

// Parse CLI arguments
const parsedArgs = {
  game: null,
  baseUrl: process.env.BASE_URL || null,
  preview: false,
  shortOnly: false,
  desktopOnly: false,
};

for (let i = 2; i < process.argv.length; i++) {
  if (
    (process.argv[i] === '--game' || process.argv[i] === '-g') &&
    process.argv[i + 1]
  ) {
    parsedArgs.game = process.argv[i + 1].toLowerCase();
    i++;
  } else if (
    (process.argv[i] === '--base-url' || process.argv[i] === '--url') &&
    process.argv[i + 1]
  ) {
    parsedArgs.baseUrl = process.argv[i + 1];
    i++;
  } else if (process.argv[i] === '--preview') {
    parsedArgs.preview = true;
  } else if (process.argv[i] === '--short-only') {
    parsedArgs.shortOnly = true;
  } else if (process.argv[i] === '--desktop-only') {
    parsedArgs.desktopOnly = true;
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const defaultLocalPort = process.env.WEB_PORT || process.env.PORT || '3000';
const defaultBaseUrl =
  process.env.BASE_URL ||
  (parsedArgs.preview
    ? `http://localhost:${defaultLocalPort}`
    : 'https://arcadeum.games');

const CONFIG = {
  baseUrl: parsedArgs.baseUrl || defaultBaseUrl,
  rawCapturesDir: path.join(__dirname, '..', '..', 'raw_captures'),
  outputDir: path.join(__dirname, '..', '..', 'output'),
  pendingDir: path.join(__dirname, '..', '..', 'pending'),
  fullDuration: { min: 45000, max: 55000 },
  shortDuration: { min: 10, max: 15 },
  fadeOutDuration: 1.5,
  endCardDuration: 2.5,
  enableApproval: process.env.SHORTS_FACTORY_APPROVAL === 'true',
  tgBotUrl: process.env.TG_BOT_URL || 'http://localhost:4001',
  approvalTimeoutMs: 30 * 60 * 1000,
  pollIntervalMs: 5000,
  postizBaseUrl:
    process.env.POSTIZ_BASE_URL ||
    'https://postiz.arcadeum.games/api/public/v1',
  postizApiKey: process.env.POSTIZ_API_KEY || '',
  postizYouTubeId: process.env.POSTIZ_YOUTUBE_INTEGRATION_ID || '',
  postizInstagramId: process.env.POSTIZ_INSTAGRAM_INTEGRATION_ID || '',
  postizTiktokId: process.env.POSTIZ_TIKTOK_INTEGRATION_ID || '',
  postizXId: process.env.POSTIZ_X_INTEGRATION_ID || '',
  // Bot account for authenticated gameplay recording
  botToken: process.env.SHORTS_FACTORY_BOT_TOKEN || '',
  botRefreshToken: process.env.SHORTS_FACTORY_BOT_REFRESH_TOKEN || '',
};

// ============================================================================
// GAME DEFINITIONS
// ============================================================================

const GAMES = [
  {
    name: 'sea-battle',
    slug: 'sea_battle_v1',
    url: '/en/games/sea-battle',
    hookText: '⚓ SINK ENEMY FLEET!',
    actionPhrases: [
      '💥 MISSILE LAUNCH!',
      '🎯 DIRECT HIT!',
      '🔥 FLEET ON FIRE!',
    ],
    captions: [
      'Can you sink their entire fleet before yours goes down? ⚓💥 Play free on arcadeum.games #seabattle #battleship #gaming #shorts',
      'Master naval strategy and outplay bots & friends! 🚢🌊 No download required on arcadeum.games #seabattlegame #strategy #multiplayer',
    ],
    moves: [],
    async waitForGame(page) {
      for (let i = 0; i < 3; i++) {
        try {
          const closeBtn = page
            .locator(
              'button[aria-label*="Close"], button:has-text("✕"), [data-testid="close-modal"], [data-testid="close-rules-button"]',
            )
            .first();
          if ((await closeBtn.count()) > 0 && (await closeBtn.isVisible())) {
            await closeBtn.click({ force: true });
            await sleep(250);
          }
        } catch {}
      }

      const autoPlaceBtn = page
        .locator(
          '[data-testid="sea-battle-auto-place"], button:has-text("Auto Place"), button:has-text("Randomize"), button:has-text("🎲")',
        )
        .first();

      try {
        await autoPlaceBtn.waitFor({ state: 'visible', timeout: 15000 });
        await sleep(600);
        await autoPlaceBtn.dispatchEvent('click');
        log('info', 'sea-battle: auto-placed fleet (1/2)');
        await sleep(1000);

        await autoPlaceBtn.dispatchEvent('click');
        log('info', 'sea-battle: auto-placed fleet (2/2)');
        await sleep(1000);

        const confirmBtn = page
          .locator(
            '[data-testid="sea-battle-confirm-placement"], button:has-text("Confirm Placement"), button:has-text("⚓"), button.sb-valid-pulse',
          )
          .first();
        await confirmBtn
          .waitFor({ state: 'visible', timeout: 8000 })
          .catch(() => {});
        await confirmBtn.dispatchEvent('click');
        log('info', 'sea-battle: clicked confirm placement');
      } catch (e) {
        log('warn', 'sea-battle: placement sequence error', {
          error: e.message,
        });
      }

      const battleGrid = page.locator(
        '.sb-board-grid.sb-my-turn, .sb-cell.sb-attackable, .sb-cell[data-row]',
      );
      await battleGrid
        .first()
        .waitFor({ state: 'visible', timeout: 15000 })
        .catch(() => {});
      log('info', 'sea-battle: battle phase ready');
      await sleep(400);
    },
    async makeMove(page) {
      const targetCells = page.locator(
        '[data-row]:not([aria-label*="hit"]):not([aria-label*="miss"]):not([aria-label*="sunk"]), .sb-cell.sb-attackable',
      );
      const count = await targetCells.count();
      if (count > 0) {
        const idx = Math.floor(Math.random() * count);
        const cell = targetCells.nth(idx);
        await cell.scrollIntoViewIfNeeded({ timeout: 500 }).catch(() => {});
        await cell.click({ force: true });
        return true;
      }
      return false;
    },
    async isMyTurn(page) {
      const emptyCells = await page
        .locator(
          '[data-row]:not([aria-label*="hit"]):not([aria-label*="miss"]):not([aria-label*="sunk"])',
        )
        .count();
      return emptyCells > 0;
    },
  },
  {
    name: 'chess',
    slug: 'chess_v1',
    url: '/en/games/chess',
    hookText: '♟️ TACTICAL CHECKMATE?',
    actionPhrases: [
      '👑 SMART OPENING!',
      '⚔️ PIECE CAPTURE!',
      '⚡ TACTICAL STRIKE!',
    ],
    captions: [
      'Spot the winning move in 3 seconds! ♟️👑 Play online at arcadeum.games #chess #chessgame #checkmate #boardgames',
      'Fast-paced multiplayer chess in your browser! 🏆 No install needed on arcadeum.games #chessreels #strategy #arcadeum',
    ],
    moves: [
      { from: 'e2', to: 'e4' },
      { from: 'g1', to: 'f3' },
      { from: 'd2', to: 'd4' },
      { from: 'b1', to: 'c3' },
      { from: 'f1', to: 'c4' },
      { from: 'c1', to: 'f4' },
      { from: 'e1', to: 'g1' },
    ],
    async waitForGame(page) {
      await page.waitForSelector(
        '[data-testid="chess-e2"], [data-testid="chess-d2"], [data-testid^="chess-"], [role="gridcell"]',
        { timeout: 20000 },
      );
      await sleep(1000);
    },
    async makeMove(page, move) {
      if (move && move.from && move.to) {
        const fromCell = page.locator(`[data-testid="chess-${move.from}"]`);
        if ((await fromCell.count()) > 0) {
          await fromCell.click({ force: true });
          await sleep(300);
          const toCell = page.locator(`[data-testid="chess-${move.to}"]`);
          if ((await toCell.count()) > 0) {
            await toCell.click({ force: true });
            return true;
          }
        }
      }

      const myPieces = page.locator(
        '[aria-label*="white"][role="gridcell"], [data-testid^="chess-"]',
      );
      const pieceCount = await myPieces.count();
      for (let i = 0; i < Math.min(pieceCount, 8); i++) {
        const piece = myPieces.nth(i);
        await piece.click({ force: true });
        await sleep(200);
        const legalTargets = page.locator('[aria-label*="legal move"]');
        if ((await legalTargets.count()) > 0) {
          await legalTargets.first().click({ force: true });
          return true;
        }
      }
      return false;
    },
    async isMyTurn(page) {
      return await page.evaluate(() => {
        return document.querySelectorAll('[data-testid^="chess-"]').length > 0;
      });
    },
  },
  {
    name: 'checkers',
    slug: 'checkers_v1',
    url: '/en/games/checkers',
    hookText: '🔴 MASTER THE DIAGONALS!',
    actionPhrases: ['👑 KING ME!', '🎯 JUMP & CAPTURE!', '⚡ PERFECT MOVE!'],
    captions: [
      'Diagonal jumps and double captures! 🔴⚫ Can you win? Play on arcadeum.games #checkers #draughts #boardgames',
      'Outsmart your opponent in classic Checkers! 🏆 Free at arcadeum.games #boardgamereels #tactics #arcadeum',
    ],
    moves: [],
    async waitForGame(page) {
      await page.waitForSelector(
        '[data-testid="checkers-board"], [data-testid^="checkers-cell-"]',
        { timeout: 20000 },
      );
      await sleep(1000);
    },
    async makeMove(page) {
      const moved = await page.evaluate(() => {
        const pieceCells = Array.from(
          document.querySelectorAll('[data-testid^="checkers-cell-"]'),
        ).filter((c) => {
          const label = c.getAttribute('aria-label') || '';
          return !label.includes('empty') && label.length > 0;
        });
        if (pieceCells.length > 0) {
          const randomPiece =
            pieceCells[Math.floor(Math.random() * pieceCells.length)];
          randomPiece.click();
          return true;
        }
        return false;
      });
      if (moved) {
        await sleep(250);
        await page.evaluate(() => {
          const emptyCells = Array.from(
            document.querySelectorAll('[data-testid^="checkers-cell-"]'),
          ).filter((c) => {
            const label = c.getAttribute('aria-label') || '';
            return label.includes('empty');
          });
          if (emptyCells.length > 0) {
            emptyCells[0].click();
          }
        });
        return true;
      }
      return false;
    },
    async isMyTurn(page) {
      return await page.evaluate(() => {
        return (
          document.querySelectorAll('[data-testid^="checkers-cell-"]').length >
          0
        );
      });
    },
  },
  {
    name: 'tic-tac-toe',
    slug: 'tic_tac_toe_v1',
    url: '/en/games/tic-tac-toe',
    hookText: '❌ SPEED SHOWDOWN! ⭕',
    actionPhrases: ['🔥 FAST MOVE!', '🎯 3 IN A ROW!', '⚡ PERFECT TRAP!'],
    captions: [
      'Classic Tic-Tac-Toe speed challenge! ❌⭕ Play free on arcadeum.games #tictactoe #speedgame #arcadeum',
    ],
    moves: [
      { row: 1, col: 1 },
      { row: 0, col: 0 },
      { row: 0, col: 2 },
      { row: 2, col: 0 },
      { row: 2, col: 2 },
      { row: 1, col: 0 },
      { row: 1, col: 2 },
      { row: 0, col: 1 },
      { row: 2, col: 1 },
    ],
    async waitForGame(page) {
      await page.waitForSelector(
        '[data-testid="ttt-cell-0-0"], [data-testid="game-board-section"], [data-testid="turn-status-pill"]',
        { timeout: 20000 },
      );
    },
    async makeMove(page, move) {
      const cell = page.locator(
        `[data-testid="ttt-cell-${move.row}-${move.col}"]`,
      );
      if (await cell.isEnabled()) {
        await cell.click({ force: true });
        return true;
      }
      return false;
    },
    async isMyTurn(page) {
      const label = page.locator('[data-testid="turn-indicator-label"]');
      if ((await label.count()) === 0) return false;
      const text = await label.textContent();
      return text && text.trim().length > 0;
    },
  },
  {
    name: 'cascade',
    slug: 'cascade_v1',
    url: '/en/games/cascade',
    hookText: '🃏 COLOR MATCH COMBOS!',
    actionPhrases: ['🌈 COLOR SWITCH!', '⚡ CARD COMBO!', '💥 POWER PLAY!'],
    captions: [
      'Fast multiplayer card matching mayhem! 🃏🌈 Free at arcadeum.games #cardgames #cascade #partygames',
    ],
    moves: [],
    _lastLabel: null,
    _stuckCount: 0,
    async waitForGame(page) {
      await page.waitForSelector('[data-testid="cascade-turn-avatar"]', {
        timeout: 15000,
      });
      await page.waitForTimeout(2000);
    },
    async makeMove(page) {
      const picker = page.locator(
        '.CascadeGame-module__WaeW-q__pickerBackdrop',
      );
      if ((await picker.count()) > 0 && (await picker.isVisible())) {
        const colorBtn = page
          .locator('.CascadeGame-module__WaeW-q__pickerBackdrop button')
          .first();
        if ((await colorBtn.count()) > 0) {
          await colorBtn.click({ force: true });
          await sleep(500);
          return true;
        }
      }

      const playable = page.locator(
        '[data-testid="game-board-section"] button:not([disabled]):not([aria-label*="Draw"]):not([aria-label*="Discard"])',
      );
      const count = await playable.count();
      if (count > 0) {
        const labels = [];
        for (let i = 0; i < count; i++) {
          const label = await playable.nth(i).getAttribute('aria-label');
          labels.push(label || `card-${i}`);
        }
        const currentLabel = labels[0];
        if (currentLabel === this._lastLabel) {
          this._stuckCount++;
        } else {
          this._stuckCount = 0;
        }
        this._lastLabel = currentLabel;

        if (this._stuckCount >= 2) {
          const drawPile = page.locator(
            '[data-testid="game-board-section"] button[aria-label*="Draw"]',
          );
          if ((await drawPile.count()) > 0) {
            await drawPile.first().click({ force: true });
            this._stuckCount = 0;
            this._lastLabel = null;
            return true;
          }
        }

        const idx = Math.floor(Math.random() * count);
        await playable.nth(idx).click({ force: true });
        return true;
      }
      const drawPile = page.locator(
        '[data-testid="game-board-section"] button[aria-label*="Draw"]',
      );
      if ((await drawPile.count()) > 0) {
        await drawPile.first().click({ force: true });
        this._lastLabel = null;
        this._stuckCount = 0;
        return true;
      }
      return false;
    },
    async isMyTurn(page) {
      const pill = page.locator('[data-testid="turn-status-pill"]');
      if ((await pill.count()) === 0) return false;
      const text = await pill.textContent();
      return text && text.includes('Your turn');
    },
  },
  {
    name: 'critical',
    slug: 'critical_v1',
    url: '/en/games/critical',
    hookText: '⚡ ULTIMATE CARD BATTLE!',
    actionPhrases: ['💥 COMBO HIT!', '🛡️ SHIELD UP!', '⚡ CRITICAL STRIKE!'],
    captions: [
      'Stack your deck and unleash critical combos! ⚡🃏 Play on arcadeum.games #cardbattler #criticalgame #gaming',
    ],
    moves: [],
    async waitForGame(page) {
      try {
        await page.waitForSelector('[data-testid="hand-rail-play"]', {
          timeout: 10000,
        });
      } catch {
        await page.waitForSelector(
          '[data-testid="game-board-section"], [data-testid="turn-status-pill"]',
          { timeout: 10000 },
        );
      }
      await page.waitForTimeout(2000);
    },
    async makeMove(page) {
      const playBtn = page.locator('[data-testid="hand-rail-play"]');
      if ((await playBtn.count()) > 0 && (await playBtn.isEnabled())) {
        await playBtn.click({ force: true });
        return true;
      }
      const cards = page.locator('[data-testid^="hand-card-"]');
      const count = await cards.count();
      if (count > 0) {
        const idx = Math.floor(Math.random() * count);
        await cards.nth(idx).click({ force: true });
        return true;
      }
      return false;
    },
    async isMyTurn(page) {
      const label = page.locator('[data-testid="turn-indicator-label"]');
      if ((await label.count()) === 0) return false;
      const text = await label.textContent();
      return text && text.trim().length > 0;
    },
  },
  {
    name: 'backgammon',
    slug: 'backgammon_v1',
    url: '/en/games/backgammon',
    hookText: '🎲 ROLL FOR VICTORY!',
    actionPhrases: ['🎲 DOUBLE SIX!', '🏃 BEAR OFF!', '👑 BOARD DOMINATION!'],
    captions: [
      'Master the ancient art of Backgammon! 🎲🏆 Play online for free on arcadeum.games #backgammon #boardgame #tactics',
    ],
    moves: [],
    async waitForGame(page) {
      await page.waitForSelector(
        '[data-testid="backgammon-board"], [data-testid="dice-roll-button"], [data-testid="game-board-section"]',
        { timeout: 20000 },
      );
      await sleep(500);
    },
    async makeMove(page) {
      const rollBtn = page.locator('[data-testid="dice-roll-button"]');
      if ((await rollBtn.count()) > 0 && (await rollBtn.isEnabled())) {
        await rollBtn.click({ force: true });
        return true;
      }
      const movable = page.locator(
        '[data-testid^="checker-point-"]:not([disabled])',
      );
      if ((await movable.count()) > 0) {
        await movable.first().click({ force: true });
        return true;
      }
      return false;
    },
    async isMyTurn(page) {
      const label = page.locator('[data-testid="turn-indicator-label"]');
      if ((await label.count()) === 0) return false;
      const text = await label.textContent();
      return text && text.trim().length > 0;
    },
  },
  {
    name: 'hearts',
    slug: 'hearts_v1',
    url: '/en/games/hearts',
    hookText: '♥ SHOOT THE MOON!',
    actionPhases: ['🃏 CARD PASSING!', '♠ QUEEN OF SPADES!', '🌙 MOON SHOT!'],
    captions: [
      'Dodge Hearts and the Queen of Spades! ♥♠ Play Hearts free on arcadeum.games #hearts #cardgame #tricktaking',
    ],
    moves: [],
    async waitForGame(page) {
      await page.waitForSelector(
        '[data-testid="hearts-board"], [data-testid="game-board-section"]',
        { timeout: 20000 },
      );
      await sleep(500);
    },
    async makeMove(page) {
      const playable = page.locator(
        '[data-testid^="hearts-card-"]:not([disabled])',
      );
      if ((await playable.count()) > 0) {
        await playable.first().click({ force: true });
        return true;
      }
      return false;
    },
    async isMyTurn(page) {
      const label = page.locator('[data-testid="turn-indicator-label"]');
      if ((await label.count()) === 0) return false;
      const text = await label.textContent();
      return text && text.trim().length > 0;
    },
  },
  {
    name: 'go',
    slug: 'go_v1',
    url: '/en/games/go',
    hookText: '⚫⚪ SURROUND & CONQUER!',
    actionPhrases: [
      '⚫ STONE PLACED!',
      '⚪ GROUP CAPTURED!',
      '🏆 TERRITORY CONTROLLED!',
    ],
    captions: [
      'The ancient game of Go — simple rules, infinite depth! ⚫⚪ Play free on arcadeum.games #go #baduk #boardgame #strategy',
    ],
    moves: [],
    async waitForGame(page) {
      await page.waitForSelector(
        '[data-testid="go-board"], [data-testid="game-board-section"]',
        { timeout: 20000 },
      );
      await sleep(500);
    },
    async makeMove(page) {
      const playable = page.locator(
        '[data-testid^="go-cell-"]:not([disabled])',
      );
      if ((await playable.count()) > 0) {
        // Pick a random empty intersection for varied shorts.
        const count = await playable.count();
        const index = Math.floor(Math.random() * Math.min(count, 40));
        await playable.nth(index).click({ force: true });
        return true;
      }
      return false;
    },
    async isMyTurn(page) {
      const label = page.locator('[data-testid="turn-indicator-label"]');
      if ((await label.count()) === 0) return false;
      const text = await label.textContent();
      return text && text.trim().length > 0;
    },
  },
  {
    name: 'glimworm',
    slug: 'glimworm_v1',
    url: '/en/games/glimworm',
    hookText: '🐍 NEON GLIMWORM!',
    actionPhrases: ['✨ GLOW BOOST!', '🌀 DRIFT TURN!', '💥 HIGH SCORE!'],
    captions: [
      'Glide, glow, and survive the neon grid! 🐍✨ Free at arcadeum.games #glimworm #arcade #indiegames',
    ],
    moves: [],
    async waitForGame(page) {
      await page.waitForSelector('canvas, [data-testid="game-board-section"]', {
        timeout: 20000,
      });
      await sleep(500);
    },
    async makeMove(page) {
      await page.keyboard.press(
        randomElement(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']),
      );
      return true;
    },
    async isMyTurn() {
      return true;
    },
  },
  {
    name: 'cat-dash',
    slug: 'cat_dash_v1',
    url: '/en/games/cat-dash',
    hookText: '🐱 RUN FAST, DODGE ALL!',
    actionPhrases: [
      '🐾 PURRFECT JUMP!',
      '⚡ SPEED BOOST!',
      '🐟 FISH COLLECTED!',
    ],
    captions: [
      'Dash, leap, and collect treats in Cat Dash! 🐱🏃 Free on arcadeum.games #catdash #runner #casualgames',
    ],
    moves: [],
    async waitForGame(page) {
      await page.waitForSelector('canvas, [data-testid="game-board-section"]', {
        timeout: 20000,
      });
      await sleep(500);
    },
    async makeMove(page) {
      await page.keyboard.press('Space');
      return true;
    },
    async isMyTurn() {
      return true;
    },
  },
];

const FALLBACK_GAME_SLUGS = [
  'critical_v1',
  'sea_battle_v1',
  'texas_holdem_v1',
  'glimworm_v1',
  'tic_tac_toe_v1',
  'cascade_v1',
  'chess_v1',
  'checkers_v1',
  'cat_dash_v1',
  'backgammon_v1',
  'hearts_v1',
  'spades_v1',
  'go_v1',
  'pachisi_v1',
];

function loadBackendGameCatalogSlugs() {
  try {
    const catalogPath = path.join(
      rootDir,
      'apps',
      'be',
      'src',
      'games',
      'games.catalog.ts',
    );
    const content = fs.readFileSync(catalogPath, 'utf8');
    const matches = Array.from(
      content.matchAll(/gameId:\s*'([^']+)'/g),
      (m) => m[1],
    );
    if (matches.length > 0) {
      return Array.from(new Set(matches));
    }
  } catch {}
  return FALLBACK_GAME_SLUGS;
}

const ALL_GAME_SLUGS = loadBackendGameCatalogSlugs();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (data) {
    console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureDir(dirPath) {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
}

async function getLatestFile(dirPath) {
  const files = await readdir(dirPath);
  if (files.length === 0) return null;
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

async function cleanDirectory(dirPath) {
  try {
    const files = await readdir(dirPath);
    for (const file of files) {
      await unlink(path.join(dirPath, file));
    }
  } catch {}
}

async function cleanOldOutput(maxAgeDays) {
  try {
    const files = await readdir(CONFIG.outputDir);
    const now = Date.now();
    const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;
    let deleted = 0;
    for (const file of files) {
      const filePath = path.join(CONFIG.outputDir, file);
      const s = await stat(filePath);
      if (now - s.mtimeMs > maxAge) {
        await unlink(filePath);
        deleted++;
      }
    }
    if (deleted > 0) log('info', `Cleaned ${deleted} old output files`);
  } catch {}
}

async function injectKineticHookOverlay(page, game) {
  try {
    await page.evaluate((hookText) => {
      const existing = document.getElementById('arcadeum-shorts-hook-overlay');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'arcadeum-shorts-hook-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      const badge = document.createElement('div');
      badge.id = 'arcadeum-hook-badge';
      badge.innerHTML = `
        <div style="
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(59, 130, 246, 0.95));
          color: #ffffff;
          font-size: 19px;
          font-weight: 900;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          padding: 10px 22px;
          border-radius: 9999px;
          border: 2px solid rgba(255, 255, 255, 0.45);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.6);
          display: flex;
          align-items: center;
          gap: 8px;
          animation: popInBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        ">
          ${hookText}
        </div>
      `;

      const style = document.createElement('style');
      style.textContent = `
        @keyframes popInBounce {
          0% { transform: scale(0.4) translateY(-30px); opacity: 0; }
          70% { transform: scale(1.08) translateY(0); opacity: 1; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes actionFlash {
          0% { transform: scale(0.6) rotate(-4deg); opacity: 0; }
          50% { transform: scale(1.15) rotate(2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `;

      overlay.appendChild(style);
      overlay.appendChild(badge);
      document.body.appendChild(overlay);

      setTimeout(() => {
        if (badge) {
          badge.style.transition = 'all 0.5s ease';
          badge.style.opacity = '0';
          badge.style.transform = 'translateY(-20px) scale(0.8)';
          setTimeout(() => badge.remove(), 500);
        }
      }, 3500);
    }, game.hookText || '🎮 PLAY FREE ON ARCADEUM');
  } catch {}
}

async function showActionBadge(page, phrase) {
  try {
    await page.evaluate((text) => {
      const overlay = document.getElementById('arcadeum-shorts-hook-overlay');
      if (!overlay) return;
      const actionBadge = document.createElement('div');
      actionBadge.style.cssText = `
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(245, 158, 11, 0.95));
        color: #ffffff;
        font-size: 17px;
        font-weight: 800;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        padding: 8px 18px;
        border-radius: 9999px;
        border: 2px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.6);
        animation: actionFlash 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        margin-top: 4px;
      `;
      actionBadge.textContent = text;
      overlay.appendChild(actionBadge);
      setTimeout(() => {
        actionBadge.style.transition = 'all 0.4s ease';
        actionBadge.style.opacity = '0';
        actionBadge.style.transform = 'scale(0.8)';
        setTimeout(() => actionBadge.remove(), 400);
      }, 1500);
    }, phrase);
  } catch {}
}

async function requestApproval(videoPath, caption, gameName) {
  if (!CONFIG.enableApproval) {
    log('info', 'Approval flow disabled, posting directly');
    return { approved: true, autoApproved: false, pendingId: null };
  }

  await ensureDir(CONFIG.pendingDir);
  const id = `gameplay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const pending = {
    id,
    videoPath,
    caption,
    game: gameName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const metadataPath = path.join(CONFIG.pendingDir, `${id}.json`);
  await writeFile(metadataPath, JSON.stringify(pending, null, 2), {
    mode: 0o666,
  });

  try {
    const response = await axios.post(
      `${CONFIG.tgBotUrl}/shorts-factory/pending`,
      pending,
      { timeout: 15000 },
    );
    if (response.data?.messageId) {
      pending.messageId = response.data.messageId;
      await writeFile(metadataPath, JSON.stringify(pending, null, 2));
    }
  } catch (err) {
    log('warn', 'Failed to notify Telegram bot, proceeding with auto-approve', {
      error: err.message,
    });
    return { approved: true, autoApproved: true, pendingId: id };
  }

  const startTime = Date.now();
  log(
    'info',
    `Polling for approval (timeout: ${CONFIG.approvalTimeoutMs / 60000}min)...`,
  );

  while (Date.now() - startTime < CONFIG.approvalTimeoutMs) {
    await sleep(CONFIG.pollIntervalMs);
    try {
      const raw = await readFile(metadataPath, 'utf-8');
      const data = JSON.parse(raw);
      if (data.status === 'approved')
        return { approved: true, autoApproved: false, pendingId: id };
      if (data.status === 'regenerated')
        return { approved: false, regenerated: true, pendingId: id };
    } catch {}
  }

  return { approved: true, autoApproved: true, pendingId: id };
}

async function reportResult(id, success, message, platforms) {
  if (!CONFIG.enableApproval || !id) return;
  try {
    await axios.post(
      `${CONFIG.tgBotUrl}/shorts-factory/result`,
      {
        id,
        status: success ? 'posted' : 'failed',
        result: { success, message, platforms },
      },
      { timeout: 30000 },
    );
    log('info', 'Reported result to Telegram bot');
  } catch (err) {
    log('warn', 'Failed to report result to Telegram bot', {
      error: err.message,
    });
  }
}

// ============================================================================
// AUDIO TRACKS
// ============================================================================

const DEFAULT_CDN_BASE = 'https://pub-e993f933ebf045b8af6797750ef1439d.r2.dev';
const CDN_BASE = (
  process.env.SHORTS_CDN_URL ||
  process.env.NEXT_PUBLIC_CDN_URL ||
  DEFAULT_CDN_BASE
).replace(/\/+$/, '');
const TRACKS_JSON_URL = `${CDN_BASE}/music/tracks.json`;

let cachedTracks = null;

async function getAudioTracks() {
  if (cachedTracks) return cachedTracks;
  try {
    log('info', `Fetching tracks from ${TRACKS_JSON_URL}`);
    const response = await axios.get(TRACKS_JSON_URL, { timeout: 10000 });
    const tracks = response.data
      .filter((t) => t.src && t.src.endsWith('.mp3'))
      .map((t) =>
        t.src.startsWith('http')
          ? t.src
          : `${CDN_BASE}/${t.src.replace(/^\/+/, '')}`,
      );
    if (tracks.length > 0) {
      cachedTracks = tracks;
      log('info', `Loaded ${tracks.length} audio tracks from CDN`);
      return tracks;
    }
  } catch (err) {
    log('warn', `Failed to fetch tracks.json: ${err.message}`);
  }
  cachedTracks = [`${CDN_BASE}/music/battleship-grid.mp3`];
  return cachedTracks;
}

// ============================================================================
// GAMEPLAY RECORDING (parameterized viewport)
// ============================================================================

async function recordSession(
  game,
  viewport,
  maxDurationMs,
  label,
  isMobile = false,
) {
  log(
    'info',
    `Recording ${label} session (${viewport.width}x${viewport.height})...`,
  );

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

    const contextOptions = {
      viewport,
      recordVideo: {
        dir: CONFIG.rawCapturesDir,
        size: viewport,
      },
    };

    if (isMobile) {
      contextOptions.isMobile = true;
      contextOptions.hasTouch = true;
      contextOptions.userAgent =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
    }

    const context = await browser.newContext(contextOptions);
    const sessionStartTime = Date.now();

    await context.addInitScript(
      ({ accessToken, refreshToken, gameSlugs }) => {
        try {
          if (accessToken) {
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
          }
          const completedMap = {};
          (gameSlugs || []).forEach((slug) => {
            completedMap[slug] = Date.now();
          });
          localStorage.setItem(
            'arcadeum_tutorials_v1',
            JSON.stringify({
              state: { completedAt: completedMap, dismissedAt: completedMap },
              version: 0,
            }),
          );
        } catch {}
      },
      {
        accessToken: CONFIG.botToken,
        refreshToken: CONFIG.botRefreshToken,
        gameSlugs: ALL_GAME_SLUGS,
      },
    );

    if (CONFIG.botToken) {
      log('info', `${label}: bot auth tokens injected into browser context`);
    } else {
      log(
        'warn',
        `${label}: SHORTS_FACTORY_BOT_TOKEN not set — quickplay may fail if auth is required. Set it in .env to enable authenticated gameplay recording.`,
      );
    }

    const page = await context.newPage();

    const gameUrl = `${CONFIG.baseUrl}${game.url}`;
    await page.goto(gameUrl, { waitUntil: 'networkidle', timeout: 30000 });

    const dismissAnyOverlays = async () => {
      try {
        const dismissSelectors = [
          '[data-testid="tutorial-close-button"]',
          '[data-testid="tutorial-skip-button"]',
          '[data-testid="tutorial-blocker"]',
          '[data-testid="close-rules-button"]',
          '[data-testid="close-modal"]',
          '[data-testid="modal-close-button"]',
          'button[aria-label*="Close"]',
          'button:has-text("✕")',
        ];
        for (const sel of dismissSelectors) {
          const loc = page.locator(sel);
          if ((await loc.count()) > 0 && (await loc.first().isVisible())) {
            await loc
              .first()
              .click({ force: true })
              .catch(() => {});
            await sleep(200);
          }
        }
      } catch {}
    };

    await dismissAnyOverlays();

    log('info', `${label}: looking for Play vs AI button...`);
    const quickplayBtn = page
      .locator('[data-testid="quickplay-ai-button"]')
      .first();
    await quickplayBtn.waitFor({ state: 'visible', timeout: 10000 });
    await quickplayBtn.click({ force: true });
    log('info', `${label}: clicked Play vs AI`);

    log('info', `${label}: looking for Start Game button...`);
    await dismissAnyOverlays();

    const startBtn = page.locator('[data-testid="start-with-bots-button"]');
    await startBtn.waitFor({ state: 'visible', timeout: 15000 });

    const themes = await page
      .locator('[data-testid^="cascade-variant-"]')
      .all();
    if (themes.length > 0) {
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      await randomTheme.click({ force: true });
      log(
        'info',
        `${label}: selected theme ${await randomTheme.getAttribute('data-testid')}`,
      );
      await sleep(500);
    }

    await dismissAnyOverlays();

    const gameplayStartOffsetMs = Date.now() - sessionStartTime;
    await startBtn
      .evaluate((btn) => btn.click())
      .catch(async () => {
        await startBtn.click({ force: true });
      });
    log(
      'info',
      `${label}: clicked Start Game (gameplay offset: ${(gameplayStartOffsetMs / 1000).toFixed(1)}s)`,
    );

    // Step 3: Wait for game board
    await game.waitForGame(page);
    log('info', `${label}: game board loaded`);

    if (isMobile) {
      await injectKineticHookOverlay(page, game);
    }

    const startTime = Date.now();
    let moveCount = 0;
    let moveIndex = 0;

    while (Date.now() - startTime < maxDurationMs) {
      let attempts = 0;
      while (!(await game.isMyTurn(page)) && attempts < 30) {
        await sleep(400);
        attempts++;
        if (Date.now() - startTime >= maxDurationMs) break;
      }

      if (await game.isMyTurn(page)) {
        let move;
        if (game.moves.length > 0) {
          move = game.moves[moveIndex % game.moves.length];
          moveIndex++;
        } else {
          move = null;
        }

        const success = await game.makeMove(page, move);
        if (success) {
          moveCount++;
          log('info', `${label}: move ${moveCount}`);

          if (
            isMobile &&
            game.actionPhrases &&
            game.actionPhrases.length > 0 &&
            (moveCount === 2 || moveCount === 4 || moveCount === 7)
          ) {
            const phrase = randomElement(game.actionPhrases);
            await showActionBadge(page, phrase);
          }

          await sleep(randomInt(500, 800));
        } else {
          await sleep(300);
        }
      } else {
        await sleep(400);
      }
    }

    const finalDuration = Date.now() - sessionStartTime;
    log(
      'info',
      `${label}: recorded ${moveCount} moves in ${((Date.now() - startTime) / 1000).toFixed(1)}s (total raw: ${(finalDuration / 1000).toFixed(1)}s)`,
    );

    await context.close();
    await browser.close();
    browser = null;

    const latestVideo = await getLatestFile(CONFIG.rawCapturesDir);
    if (!latestVideo) throw new Error('No video file found');

    return {
      videoPath: latestVideo,
      duration: finalDuration,
      gameplayStartOffsetMs,
    };
  } catch (error) {
    log('error', `${label} recording failed`, { error: error.message });
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

// ============================================================================
// FFMPEG PROCESSING & BRANDED END CARD
// ============================================================================

function runFFmpeg(args, label) {
  log('info', `Executing FFmpeg (${label})`);
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args);
    let stderr = '';
    ffmpeg.stdout.on('data', (d) => {
      stderr += d.toString();
    });
    ffmpeg.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        log('info', `FFmpeg (${label}) complete`);
        resolve();
      } else {
        log('error', `FFmpeg (${label}) failed`, {
          code,
          stderr: stderr.slice(-500),
        });
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
    ffmpeg.on('error', reject);
  });
}

const LOGO_PATH = path.join(__dirname, '../../apps/web/public/logo.png');

async function generateEndCardImage(width, height, outputPath) {
  const fsSync = require('fs');
  let logoSrc = '';
  if (fsSync.existsSync(LOGO_PATH)) {
    const b64 = fsSync.readFileSync(LOGO_PATH).toString('base64');
    logoSrc = `data:image/png;base64,${b64}`;
  }

  const isPortrait = height > width;
  const logoSize = isPortrait ? 250 : 180;
  const titleSize = isPortrait ? 76 : 56;
  const subtitleSize = isPortrait ? 36 : 26;
  const badgeSize = isPortrait ? 24 : 18;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;800;900&family=Inter:wght@400;600;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        width: ${width}px;
        height: ${height}px;
        background: radial-gradient(circle at center, #0f172a 0%, #060911 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Outfit', -apple-system, sans-serif;
        color: white;
        text-align: center;
        overflow: hidden;
      }
      .glow-orb {
        position: absolute;
        width: ${isPortrait ? 700 : 500}px;
        height: ${isPortrait ? 700 : 500}px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(0,0,0,0) 70%);
        border-radius: 50%;
        filter: blur(40px);
        z-index: 1;
      }
      .card {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${isPortrait ? 28 : 18}px;
      }
      .logo-wrapper {
        width: ${logoSize}px;
        height: ${logoSize}px;
        border-radius: 36px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .title {
        font-size: ${titleSize}px;
        font-weight: 900;
        letter-spacing: -1.5px;
        background: linear-gradient(135deg, #ffffff 40%, #93c5fd 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .subtitle {
        font-family: 'Inter', sans-serif;
        font-size: ${subtitleSize}px;
        font-weight: 700;
        color: #fbbf24;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      .badge {
        font-family: 'Inter', sans-serif;
        margin-top: 8px;
        padding: 12px 32px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: #cbd5e1;
        font-size: ${badgeSize}px;
        font-weight: 500;
        letter-spacing: 0.8px;
      }
    </style>
  </head>
  <body>
    <div class="glow-orb"></div>
    <div class="card">
      ${logoSrc ? `<div class="logo-wrapper"><img class="logo" src="${logoSrc}" /></div>` : ''}
      <div class="title">arcadeum.games</div>
      <div class="subtitle">Play online for free</div>
      <div class="badge">Multiplayer • No Download Required</div>
    </div>
  </body>
  </html>
  `;

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outputPath });
  await browser.close();
}

async function buildEndCard(timestamp, suffix, width, height) {
  const endCardImg = path.join(
    CONFIG.outputDir,
    `endcard-${suffix}-${timestamp}.png`,
  );
  const endCardPath = path.join(
    CONFIG.outputDir,
    `gameplay-endcard-${suffix}-${timestamp}.mp4`,
  );
  const dur = CONFIG.endCardDuration || 2.5;

  try {
    await generateEndCardImage(width, height, endCardImg);

    await runFFmpeg(
      [
        '-loop',
        '1',
        '-i',
        endCardImg,
        '-f',
        'lavfi',
        '-i',
        'anullsrc=r=44100:cl=stereo',
        '-vf',
        `fade=t=in:st=0:d=0.3,fade=t=out:st=${dur - 0.3}:d=0.3,format=yuv420p`,
        '-af',
        `afade=t=in:st=0:d=0.3,afade=t=out:st=${dur - 0.4}:d=0.4`,
        '-t',
        String(dur),
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '23',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-shortest',
        '-y',
        endCardPath,
      ],
      `branded end card (${suffix})`,
    );

    await unlink(endCardImg).catch(() => {});
    return endCardPath;
  } catch (err) {
    log(
      'warn',
      `Branded endcard failed, falling back to simple fade: ${err.message}`,
    );
    await runFFmpeg(
      [
        '-f',
        'lavfi',
        '-i',
        `color=c=0x0b0f19:s=${width}x${height}:d=${dur}:r=30`,
        '-f',
        'lavfi',
        '-i',
        'anullsrc=r=44100:cl=stereo',
        '-vf',
        `scale=${width}:${height},fade=t=in:st=0:d=0.4,fade=t=out:st=${dur - 0.4}:d=0.4,format=yuv420p`,
        '-af',
        'afade=t=in:st=0:d=0.3,afade=t=out:st=' + (dur - 0.5) + ':d=0.5',
        '-t',
        String(dur),
        '-c:v',
        'libx264',
        '-preset',
        'fast',
        '-crf',
        '23',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-shortest',
        '-y',
        endCardPath,
      ],
      `end card fallback (${suffix})`,
    );
    return endCardPath;
  }
}

async function concatVideos(parts, outputPath, label) {
  const timestamp = Date.now();
  const concatList = path.join(
    CONFIG.outputDir,
    `concat-${label}-${timestamp}.txt`,
  );
  await writeFile(concatList, parts.map((p) => `file '${p}'`).join('\n'));

  await runFFmpeg(
    [
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatList,
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
    `concat (${label})`,
  );

  await unlink(concatList).catch(() => {});
}

async function processFullVideo(rawVideoPath, recordedDuration) {
  log('info', 'Processing full video (desktop)...');

  const tracks = await getAudioTracks();
  const audioTrack = tracks && tracks.length > 0 ? randomElement(tracks) : null;
  if (audioTrack) {
    log(
      'info',
      `Selected random CDN music track: ${path.basename(audioTrack)}`,
    );
  }
  const timestamp = Date.now();
  const durationSec = Math.min(Math.ceil(recordedDuration / 1000), 70);
  const fadeStart = Math.max(0, durationSec - CONFIG.fadeOutDuration);

  const mainPath = path.join(
    CONFIG.outputDir,
    `gameplay-full-main-${timestamp}.mp4`,
  );
  const endCardPath = await buildEndCard(timestamp, 'full', 1920, 1080);
  const outputPath = path.join(
    CONFIG.outputDir,
    `gameplay-full-${timestamp}.mp4`,
  );

  const ffmpegArgs = audioTrack
    ? [
        '-i',
        rawVideoPath,
        '-i',
        audioTrack,
        '-t',
        String(durationSec),
        '-af',
        `afade=t=out:st=${fadeStart}:d=${CONFIG.fadeOutDuration}`,
        '-map',
        '0:v:0',
        '-map',
        '1:a:0',
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
        mainPath,
      ]
    : [
        '-i',
        rawVideoPath,
        '-f',
        'lavfi',
        '-i',
        'anullsrc=r=44100:cl=stereo',
        '-t',
        String(durationSec),
        '-map',
        '0:v:0',
        '-map',
        '1:a:0',
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
        mainPath,
      ];

  await runFFmpeg(ffmpegArgs, 'full main video');

  await concatVideos([mainPath, endCardPath], outputPath, 'full');
  await unlink(mainPath).catch(() => {});
  await unlink(endCardPath).catch(() => {});

  log('info', `Full video: ${outputPath}`);
  return outputPath;
}

async function processShortClip(
  rawVideoPath,
  recordedDuration,
  gameplayStartOffsetMs = 0,
) {
  log('info', 'Processing short clip (mobile)...');

  const tracks = await getAudioTracks();
  const audioTrack = tracks && tracks.length > 0 ? randomElement(tracks) : null;
  if (audioTrack) {
    log(
      'info',
      `Selected random CDN music track: ${path.basename(audioTrack)}`,
    );
  }
  const timestamp = Date.now();
  const totalSec = recordedDuration / 1000;
  // Total video target: 10 to 15s (gameplay clip: 8 to 12s + logo endcard: 2.5s)
  const targetTotal = randomInt(
    CONFIG.shortDuration.min,
    CONFIG.shortDuration.max,
  );
  const endCardDur = CONFIG.endCardDuration || 2.5;
  const shortLen = Math.max(5, targetTotal - endCardDur);
  const clipStart = Math.max(0, (gameplayStartOffsetMs || 0) / 1000);
  log(
    'info',
    `Short clip cut: start at ${clipStart.toFixed(1)}s, gameplay length ${shortLen.toFixed(1)}s, total with endcard ~${(shortLen + endCardDur).toFixed(1)}s`,
  );

  const mainPath = path.join(
    CONFIG.outputDir,
    `gameplay-short-main-${timestamp}.mp4`,
  );
  const endCardPath = await buildEndCard(timestamp, 'short', 1080, 1920);
  const outputPath = path.join(
    CONFIG.outputDir,
    `gameplay-short-${timestamp}.mp4`,
  );

  const soundsDir = path.join(
    __dirname,
    '..',
    '..',
    'apps',
    'web',
    'public',
    'sounds',
  );
  const hitSfx = path.join(soundsDir, 'hit.wav');
  const moveSfx = path.join(soundsDir, 'move.wav');
  const hasSfx =
    audioTrack &&
    (await stat(hitSfx)
      .then(() => true)
      .catch(() => false));

  let ffmpegArgs;
  if (audioTrack && hasSfx) {
    const fadeOutStart = Math.max(0, shortLen - CONFIG.fadeOutDuration);
    ffmpegArgs = [
      '-ss',
      String(clipStart),
      '-i',
      rawVideoPath,
      '-i',
      audioTrack,
      '-i',
      hitSfx,
      '-i',
      moveSfx,
      '-filter_complex',
      `[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p[v];` +
        `[1:a]volume=0.35[bg];` +
        `[2:a]adelay=3500|3500,volume=0.85[sfx1];` +
        `[3:a]adelay=1800|1800,volume=0.85[sfx2];` +
        `[bg][sfx1][sfx2]amix=inputs=3:duration=first:dropout_transition=2,afade=t=out:st=${fadeOutStart}:d=${CONFIG.fadeOutDuration}[a]`,
      '-map',
      '[v]',
      '-map',
      '[a]',
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-t',
      String(shortLen),
      '-y',
      mainPath,
    ];
  } else if (audioTrack) {
    ffmpegArgs = [
      '-ss',
      String(clipStart),
      '-i',
      rawVideoPath,
      '-i',
      audioTrack,
      '-t',
      String(shortLen),
      '-vf',
      `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p`,
      '-af',
      `afade=t=out:st=${Math.max(0, shortLen - CONFIG.fadeOutDuration)}:d=${CONFIG.fadeOutDuration}`,
      '-map',
      '0:v:0',
      '-map',
      '1:a:0',
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-shortest',
      '-y',
      mainPath,
    ];
  } else {
    ffmpegArgs = [
      '-ss',
      String(clipStart),
      '-i',
      rawVideoPath,
      '-f',
      'lavfi',
      '-i',
      'anullsrc=r=44100:cl=stereo',
      '-t',
      String(shortLen),
      '-vf',
      `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,format=yuv420p`,
      '-map',
      '0:v:0',
      '-map',
      '1:a:0',
      '-c:v',
      'libx264',
      '-preset',
      'fast',
      '-crf',
      '23',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      '-shortest',
      '-y',
      mainPath,
    ];
  }

  await runFFmpeg(ffmpegArgs, 'short highlight clip');

  await concatVideos([mainPath, endCardPath], outputPath, 'short');
  await unlink(mainPath).catch(() => {});
  await unlink(endCardPath).catch(() => {});

  log('info', `Short clip: ${outputPath}`);
  return outputPath;
}

// ============================================================================
// POSTING
// ============================================================================

async function uploadVideo(videoPath) {
  const headers = { Authorization: CONFIG.postizApiKey };
  const videoBuffer = await readFile(videoPath);
  const form = new FormData();
  form.append('file', videoBuffer, {
    filename: path.basename(videoPath),
    contentType: 'video/mp4',
  });

  const uploadRes = await axios.post(`${CONFIG.postizBaseUrl}/upload`, form, {
    headers: { ...headers, ...form.getHeaders() },
    timeout: 120000,
  });
  return uploadRes.data;
}

async function postToYouTube(uploadedFile, caption) {
  if (!CONFIG.postizYouTubeId) return null;
  const headers = {
    Authorization: CONFIG.postizApiKey,
    'Content-Type': 'application/json',
  };

  const postData = {
    type: 'now',
    date: new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: [
      {
        integration: { id: CONFIG.postizYouTubeId },
        value: [
          {
            content: caption,
            image: [{ id: uploadedFile.id, path: uploadedFile.path }],
          },
        ],
        settings: {
          __type: 'youtube',
          title: caption
            .replace(/[🎮🏆⚡🕹️💰🚀🎯🔄❌⭕🎲🃏]/g, '')
            .trim()
            .slice(0, 100),
          type: 'public',
          selfDeclaredMadeForKids: 'no',
        },
      },
    ],
  };

  const res = await axios.post(`${CONFIG.postizBaseUrl}/posts`, postData, {
    headers,
    timeout: 120000,
  });
  return res.data;
}

async function postToInstagram(uploadedFile, caption) {
  if (!CONFIG.postizInstagramId) return null;
  const headers = {
    Authorization: CONFIG.postizApiKey,
    'Content-Type': 'application/json',
  };

  const postData = {
    type: 'now',
    date: new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: [
      {
        integration: { id: CONFIG.postizInstagramId },
        value: [
          {
            content: caption,
            image: [{ id: uploadedFile.id, path: uploadedFile.path }],
          },
        ],
        settings: { __type: 'instagram', post_type: 'post' },
      },
    ],
  };

  const res = await axios.post(`${CONFIG.postizBaseUrl}/posts`, postData, {
    headers,
    timeout: 120000,
  });
  return res.data;
}

async function postToTikTok(uploadedFile, caption) {
  if (!CONFIG.postizTiktokId) return null;
  const headers = {
    Authorization: CONFIG.postizApiKey,
    'Content-Type': 'application/json',
  };

  const postData = {
    type: 'now',
    date: new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: [
      {
        integration: { id: CONFIG.postizTiktokId },
        value: [
          {
            content: caption,
            image: [{ id: uploadedFile.id, path: uploadedFile.path }],
          },
        ],
        settings: {
          __type: 'tiktok',
          title: caption
            .replace(/[🎮🏆⚡🕹️💰🚀🎯🔄❌⭕🎲🃏]/g, '')
            .trim()
            .slice(0, 90),
          privacy_level: 'PUBLIC_TO_EVERYONE',
          duet: false,
          stitch: false,
          comment: true,
          autoAddMusic: 'no',
          brand_content_toggle: false,
          brand_organic_toggle: false,
          video_made_with_ai: false,
          content_posting_method: 'DIRECT_POST',
        },
      },
    ],
  };

  const res = await axios.post(`${CONFIG.postizBaseUrl}/posts`, postData, {
    headers,
    timeout: 120000,
  });
  return res.data;
}

async function postToX(uploadedFile, caption) {
  if (!CONFIG.postizXId) return null;
  const headers = {
    Authorization: CONFIG.postizApiKey,
    'Content-Type': 'application/json',
  };

  const postData = {
    type: 'now',
    date: new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: [
      {
        integration: { id: CONFIG.postizXId },
        value: [
          {
            content: caption.slice(0, 280),
            image: [{ id: uploadedFile.id, path: uploadedFile.path }],
          },
        ],
        settings: {
          __type: 'twitter',
          tweet_type: 'tweet',
        },
      },
    ],
  };

  const res = await axios.post(`${CONFIG.postizBaseUrl}/posts`, postData, {
    headers,
    timeout: 120000,
  });
  return res.data;
}

async function publishBoth(fullPath, shortPath, caption, gameName = 'game') {
  log('info', 'Publishing to social platforms...');

  if (!CONFIG.postizApiKey) throw new Error('POSTIZ_API_KEY must be set');

  const approvalTarget = shortPath || fullPath;
  const approval = await requestApproval(approvalTarget, caption, gameName);
  if (!approval.approved) {
    log('info', 'Video was not approved by admin, skipping publish');
    return { skipped: true, reason: 'unapproved' };
  }

  const results = { full: null, short: null };
  const postedPlatforms = [];

  // --- Full video → YouTube Video (horizontal) ---
  if (CONFIG.postizYouTubeId && fullPath) {
    try {
      log('info', 'Uploading full video (desktop 1920x1080)...');
      const fullFile = await uploadVideo(fullPath);
      log('info', 'Full video uploaded', { id: fullFile.id });
      results.full = await postToYouTube(fullFile, caption);
      log('info', 'YouTube video posted', results.full);
      postedPlatforms.push('YouTube (Desktop)');
    } catch (err) {
      log('error', 'Full video YouTube post failed', { error: err.message });
    }
  }

  // --- Short clip → YouTube Short + Instagram Reel + TikTok (vertical) ---
  if (shortPath) {
    try {
      log('info', 'Uploading short clip (mobile 1080x1920)...');
      const shortFile = await uploadVideo(shortPath);
      log('info', 'Short clip uploaded', { id: shortFile.id });

      if (CONFIG.postizYouTubeId) {
        try {
          results.short = await postToYouTube(shortFile, caption);
          log('info', 'YouTube Short posted', results.short);
          postedPlatforms.push('YouTube Shorts');
        } catch (err) {
          log('error', 'YouTube Short post failed', { error: err.message });
        }
      }

      if (CONFIG.postizInstagramId) {
        try {
          const igResult = await postToInstagram(shortFile, caption);
          log('info', 'Instagram Reel posted', igResult);
          postedPlatforms.push('Instagram Reels');
        } catch (err) {
          log('error', 'Instagram Reel post failed', { error: err.message });
        }
      }

      if (CONFIG.postizTiktokId) {
        try {
          const ttResult = await postToTikTok(shortFile, caption);
          log('info', 'TikTok posted', ttResult);
          postedPlatforms.push('TikTok');
        } catch (err) {
          log('error', 'TikTok post failed', { error: err.message });
        }
      }

      if (CONFIG.postizXId) {
        try {
          const xResult = await postToX(shortFile, caption);
          log('info', 'X/Twitter posted', xResult);
          postedPlatforms.push('X/Twitter');
        } catch (err) {
          log('error', 'X/Twitter post failed', { error: err.message });
        }
      }
    } catch (err) {
      log('error', 'Short clip upload failed', { error: err.message });
    }
  }

  const success = postedPlatforms.length > 0;
  await reportResult(
    approval.pendingId,
    success,
    success ? `Posted to ${postedPlatforms.join(', ')}` : 'Publish failed',
    postedPlatforms,
  );

  return results;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const startTime = Date.now();
  const previewMode = parsedArgs.preview || process.argv.includes('--preview');

  if (previewMode) {
    log('info', '=== Gameplay Factory Started (PREVIEW MODE - no posting) ===');
  } else {
    log('info', '=== Gameplay Factory Started ===');
  }

  log('info', `Target Base URL: ${CONFIG.baseUrl}`);

  try {
    let game = null;
    if (parsedArgs.game) {
      game = GAMES.find(
        (g) =>
          g.name.toLowerCase() === parsedArgs.game ||
          g.slug.toLowerCase() === parsedArgs.game ||
          g.name.toLowerCase().replace(/[-_]/g, '') ===
            parsedArgs.game.replace(/[-_]/g, ''),
      );
      if (!game) {
        log(
          'warn',
          `Game "${parsedArgs.game}" not found in [${GAMES.map((g) => g.name).join(', ')}]. Falling back to random.`,
        );
        game = randomElement(GAMES);
      }
    } else {
      game = randomElement(GAMES);
    }

    log('info', `Selected game: ${game.name} (${game.url})`);

    const caption =
      game.captions && game.captions.length > 0
        ? randomElement(game.captions)
        : game.caption;

    let fullOutputPath = null;
    let shortOutputPath = null;

    // --- Session 1: Desktop (1920x1080) for full video ---
    if (!parsedArgs.shortOnly) {
      const fullDuration = randomInt(
        CONFIG.fullDuration.min,
        CONFIG.fullDuration.max,
      );
      const desktopCapture = await recordSession(
        game,
        { width: 1920, height: 1080 },
        fullDuration,
        'desktop',
        false,
      );
      fullOutputPath = await processFullVideo(
        desktopCapture.videoPath,
        desktopCapture.duration,
      );
    }

    // --- Session 2: Mobile (real phone viewport) for short clip ---
    if (!parsedArgs.desktopOnly) {
      const mobileCapture = await recordSession(
        game,
        { width: 430, height: 932 },
        30000, // 30s total — enough for navigation + real gameplay
        'mobile',
        true,
      );
      shortOutputPath = await processShortClip(
        mobileCapture.videoPath,
        mobileCapture.duration,
        mobileCapture.gameplayStartOffsetMs,
      );
    }

    // --- Publish (skip in preview mode) ---
    if (previewMode) {
      log('info', '=== PREVIEW MODE: Skipping publish ===');
      if (fullOutputPath) log('info', 'Full video saved to: ' + fullOutputPath);
      if (shortOutputPath)
        log('info', 'Short clip saved to: ' + shortOutputPath);
    } else {
      await publishBoth(fullOutputPath, shortOutputPath, caption, game.name);
    }

    await cleanDirectory(CONFIG.rawCapturesDir);
    await cleanOldOutput(2);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log('info', `=== Gameplay Factory Completed in ${duration}s ===`);
    if (fullOutputPath) log('info', `Full (16:9): ${fullOutputPath}`);
    if (shortOutputPath) log('info', `Short (9:16): ${shortOutputPath}`);

    return { success: true, full: fullOutputPath, short: shortOutputPath };
  } catch (error) {
    log('error', '=== Gameplay Factory Failed ===', { error: error.message });
    await cleanDirectory(CONFIG.rawCapturesDir).catch(() => {});
    process.exit(1);
  }
}

main();
