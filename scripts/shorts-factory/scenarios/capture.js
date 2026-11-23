'use strict';

const fs = require('fs');
const path = require('path');
const { CAPTURE } = require('./constants');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Record an HTML scene at 1080x1920 with Playwright. Retries on failure and
 * validates the output file so a broken capture never reaches the pipeline.
 * Returns { videoPath, durationMs, sceneStartOffsetMs, dramaticMomentMs }.
 */
async function captureScene({
  html,
  outDir,
  maxMs = 45000,
  retries = 2,
  chromium,
  log = () => {},
}) {
  const pw = chromium || require('playwright').chromium;
  fs.mkdirSync(outDir, { recursive: true });
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    let browser;
    try {
      browser = await pw.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
      });
      const t0 = Date.now();
      const context = await browser.newContext({
        viewport: { width: CAPTURE.width, height: CAPTURE.height },
        deviceScaleFactor: 1,
        recordVideo: {
          dir: outDir,
          size: { width: CAPTURE.width, height: CAPTURE.height },
        },
      });
      const page = await context.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      await page.waitForFunction('window.__sceneDone === true', null, {
        timeout: maxMs,
        polling: 250,
      });
      const info = await page.evaluate(() => ({
        started: window.__sceneStarted,
        marker: window.__sceneMarkerMs,
      }));
      const video = page.video();
      await context.close();
      const videoPath = await video.path();
      await browser.close();
      browser = null;
      const size = fs.existsSync(videoPath) ? fs.statSync(videoPath).size : 0;
      if (size < 10 * 1024)
        throw new Error(`capture too small (${size} bytes)`);
      return {
        videoPath,
        durationMs: Date.now() - t0,
        sceneStartOffsetMs: Math.max(0, info.started - t0),
        dramaticMomentMs: info.marker,
      };
    } catch (err) {
      lastError = err;
      log(
        'warn',
        `scene capture attempt ${attempt + 1} failed: ${err.message}`,
      );
      await sleep(1000 * (attempt + 1));
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }
  throw lastError;
}

module.exports = { captureScene, CAPTURE, path };
