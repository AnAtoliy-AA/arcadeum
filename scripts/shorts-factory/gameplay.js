#!/usr/bin/env node

/**
 * Gameplay Factory - Records actual gameplay footage
 *
 * Two outputs per run:
 *   1. Full gameplay video (~60s) → YouTube video
 *   2. Short highlight clip (5-10s) → YouTube Short + Instagram Reel
 *
 * Both get an arcadeum.games end card.
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
  // Full video: 55-65s of gameplay + 2s end card
  fullDuration: { min: 55000, max: 65000 },
  // Short clip: 5-10s highlight + 2s end card
  shortDuration: { min: 5, max: 10 },
  fadeOutDuration: 2,
  endCardDuration: 2,
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
      await page.waitForSelector('[data-testid="ttt-cell-0-0"]', { timeout: 15000 });
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
    caption: 'Cascade - match the colors! 🃏',
    moves: [],
    async waitForGame(page) {
      await page.waitForSelector('[data-testid="cascade-turn-avatar"]', { timeout: 15000 });
      await page.waitForTimeout(2000);
    },
    async makeMove(page) {
      // Click any button with a pulsing/glowing animation (playable cards)
      const playable = page.locator('[data-testid="hand-rail"] button[style*="pulsing"], [data-testid="hand-rail"] button:has([class*="glow"])');
      if ((await playable.count()) > 0) {
        await playable.first().click();
        return true;
      }
      // Fallback: try any clickable card in the hand area
      const handCard = page.locator('[data-testid="hand-cards"] button').first();
      if ((await handCard.count()) > 0) {
        await handCard.click();
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
    name: 'critical',
    slug: 'critical_v1',
    url: '/en/games/critical',
    caption: 'Critical - card combos for the win! ⚡',
    moves: [],
    async waitForGame(page) {
      await page.waitForSelector('[data-testid="hand-rail-play"]', { timeout: 15000 });
      await page.waitForTimeout(2000);
    },
    async makeMove(page) {
      // Try to play a card via the play button
      const playBtn = page.locator('[data-testid="hand-rail-play"]');
      if ((await playBtn.count()) > 0 && await playBtn.isEnabled()) {
        await playBtn.click();
        return true;
      }
      // Fallback: click a card in hand
      const card = page.locator('[data-testid^="hand-card-"][data-testid$="-0"]').first();
      if ((await card.count()) > 0) {
        await card.click();
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
// AUDIO TRACKS
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

    // Navigate to game page
    const gameUrl = `${CONFIG.baseUrl}${game.url}`;
    log('info', `Navigating to ${gameUrl}`);
    await page.goto(gameUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);

    // Click "Play vs AI"
    log('info', 'Clicking "Play vs AI" button...');
    const quickplayBtn = page.locator('[data-testid="quickplay-ai-button"]').first();

    if ((await quickplayBtn.count()) > 0) {
      log('info', 'Clicking quickplay button');
      await quickplayBtn.click();
      await sleep(5000);
    } else {
      log('warn', 'No quickplay button found');
    }

    // Handle lobby
    const startBtn = page.locator('[data-testid="start-with-bots-button"]');
    if ((await startBtn.count()) > 0) {
      log('info', 'In lobby, waiting for bot to join...');
      await sleep(3000);
      log('info', 'Clicking "Start Game"');
      await startBtn.click();
      await sleep(5000);
    }

    // Wait for game board
    log('info', 'Waiting for game board...');
    await game.waitForGame(page);
    log('info', 'Game board loaded!');

    // Play moves for full duration (~60s)
    const startTime = Date.now();
    const maxDuration = randomInt(CONFIG.fullDuration.min, CONFIG.fullDuration.max);
    let moveCount = 0;
    let moveIndex = 0;

    while (Date.now() - startTime < maxDuration) {
      // Wait for our turn
      let attempts = 0;
      while (!(await game.isMyTurn(page)) && attempts < 30) {
        await sleep(500);
        attempts++;
        if (Date.now() - startTime >= maxDuration) break;
      }

      if (await game.isMyTurn(page)) {
        let move;
        if (game.moves.length > 0) {
          move = game.moves[moveIndex % game.moves.length];
          moveIndex++;
        } else {
          move = null; // dynamic games handle their own moves
        }

        const success = await game.makeMove(page, move);
        if (success) {
          moveCount++;
          log('info', `Move ${moveCount}`);
          await sleep(randomInt(800, 2000)); // natural pacing
        } else {
          await sleep(1000);
        }
      } else {
        await sleep(500);
      }
    }

    const finalDuration = Date.now() - startTime;
    log('info', `Gameplay recorded: ${moveCount} moves in ${(finalDuration / 1000).toFixed(1)}s`);

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
// FFMPEG PROCESSING
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
        log('error', `FFmpeg (${label}) failed`, { code, stderr: stderr.slice(-500) });
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
    ffmpeg.on('error', reject);
  });
}

async function buildEndCard(timestamp, suffix) {
  const endCardPath = path.join(CONFIG.outputDir, `gameplay-endcard-${suffix}-${timestamp}.mp4`);
  await runFFmpeg(
    [
      '-f', 'lavfi', '-i', `color=c=black:s=1080x1920:d=${CONFIG.endCardDuration}:r=30`,
      '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
      '-vf', `drawtext=text='arcadeum.games':fontcolor=white:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2:font=sans-serif:alpha='if(lt(t,0.5),t/0.5,1)'`,
      '-af', 'afade=t=in:st=0:d=0.5',
      '-t', String(CONFIG.endCardDuration),
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      '-shortest', '-y', endCardPath,
    ],
    `end card (${suffix})`,
  );
  return endCardPath;
}

async function concatVideos(parts, outputPath, label) {
  const timestamp = Date.now();
  const concatList = path.join(CONFIG.outputDir, `concat-${label}-${timestamp}.txt`);
  await writeFile(concatList, parts.map((p) => `file '${p}'`).join('\n'));

  await runFFmpeg(
    [
      '-f', 'concat', '-safe', '0', '-i', concatList,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      '-y', outputPath,
    ],
    `concat (${label})`,
  );

  await unlink(concatList).catch(() => {});
}

async function processVideos(rawVideoPath, recordedDuration) {
  log('info', 'Processing gameplay videos...');
  await ensureDir(CONFIG.outputDir);

  const tracks = await getAudioTracks();
  const audioTrack = randomElement(tracks);
  const timestamp = Date.now();

  // === FULL VIDEO (55-65s + 2s end card) ===
  const fullDurationSec = Math.min(Math.ceil(recordedDuration / 1000), 65);
  const fullFadeStart = Math.max(0, fullDurationSec - CONFIG.fadeOutDuration);
  const fullMainPath = path.join(CONFIG.outputDir, `gameplay-full-main-${timestamp}.mp4`);
  const fullEndCardPath = await buildEndCard(timestamp, 'full');
  const fullOutputPath = path.join(CONFIG.outputDir, `gameplay-full-${timestamp}.mp4`);

  await runFFmpeg(
    [
      '-i', rawVideoPath,
      '-i', audioTrack,
      '-t', String(fullDurationSec),
      '-af', `afade=t=out:st=${fullFadeStart}:d=${CONFIG.fadeOutDuration}`,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      '-y', '-shortest', fullMainPath,
    ],
    'full main video',
  );

  await concatVideos([fullMainPath, fullEndCardPath], fullOutputPath, 'full');

  await unlink(fullMainPath).catch(() => {});
  await unlink(fullEndCardPath).catch(() => {});

  log('info', `Full video: ${fullOutputPath}`);

  // === SHORT CLIP (5-10s highlight from middle + 2s end card) ===
  const totalSec = recordedDuration / 1000;
  const shortLen = randomInt(CONFIG.shortDuration.min, CONFIG.shortDuration.max);
  // Pick from middle 70% of the video
  const earliestStart = Math.max(0, totalSec * 0.15);
  const latestStart = Math.max(earliestStart, totalSec - shortLen - 2);
  const clipStart = randomInt(Math.floor(earliestStart), Math.floor(latestStart));

  const shortMainPath = path.join(CONFIG.outputDir, `gameplay-short-main-${timestamp}.mp4`);
  const shortEndCardPath = await buildEndCard(timestamp, 'short');
  const shortOutputPath = path.join(CONFIG.outputDir, `gameplay-short-${timestamp}.mp4`);

  await runFFmpeg(
    [
      '-i', rawVideoPath,
      '-i', audioTrack,
      '-ss', String(clipStart),
      '-t', String(shortLen),
      '-af', `afade=t=out:st=${Math.max(0, shortLen - CONFIG.fadeOutDuration)}:d=${CONFIG.fadeOutDuration}`,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      '-y', '-shortest', shortMainPath,
    ],
    'short highlight clip',
  );

  await concatVideos([shortMainPath, shortEndCardPath], shortOutputPath, 'short');

  await unlink(shortMainPath).catch(() => {});
  await unlink(shortEndCardPath).catch(() => {});

  log('info', `Short clip: ${shortOutputPath}`);

  return { fullOutputPath, shortOutputPath };
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
    headers: { ...headers, ...form.headers },
    timeout: 120000,
  });
  return uploadRes.data;
}

async function postToYouTube(uploadedFile, caption, type = 'public') {
  if (!CONFIG.postizYouTubeId) return null;
  const headers = { Authorization: CONFIG.postizApiKey, 'Content-Type': 'application/json' };

  const postData = {
    type: 'now',
    date: new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: [{
      integration: { id: CONFIG.postizYouTubeId },
      value: [{ content: caption, image: [{ id: uploadedFile.id, path: uploadedFile.path }] }],
      settings: {
        __type: 'youtube',
        title: caption.replace(/[🎮🏆⚡🕹️💰🚀🎯🔄❌⭕🎲🃏]/g, '').trim().slice(0, 100),
        type,
        selfDeclaredMadeForKids: 'no',
      },
    }],
  };

  const res = await axios.post(`${CONFIG.postizBaseUrl}/posts`, postData, {
    headers,
    timeout: 120000,
  });
  return res.data;
}

async function postToInstagram(uploadedFile, caption) {
  if (!CONFIG.postizInstagramId) return null;
  const headers = { Authorization: CONFIG.postizApiKey, 'Content-Type': 'application/json' };

  const postData = {
    type: 'now',
    date: new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: [{
      integration: { id: CONFIG.postizInstagramId },
      value: [{ content: caption, image: [{ id: uploadedFile.id, path: uploadedFile.path }] }],
      settings: { __type: 'instagram', post_type: 'reel' },
    }],
  };

  const res = await axios.post(`${CONFIG.postizBaseUrl}/posts`, postData, {
    headers,
    timeout: 120000,
  });
  return res.data;
}

async function postToTikTok(uploadedFile, caption) {
  if (!CONFIG.postizTiktokId) return null;
  const headers = { Authorization: CONFIG.postizApiKey, 'Content-Type': 'application/json' };

  const postData = {
    type: 'now',
    date: new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: [{
      integration: { id: CONFIG.postizTiktokId },
      value: [{ content: caption, image: [{ id: uploadedFile.id, path: uploadedFile.path }] }],
      settings: {
        __type: 'tiktok',
        title: caption.replace(/[🎮🏆⚡🕹️💰🚀🎯🔄❌⭕🎲🃏]/g, '').trim().slice(0, 90),
        privacy_level: 'PUBLIC_TO_EVERYONE',
        duet: false, stitch: false, comment: true,
        autoAddMusic: 'no',
        brand_content_toggle: false, brand_organic_toggle: false,
        video_made_with_ai: false,
        content_posting_method: 'DIRECT_POST',
      },
    }],
  };

  const res = await axios.post(`${CONFIG.postizBaseUrl}/posts`, postData, {
    headers,
    timeout: 120000,
  });
  return res.data;
}

async function publishBoth(fullPath, shortPath, caption) {
  log('info', 'Publishing to social platforms...');

  if (!CONFIG.postizApiKey) throw new Error('POSTIZ_API_KEY must be set');

  const results = { full: null, short: null };

  // --- Upload full video ---
  if (CONFIG.postizYouTubeId) {
    try {
      log('info', 'Uploading full video...');
      const fullFile = await uploadVideo(fullPath);
      log('info', 'Full video uploaded', { id: fullFile.id });
      results.full = await postToYouTube(fullFile, caption, 'public');
      log('info', 'YouTube full video posted', results.full);
    } catch (err) {
      log('error', 'Full video YouTube post failed', { error: err.message });
    }
  }

  // --- Upload short clip ---
  try {
    log('info', 'Uploading short clip...');
    const shortFile = await uploadVideo(shortPath);
    log('info', 'Short clip uploaded', { id: shortFile.id });

    // YouTube Short
    if (CONFIG.postizYouTubeId) {
      try {
        results.short = await postToYouTube(shortFile, caption, 'public');
        log('info', 'YouTube Short posted', results.short);
      } catch (err) {
        log('error', 'YouTube Short post failed', { error: err.message });
      }
    }

    // Instagram Reel
    if (CONFIG.postizInstagramId) {
      try {
        const igResult = await postToInstagram(shortFile, caption);
        log('info', 'Instagram Reel posted', igResult);
      } catch (err) {
        log('error', 'Instagram Reel post failed', { error: err.message });
      }
    }

    // TikTok
    if (CONFIG.postizTiktokId) {
      try {
        const ttResult = await postToTikTok(shortFile, caption);
        log('info', 'TikTok posted', ttResult);
      } catch (err) {
        log('error', 'TikTok post failed', { error: err.message });
      }
    }
  } catch (err) {
    log('error', 'Short clip upload failed', { error: err.message });
  }

  return results;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const startTime = Date.now();
  log('info', '=== Gameplay Factory Started ===');

  let rawVideoPath = null;

  try {
    const capture = await recordGameplay();
    rawVideoPath = capture.videoPath;

    const { fullOutputPath, shortOutputPath } = await processVideos(
      capture.videoPath,
      capture.duration,
    );

    await publishBoth(fullOutputPath, shortOutputPath, capture.caption);

    await cleanDirectory(CONFIG.rawCapturesDir);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log('info', `=== Gameplay Factory Completed in ${duration}s ===`);
    log('info', `Full: ${fullOutputPath}`);
    log('info', `Short: ${shortOutputPath}`);

    return { success: true, full: fullOutputPath, short: shortOutputPath };
  } catch (error) {
    log('error', '=== Gameplay Factory Failed ===', {
      error: error.message,
    });
    await cleanDirectory(CONFIG.rawCapturesDir).catch(() => {});
    process.exit(1);
  }
}

main();
