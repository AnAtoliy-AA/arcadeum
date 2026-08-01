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
const { readdir, unlink, mkdir, stat, readFile, writeFile } = require('fs/promises');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  baseUrl: 'https://arcadeum.games',
  rawCapturesDir: path.join(__dirname, '..', '..', 'raw_captures'),
  outputDir: path.join(__dirname, '..', '..', 'output'),
  fullDuration: { min: 55000, max: 65000 },
  shortDuration: { min: 3, max: 5 },
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
      await page.waitForSelector('[data-testid="ttt-cell-0-0"], [data-testid="game-board-section"]', { timeout: 15000 });
    },
    async makeMove(page, move) {
      const cell = page.locator(`[data-testid="ttt-cell-${move.row}-${move.col}"]`);
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
    caption: 'Cascade - match the colors! 🃏',
    moves: [],
    async waitForGame(page) {
      await page.waitForSelector('[data-testid="cascade-turn-avatar"]', { timeout: 15000 });
      await page.waitForTimeout(2000);
    },
    async makeMove(page) {
      // If color picker overlay is open, dismiss it by clicking a color
      const picker = page.locator('.CascadeGame-module__WaeW-q__pickerBackdrop');
      if ((await picker.count()) > 0 && await picker.isVisible()) {
        const colorBtn = page.locator('.CascadeGame-module__WaeW-q__pickerBackdrop button').first();
        if ((await colorBtn.count()) > 0) {
          await colorBtn.click({ force: true });
          await sleep(500);
          return true;
        }
      }

      // Click enabled (playable) hand buttons — force:true to bypass any overlays
      const playable = page.locator('[data-testid="game-board-section"] button:not([disabled]):not([aria-label*="Draw"]):not([aria-label*="Discard"])');
      const count = await playable.count();
      if (count > 0) {
        const idx = Math.floor(Math.random() * count);
        await playable.nth(idx).click({ force: true });
        return true;
      }
      // If no playable cards, click the draw pile
      const drawPile = page.locator('[data-testid="game-board-section"] button[aria-label*="Draw"]');
      if ((await drawPile.count()) > 0) {
        await drawPile.first().click({ force: true });
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
    caption: 'Critical - card combos for the win! ⚡',
    moves: [],
    async waitForGame(page) {
      // Try hand-rail-play first, fallback to cascade-turn-avatar or any game indicator
      try {
        await page.waitForSelector('[data-testid="hand-rail-play"]', { timeout: 10000 });
      } catch {
        await page.waitForSelector('[data-testid="game-board-section"], [data-testid="turn-status-pill"]', { timeout: 10000 });
      }
      await page.waitForTimeout(2000);
    },
    async makeMove(page) {
      const playBtn = page.locator('[data-testid="hand-rail-play"]');
      if ((await playBtn.count()) > 0 && await playBtn.isEnabled()) {
        await playBtn.click({ force: true });
        return true;
      }
      const card = page.locator('[data-testid^="hand-card-"][data-testid$="-0"]').first();
      if ((await card.count()) > 0) {
        await card.click({ force: true });
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
// GAMEPLAY RECORDING (parameterized viewport)
// ============================================================================

async function recordSession(game, viewport, maxDurationMs, label, isMobile = false) {
  log('info', `Recording ${label} session (${viewport.width}x${viewport.height})...`);

  let browser = null;

  try {
    await ensureDir(CONFIG.rawCapturesDir);

    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
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
      contextOptions.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
    }

    const context = await browser.newContext(contextOptions);

    const page = await context.newPage();

    const gameUrl = `${CONFIG.baseUrl}${game.url}`;
    await page.goto(gameUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // Step 1: Wait for and click "Play vs AI now" button
    log('info', `${label}: looking for Play vs AI button...`);
    const quickplayBtn = page.locator('[data-testid="quickplay-ai-button"]').first();
    await quickplayBtn.waitFor({ state: 'visible', timeout: 10000 });
    await quickplayBtn.click({ force: true });
    log('info', `${label}: clicked Play vs AI`);

    // Step 2: Wait for lobby, then click "Start Game"
    log('info', `${label}: looking for Start Game button...`);
    const startBtn = page.locator('[data-testid="start-with-bots-button"]');
    await startBtn.waitFor({ state: 'visible', timeout: 15000 });
    await startBtn.click({ force: true });
    log('info', `${label}: clicked Start Game`);

    // Step 3: Wait for game board
    await game.waitForGame(page);
    log('info', `${label}: game board loaded`);

    const startTime = Date.now();
    let moveCount = 0;
    let moveIndex = 0;

    while (Date.now() - startTime < maxDurationMs) {
      let attempts = 0;
      while (!(await game.isMyTurn(page)) && attempts < 30) {
        await sleep(500);
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
          await sleep(randomInt(300, 800));
        } else {
          await sleep(300);
        }
      } else {
        await sleep(500);
      }
    }

    const finalDuration = Date.now() - startTime;
    log('info', `${label}: recorded ${moveCount} moves in ${(finalDuration / 1000).toFixed(1)}s`);

    await context.close();
    await browser.close();
    browser = null;

    const latestVideo = await getLatestFile(CONFIG.rawCapturesDir);
    if (!latestVideo) throw new Error('No video file found');

    return {
      videoPath: latestVideo,
      duration: finalDuration,
    };
  } catch (error) {
    log('error', `${label} recording failed`, { error: error.message });
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

async function buildEndCard(timestamp, suffix, width, height) {
  const endCardPath = path.join(CONFIG.outputDir, `gameplay-endcard-${suffix}-${timestamp}.mp4`);
  const titleSize = height > width ? 80 : 64;
  const subtitleSize = height > width ? 32 : 24;
  const dur = CONFIG.endCardDuration;

  // Animation: title fades in + scales from 0.8→1.0, subtitle fades in slightly later
  const vf = [
    `scale=${width}:${height}`,
    `drawtext=text='arcadeum.games':fontcolor=white:fontsize=${titleSize}:x=(w-text_w)/2:y=(h/2-text_h-30):font=sans-serif:alpha='if(lt(t,0.6),t/0.6,1)'`,
    `drawtext=text='forever free online board games':fontcolor=0xBBBBBB:fontsize=${subtitleSize}:x=(w-text_w)/2:y=(h/2+30):font=sans-serif:alpha='if(lt(t,1.0),(t-0.4)/0.6,1)'`,
    `fade=t=in:st=0:d=0.5`,
    `fade=t=out:st=${dur - 0.5}:d=0.5`,
  ].join(',');

  await runFFmpeg(
    [
      '-f', 'lavfi', '-i', `color=c=black:s=${width}x${height}:d=${dur}:r=30`,
      '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
      '-vf', vf,
      '-af', 'afade=t=in:st=0:d=0.3,afade=t=out:st=' + (dur - 0.5) + ':d=0.5',
      '-t', String(dur),
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

async function processFullVideo(rawVideoPath, recordedDuration) {
  log('info', 'Processing full video (desktop)...');

  const tracks = await getAudioTracks();
  const audioTrack = randomElement(tracks);
  const timestamp = Date.now();
  const durationSec = Math.min(Math.ceil(recordedDuration / 1000), 70);
  const fadeStart = Math.max(0, durationSec - CONFIG.fadeOutDuration);

  const mainPath = path.join(CONFIG.outputDir, `gameplay-full-main-${timestamp}.mp4`);
  const endCardPath = await buildEndCard(timestamp, 'full', 1920, 1080);
  const outputPath = path.join(CONFIG.outputDir, `gameplay-full-${timestamp}.mp4`);

  await runFFmpeg(
    [
      '-i', rawVideoPath,
      '-i', audioTrack,
      '-t', String(durationSec),
      '-af', `afade=t=out:st=${fadeStart}:d=${CONFIG.fadeOutDuration}`,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      '-y', '-shortest', mainPath,
    ],
    'full main video',
  );

  await concatVideos([mainPath, endCardPath], outputPath, 'full');
  await unlink(mainPath).catch(() => {});
  await unlink(endCardPath).catch(() => {});

  log('info', `Full video: ${outputPath}`);
  return outputPath;
}

async function processShortClip(rawVideoPath, recordedDuration) {
  log('info', 'Processing short clip (mobile)...');

  const tracks = await getAudioTracks();
  const audioTrack = randomElement(tracks);
  const timestamp = Date.now();
  const shortLen = randomInt(CONFIG.shortDuration.min, CONFIG.shortDuration.max);
  const totalSec = recordedDuration / 1000;
  // Start from 60% of the video to skip landing page / lobby
  const earliestStart = Math.max(0, totalSec * 0.6);
  const latestStart = Math.max(earliestStart, totalSec - shortLen - 2);
  const clipStart = randomInt(Math.floor(earliestStart), Math.floor(latestStart));

  const mainPath = path.join(CONFIG.outputDir, `gameplay-short-main-${timestamp}.mp4`);
  const endCardPath = await buildEndCard(timestamp, 'short', 1080, 1920);
  const outputPath = path.join(CONFIG.outputDir, `gameplay-short-${timestamp}.mp4`);

  // Scale from 430x932 (real mobile) to 1080x1920 (YouTube Shorts) and pad to fill
  await runFFmpeg(
    [
      '-i', rawVideoPath,
      '-i', audioTrack,
      '-ss', String(clipStart),
      '-t', String(shortLen),
      '-vf', `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black`,
      '-af', `afade=t=out:st=${Math.max(0, shortLen - CONFIG.fadeOutDuration)}:d=${CONFIG.fadeOutDuration}`,
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-b:a', '128k',
      '-y', '-shortest', mainPath,
    ],
    'short highlight clip',
  );

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
    headers: { ...headers, ...form.headers },
    timeout: 120000,
  });
  return uploadRes.data;
}

async function postToYouTube(uploadedFile, caption) {
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
        type: 'public',
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

  // --- Full video → YouTube Video (horizontal) ---
  if (CONFIG.postizYouTubeId) {
    try {
      log('info', 'Uploading full video (desktop 1920x1080)...');
      const fullFile = await uploadVideo(fullPath);
      log('info', 'Full video uploaded', { id: fullFile.id });
      results.full = await postToYouTube(fullFile, caption);
      log('info', 'YouTube video posted', results.full);
    } catch (err) {
      log('error', 'Full video YouTube post failed', { error: err.message });
    }
  }

  // --- Short clip → YouTube Short + Instagram Reel + TikTok (vertical) ---
  try {
    log('info', 'Uploading short clip (mobile 1080x1920)...');
    const shortFile = await uploadVideo(shortPath);
    log('info', 'Short clip uploaded', { id: shortFile.id });

    if (CONFIG.postizYouTubeId) {
      try {
        results.short = await postToYouTube(shortFile, caption);
        log('info', 'YouTube Short posted', results.short);
      } catch (err) {
        log('error', 'YouTube Short post failed', { error: err.message });
      }
    }

    if (CONFIG.postizInstagramId) {
      try {
        const igResult = await postToInstagram(shortFile, caption);
        log('info', 'Instagram Reel posted', igResult);
      } catch (err) {
        log('error', 'Instagram Reel post failed', { error: err.message });
      }
    }

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
  const previewMode = process.argv.includes('--preview');

  if (previewMode) {
    log('info', '=== Gameplay Factory Started (PREVIEW MODE - no posting) ===');
  } else {
    log('info', '=== Gameplay Factory Started ===');
  }

  try {
    const game = randomElement(GAMES);
    log('info', `Selected game: ${game.name}`);

    // --- Session 1: Desktop (1920x1080) for full video ---
    const fullDuration = randomInt(CONFIG.fullDuration.min, CONFIG.fullDuration.max);
    const desktopCapture = await recordSession(
      game,
      { width: 1920, height: 1080 },
      fullDuration,
      'desktop',
      false,
    );

    // --- Session 2: Mobile (real phone viewport) for short clip ---
    // Use actual iPhone dimensions (430x932) to get real mobile layout
    const mobileCapture = await recordSession(
      game,
      { width: 430, height: 932 },
      30000, // 30s total — enough for navigation + real gameplay
      'mobile',
      true,
    );

    // --- Process both ---
    const fullOutputPath = await processFullVideo(desktopCapture.videoPath, desktopCapture.duration);
    const shortOutputPath = await processShortClip(mobileCapture.videoPath, mobileCapture.duration);

    // --- Publish (skip in preview mode) ---
    if (previewMode) {
      log('info', '=== PREVIEW MODE: Skipping publish ===');
      log('info', 'Full video saved to: ' + fullOutputPath);
      log('info', 'Short clip saved to: ' + shortOutputPath);
    } else {
      await publishBoth(fullOutputPath, shortOutputPath, game.caption);
    }

    await cleanDirectory(CONFIG.rawCapturesDir);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    log('info', `=== Gameplay Factory Completed in ${duration}s ===`);
    log('info', `Full: ${fullOutputPath}`);
    log('info', `Short: ${shortOutputPath}`);

    return { success: true, full: fullOutputPath, short: shortOutputPath };
  } catch (error) {
    log('error', '=== Gameplay Factory Failed ===', { error: error.message });
    await cleanDirectory(CONFIG.rawCapturesDir).catch(() => {});
    process.exit(1);
  }
}

main();
