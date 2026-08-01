#!/usr/bin/env node

/**
 * Gameplay Shorts Factory - Records actual gameplay footage
 *
 * Launches Playwright, starts an anonymous bot game, records gameplay,
 * processes with FFmpeg (music + end card), and posts via Postiz API.
 *
 * Usage:
 *   node scripts/shorts-factory/gameplay.js
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const { readdir, unlink, mkdir, stat, readFile, writeFile } = require('fs/promises');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  viewport: { width: 1080, height: 1920 },
  baseUrl: 'https://arcadeum.games',
  rawCapturesDir: path.join(__dirname, '..', '..', 'raw_captures'),
  outputDir: path.join(__dirname, '..', '..', 'output'),
  gameplayDuration: { min: 6000, max: 8000 },
  fadeOutDuration: 2,
  postizBaseUrl:
    process.env.POSTIZ_BASE_URL ||
    'https://postiz.arcadeum.games/api/public/v1',
  postizApiKey: process.env.POSTIZ_API_KEY || '',
  postizYouTubeId: process.env.POSTIZ_YOUTUBE_INTEGRATION_ID || '',
  postizInstagramId: process.env.POSTIZ_INSTAGRAM_INTEGRATION_ID || '',
  postizTiktokId: process.env.POSTIZ_TIKTOK_INTEGRATION_ID || '',
};

// ============================================================================
// GAME DEFINITIONS
// ============================================================================

const GAMES = [
  {
    name: 'tic-tac-toe',
    slug: 'tic_tac_toe_v1',
    url: '/en/games/tic-tac-toe',
    caption: 'Tic Tac Toe - classic showdown! ❌⭕',
    // Pre-defined move sequence (row, col) for 3x3 board
    // Player is X (first move), bot is O
    moves: [
      { row: 1, col: 1 }, // center
      { row: 0, col: 0 }, // top-left
      { row: 0, col: 2 }, // top-right
      { row: 2, col: 0 }, // bottom-left
    ],
    async waitForGame(page) {
      await page.waitForSelector('[data-testid^="ttt-cell-"]', {
        timeout: 15000,
      });
    },
    async makeMove(page, move) {
      const cell = page.locator(`[data-testid="ttt-cell-${move.row}-${move.col}"]`);
      if (await cell.isEnabled()) {
        await cell.click();
        return true;
      }
      return false;
    },
    async isMyTurn(page) {
      const badge = page.locator('text=Your turn');
      return (await badge.count()) > 0;
    },
  },
  {
    name: 'cascade',
    slug: 'cascade_v1',
    url: '/en/games/cascade',
    caption: 'Cascade - match the colors! 🃏',
    moves: [], // dynamic: click playable cards
    async waitForGame(page) {
      await page.waitForTimeout(3000); // wait for cards to deal
    },
    async makeMove(page) {
      // Click any glowing/playable card
      const playableCards = page.locator('button[style*="pulsing"], button:has([class*="glow"])');
      if ((await playableCards.count()) > 0) {
        await playableCards.first().click();
        return true;
      }
      // Fallback: click draw pile
      const drawPile = page.locator('text=Draw').first();
      if ((await drawPile.count()) > 0) {
        await drawPile.click();
        return true;
      }
      return false;
    },
    async isMyTurn(page) {
      const badge = page.locator('text=Your turn');
      return (await badge.count()) > 0;
    },
  },
  {
    name: 'critical',
    slug: 'critical_v1',
    url: '/en/games/critical',
    caption: 'Critical - card combos for the win! ⚡',
    moves: [],
    async waitForGame(page) {
      await page.waitForTimeout(3000);
    },
    async makeMove(page) {
      // Click any playable card in hand
      const cards = page.locator('[class*="hand"] button, [data-testid*="card"]');
      if ((await cards.count()) > 0) {
        await cards.first().click();
        return true;
      }
      return false;
    },
    async isMyTurn(page) {
      const badge = page.locator('text=Your turn');
      return (await badge.count()) > 0;
    },
  },
];

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

// ============================================================================
// AUDIO TRACKS (shared with factory.js)
// ============================================================================

const CDN_BASE = process.env.SHORTS_CDN_URL;
const TRACKS_JSON_URL = `${CDN_BASE}/music/tracks.json`;

let cachedTracks = null;

async function getAudioTracks() {
  if (cachedTracks) return cachedTracks;
  try {
    const response = await axios.get(TRACKS_JSON_URL, { timeout: 10000 });
    cachedTracks = response.data
      .filter((t) => t.src && t.src.endsWith('.mp3'))
      .map((t) => `${CDN_BASE}${t.src}`);
  } catch {
    cachedTracks = [`${CDN_BASE}/music/battleship-grid.mp3`];
  }
  return cachedTracks;
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

async function login(page) {
  log('info', 'Using anonymous play (no login required)');
  return true;
}

// ============================================================================
// GAMEPLAY RECORDING
// ============================================================================

async function recordGameplay() {
  log('info', 'Starting gameplay recording...');

  let browser = null;
  const game = randomElement(GAMES);
  log('info', `Selected game: ${game.name}`);

  try {
    await ensureDir(CONFIG.rawCapturesDir);

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });

    const context = await browser.newContext({
      viewport: CONFIG.viewport,
      recordVideo: {
        dir: CONFIG.rawCapturesDir,
        size: CONFIG.viewport,
      },
    });

    const page = await context.newPage();

    // Login
    const loggedIn = await login(page);
    if (!loggedIn) {
      log('warn', 'Not logged in, proceeding with guest mode (spectating)');
    }

    // Navigate to game page
    const gameUrl = `${CONFIG.baseUrl}${game.url}`;
    log('info', `Navigating to ${gameUrl}`);
    await page.goto(gameUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Click "Play vs AI" quickplay button
    log('info', 'Looking for "Play vs AI now" button...');
    const quickplayBtn = page.locator(
      'button:has-text("Play vs AI now"), button:has-text("Play vs AI"), button:has-text("Quickplay")',
    ).first();

    if ((await quickplayBtn.count()) > 0) {
      log('info', 'Clicking "Play vs AI now"');
      await quickplayBtn.click();
      await sleep(5000); // wait for lobby to load
    } else {
      log('warn', 'No quickplay button found');
    }

    // Handle lobby: wait for bot, then start game
    const startBtn = page.locator('button:has-text("Start Game")');
    if ((await startBtn.count()) > 0) {
      log('info', 'In lobby, waiting for bot to join...');
      await sleep(3000);
      log('info', 'Clicking "Start Game"');
      await startBtn.click();
      await sleep(5000); // wait for game board
    }

    // Wait for game board
    log('info', 'Waiting for game board...');
    await game.waitForGame(page);
    log('info', 'Game board loaded!');

    // Play moves
    const startTime = Date.now();
    const maxDuration = randomInt(
      CONFIG.gameplayDuration.min,
      CONFIG.gameplayDuration.max,
    );
    let moveCount = 0;

    for (const move of game.moves) {
      if (Date.now() - startTime >= maxDuration) break;

      // Wait for our turn
      let attempts = 0;
      while (!(await game.isMyTurn(page)) && attempts < 20) {
        await sleep(500);
        attempts++;
      }

      if (await game.isMyTurn(page)) {
        const success = await game.makeMove(page, move);
        if (success) {
          moveCount++;
          log('info', `Move ${moveCount}: (${move.row}, ${move.col})`);
          await sleep(1000);
        }
      }
    }

    // Record a bit more for visual interest
    await sleep(2000);

    const finalDuration = Date.now() - startTime;
    log('info', `Gameplay recorded: ${moveCount} moves in ${finalDuration}ms`);

    await context.close();
    await browser.close();
    browser = null;

    await sleep(1000);

    const latestVideo = await getLatestFile(CONFIG.rawCapturesDir);
    if (!latestVideo) throw new Error('No video file found');

    log('info', `Raw gameplay captured: ${latestVideo}`);
    return {
      videoPath: latestVideo,
      duration: finalDuration,
      caption: game.caption,
      gameName: game.name,
    };
  } catch (error) {
    log('error', 'Failed to record gameplay', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

// ============================================================================
// FFMPEG PROCESSING (with end card)
// ============================================================================

function runFFmpeg(args, label) {
  log('info', `Executing FFmpeg (${label})`);
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args);
    let stderr = '';
    ffmpeg.stdout.on('data', (d) => { stderr += d.toString(); });
    ffmpeg.stderr.on('data', (d) => { stderr += d.toString(); });
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        log('info', `FFmpeg (${label}) complete`);
        resolve();
      } else {
        log('error', `FFmpeg (${label}) failed`, { code, stderr });
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
    ffmpeg.on('error', reject);
  });
}

async function processVideo(rawVideoPath, recordedDuration) {
  log('info', 'Processing gameplay video...');
  await ensureDir(CONFIG.outputDir);

  const tracks = await getAudioTracks();
  const audioTrack = randomElement(tracks);
  const trimDuration = Math.min(Math.ceil(recordedDuration / 1000), 10);
  const fadeOutStart = Math.max(0, trimDuration - CONFIG.fadeOutDuration);
  const endCardDuration = 2;
  const timestamp = Date.now();

  const mainPath = path.join(CONFIG.outputDir, `gameplay-main-${timestamp}.mp4`);
  const endCardPath = path.join(CONFIG.outputDir, `gameplay-endcard-${timestamp}.mp4`);
  const outputPath = path.join(CONFIG.outputDir, `gameplay-${timestamp}.mp4`);

  // Step 1: Trim + add audio
  await runFFmpeg(
    [
      '-i', rawVideoPath,
      '-i', audioTrack,
      '-t', String(trimDuration),
      '-af', `afade=t=out:st=${fadeOutStart}:d=${CONFIG.fadeOutDuration}`,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      '-y', '-shortest', mainPath,
    ],
    'main video',
  );

  // Step 2: End card
  await runFFmpeg(
    [
      '-f', 'lavfi', '-i', `color=c=black:s=1080x1920:d=${endCardDuration}:r=30`,
      '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
      '-vf', `drawtext=text='arcadeum.games':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2:font=sans-serif:alpha='if(lt(t,0.5),t/0.5,1)'`,
      '-af', 'afade=t=in:st=0:d=0.5',
      '-t', String(endCardDuration),
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      '-shortest', '-y', endCardPath,
    ],
    'end card',
  );

  // Step 3: Concat
  const concatList = path.join(CONFIG.outputDir, `concat-gameplay-${timestamp}.txt`);
  await writeFile(concatList, `file '${mainPath}'\nfile '${endCardPath}'`);

  await runFFmpeg(
    [
      '-f', 'concat', '-safe', '0', '-i', concatList,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      '-y', outputPath,
    ],
    'concat',
  );

  // Cleanup
  await unlink(mainPath).catch(() => {});
  await unlink(endCardPath).catch(() => {});
  await unlink(concatList).catch(() => {});

  log('info', `Final gameplay video: ${outputPath}`);
  return outputPath;
}

// ============================================================================
// POSTING
// ============================================================================

async function publishToSocials(videoPath, caption) {
  log('info', 'Publishing gameplay to social platforms...');

  if (!CONFIG.postizApiKey) throw new Error('POSTIZ_API_KEY must be set');

  const platforms = [];
  if (CONFIG.postizYouTubeId) {
    platforms.push({
      id: CONFIG.postizYouTubeId,
      type: 'youtube',
      buildPost: (file, cap) => ({
        integration: { id: CONFIG.postizYouTubeId },
        value: [{ content: cap, image: [{ id: file.id, path: file.path }] }],
        settings: {
          __type: 'youtube',
          title: cap.replace(/[🎮🏆⚡🕹️💰🚀🎯🔄❌⭕🎲🃏]/g, '').trim().slice(0, 100),
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
      buildPost: (file, cap) => ({
        integration: { id: CONFIG.postizInstagramId },
        value: [{ content: cap, image: [{ id: file.id, path: file.path }] }],
        settings: { __type: 'instagram', post_type: 'reel' },
      }),
    });
  }
  if (CONFIG.postizTiktokId) {
    platforms.push({
      id: CONFIG.postizTiktokId,
      type: 'TikTok',
      buildPost: (file, cap) => ({
        integration: { id: CONFIG.postizTiktokId },
        value: [{ content: cap, image: [{ id: file.id, path: file.path }] }],
        settings: {
          __type: 'tiktok',
          title: cap.replace(/[🎮🏆⚡🕹️💰🚀🎯🔄❌⭕🎲🃏]/g, '').trim().slice(0, 90),
          privacy_level: 'PUBLIC_TO_EVERYONE',
          duet: false, stitch: false, comment: true,
          autoAddMusic: 'no',
          brand_content_toggle: false, brand_organic_toggle: false,
          video_made_with_ai: false,
          content_posting_method: 'DIRECT_POST',
        },
      }),
    });
  }

  if (platforms.length === 0) {
    throw new Error('No platform integration IDs set');
  }

  const headers = { Authorization: CONFIG.postizApiKey };

  // Upload
  const videoBuffer = await readFile(videoPath);
  const form = new FormData();
  form.append('file', videoBuffer, {
    filename: path.basename(videoPath),
    contentType: 'video/mp4',
  });

  const uploadRes = await axios.post(`${CONFIG.postizBaseUrl}/upload`, form, {
    headers: { ...headers, ...form.headers },
    timeout: 120000,
  });
  const uploadedFile = uploadRes.data;
  log('info', 'Video uploaded', { id: uploadedFile.id });

  // Post to each platform
  const results = [];
  for (const platform of platforms) {
    try {
      const postData = {
        type: 'now',
        date: new Date().toISOString(),
        shortLink: false,
        tags: [],
        posts: [platform.buildPost(uploadedFile, caption)],
      };
      const postRes = await axios.post(`${CONFIG.postizBaseUrl}/posts`, postData, {
        headers: { ...headers, 'Content-Type': 'application/json' },
        timeout: 120000,
      });
      log('info', `${platform.type} post created`, { response: postRes.data });
      results.push({ platform: platform.type, success: true, data: postRes.data });
    } catch (error) {
      log('error', `${platform.type} post failed`, { error: error.message });
      results.push({ platform: platform.type, success: false, error: error.message });
    }
  }

  const successes = results.filter((r) => r.success);
  return {
    success: successes.length > 0,
    message: `Published to ${successes.map((r) => r.platform).join(', ') || 'none'}`,
    results,
  };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const startTime = Date.now();
  log('info', '=== Gameplay Shorts Factory Started ===');

  let rawVideoPath = null;

  try {
    const capture = await recordGameplay();
    rawVideoPath = capture.videoPath;

    const outputPath = await processVideo(capture.videoPath, capture.duration);
    await publishToSocials(outputPath, capture.caption);

    await cleanDirectory(CONFIG.rawCapturesDir);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log('info', `=== Gameplay Shorts Factory Completed in ${duration}s ===`);
    log('info', `Output: ${outputPath}`);

    return { success: true, videoPath: outputPath, caption: capture.caption };
  } catch (error) {
    log('error', '=== Gameplay Shorts Factory Failed ===', {
      error: error.message,
    });
    await cleanDirectory(CONFIG.rawCapturesDir).catch(() => {});
    process.exit(1);
  }
}

main();
