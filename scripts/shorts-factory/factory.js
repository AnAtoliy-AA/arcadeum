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

  // Interaction settings
  interactionCount: { min: 8, max: 15 },
  pauseBetweenInteractions: { min: 300, max: 800 }, // milliseconds
  scrollAmount: { min: 100, max: 400 }, // pixels

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
// PAGES TO VISIT (random browsing targets)
// ============================================================================

const PAGES = [
  '/en',
  '/en/games',
  '/en/games/create',
  '/en/games/sea-battle',
  '/en/games/critical',
  '/en/games/tic-tac-toe',
  '/en/games/glimworm',
  '/en/games/cascade',
  '/en/blog',
  '/en/community',
  '/en/leaderboards',
  '/en/rewards',
  '/en/tournaments',
  '/en/shop',
  '/en/developers',
];

// ============================================================================
// AUDIO TRACKS (same as in-game music player)
// ============================================================================

const CDN_BASE =
  process.env.SHORTS_CDN_URL;
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
 * Captures random browsing video using Playwright
 */
async function captureBrowsing() {
  log('info', 'Starting Playwright automation...');

  let browser = null;

  try {
    // Ensure raw captures directory exists
    await ensureDir(CONFIG.rawCapturesDir);

    // Launch Chromium browser in headless mode
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

    // Create browser context with video recording
    const context = await browser.newContext({
      viewport: CONFIG.viewport,
      recordVideo: {
        dir: CONFIG.rawCapturesDir,
        size: CONFIG.viewport,
      },
    });

    log('info', 'Browser context created with video recording');

    // Create a new page
    const page = await context.newPage();
    log('info', 'New page created');

    // Start recording duration tracking
    const startTime = Date.now();
    const targetDuration =
      randomInt(CONFIG.videoDuration.min, CONFIG.videoDuration.max) * 1000;
    log('info', `Target recording duration: ${targetDuration / 1000}s`);

    // Navigate to a random starting page
    const startPage = randomElement(PAGES);
    const startUrl = `${CONFIG.baseUrl}${startPage}`;
    log('info', `Navigating to ${startUrl}`);

    await page.goto(startUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    log('info', 'Page loaded successfully');

    // Wait for page to settle
    await sleep(1500);

    // Perform random interactions until we reach target duration
    const interactionCount = randomInt(
      CONFIG.interactionCount.min,
      CONFIG.interactionCount.max,
    );
    log('info', `Performing up to ${interactionCount} random interactions...`);

    for (let i = 0; i < interactionCount; i++) {
      // Check if we've exceeded target duration
      const elapsed = Date.now() - startTime;
      if (elapsed >= targetDuration) {
        log('info', `Target duration reached (${elapsed}ms)`);
        break;
      }

      // Randomly choose an action type
      const actionType = randomElement([
        'click',
        'scroll',
        'hover',
        'navigate',
      ]);

      switch (actionType) {
        case 'click': {
          // Click a random visible element or coordinate
          const x = randomInt(50, CONFIG.viewport.width - 50);
          const y = randomInt(100, CONFIG.viewport.height - 100);
          log('info', `Interaction ${i + 1}: Click at (${x}, ${y})`);

          const steps = randomInt(3, 8);
          await page.mouse.move(x, y, { steps });
          await page.mouse.click(x, y);
          break;
        }

        case 'scroll': {
          const direction = randomElement([1, -1]);
          const amount =
            randomInt(CONFIG.scrollAmount.min, CONFIG.scrollAmount.max) *
            direction;
          log('info', `Interaction ${i + 1}: Scroll ${amount}px`);

          await page.mouse.wheel(0, amount);
          break;
        }

        case 'hover': {
          const hoverX = randomInt(50, CONFIG.viewport.width - 50);
          const hoverY = randomInt(100, CONFIG.viewport.height - 100);
          log('info', `Interaction ${i + 1}: Hover at (${hoverX}, ${hoverY})`);

          await page.mouse.move(hoverX, hoverY, { steps: 5 });
          break;
        }

        case 'navigate': {
          const nextPage = randomElement(PAGES);
          const nextUrl = `${CONFIG.baseUrl}${nextPage}`;
          log('info', `Interaction ${i + 1}: Navigate to ${nextUrl}`);

          try {
            await page.goto(nextUrl, {
              waitUntil: 'domcontentloaded',
              timeout: 30000,
            });
            await sleep(1000);
          } catch (navError) {
            log('warn', `Navigation failed, staying on current page`, {
              error: navError.message,
            });
          }
          break;
        }
      }

      // Random pause between interactions
      const pauseDuration = randomInt(
        CONFIG.pauseBetweenInteractions.min,
        CONFIG.pauseBetweenInteractions.max,
      );
      await sleep(pauseDuration);
    }

    // Log final duration
    const finalDuration = Date.now() - startTime;
    log('info', `Browsing simulation complete (${finalDuration}ms total)`);

    // Close the context to save the video
    await context.close();
    log('info', 'Browser context closed, video saved');

    // Close browser
    await browser.close();
    browser = null;
    log('info', 'Browser closed successfully');

    // Wait for file system to sync
    await sleep(1000);

    // Get the latest video file
    const latestVideo = await getLatestFile(CONFIG.rawCapturesDir);
    if (!latestVideo) {
      throw new Error('No video file found in raw captures directory');
    }

    log('info', `Raw video captured: ${latestVideo}`);
    return { videoPath: latestVideo, duration: finalDuration };
  } catch (error) {
    log('error', 'Failed to capture browsing', {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    // Ensure browser is closed even on error
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
    const caption = randomElement(CAPTIONS);
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
