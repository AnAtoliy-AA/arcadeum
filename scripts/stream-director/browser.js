'use strict';

/**
 * Chromium kept open on the Xvfb display (headed, kiosk) so x11grab sees it.
 * The page stays connected as a spectator: the BE watchdog ends AI-vs-AI
 * sessions after 60s with no watchers.
 */
function createBrowser({
  config,
  log,
  loadPlaywright = () => require('playwright'),
}) {
  const { width, height } = config.profile;
  let browser = null;
  let page = null;

  async function launch() {
    const { chromium } = loadPlaywright();
    browser = await chromium.launch({
      headless: false,
      args: [
        '--kiosk',
        `--window-size=${width},${height}`,
        '--window-position=0,0',
        '--autoplay-policy=no-user-gesture-required',
        '--hide-scrollbars',
        '--disable-infobars',
        '--no-first-run',
        '--disable-translate',
        '--disable-features=TranslateUI',
      ],
      env: {
        ...process.env,
        PULSE_SINK: process.env.PULSE_SINK || 'arcadeum_live',
      },
    });
    const ctx = await browser.newContext({ viewport: { width, height } });
    page = await ctx.newPage();
    log.info('browser launched', { width, height });
  }

  async function close() {
    try {
      await browser?.close();
    } catch {
      /* already gone */
    }
    browser = null;
    page = null;
  }

  return {
    async goto(url) {
      if (!page) await launch();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    },
    /** Drop Chromium to cap memory growth; next goto relaunches it. */
    async recycle() {
      log.info('recycling browser');
      await close();
    },
    close,
    isOpen: () => Boolean(browser?.isConnected?.() && page && !page.isClosed()),
  };
}

module.exports = { createBrowser };
