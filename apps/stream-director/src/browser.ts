import type { Browser, Page } from 'playwright';
import type { Logger, SceneBrowser, StreamConfig } from './types';

type PlaywrightLoader = () => Promise<typeof import('playwright')>;

export interface ManagedBrowser extends SceneBrowser {
  close(): Promise<void>;
  isOpen(): boolean;
}

/**
 * Chromium kept open on the Xvfb display (headed, kiosk) so x11grab sees it.
 * The page stays connected as a spectator: the BE watchdog ends AI-vs-AI
 * sessions after 60s with no watchers.
 */
export function createBrowser({
  config,
  log,
  loadPlaywright = () => import('playwright'),
}: {
  config: Pick<StreamConfig, 'profile'>;
  log: Logger;
  loadPlaywright?: PlaywrightLoader;
}): ManagedBrowser {
  let browser: Browser | null = null;
  let page: Page | null = null;

  async function launch(): Promise<Page> {
    // Read at launch so a profile change (resolution) applies after a recycle.
    const { width, height } = config.profile;
    const { chromium } = await loadPlaywright();
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
        ...(process.env as Record<string, string>),
        PULSE_SINK: process.env.PULSE_SINK ?? 'arcadeum_live',
      },
    });
    const ctx = await browser.newContext({ viewport: { width, height } });
    page = await ctx.newPage();
    log.info('browser launched', { width, height });
    return page;
  }

  async function close(): Promise<void> {
    try {
      await browser?.close();
    } catch {
      /* already gone */
    }
    browser = null;
    page = null;
  }

  return {
    async goto(url: string): Promise<void> {
      const p = page ?? (await launch());
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    },
    /** Drop Chromium to cap memory growth; next goto relaunches it. */
    async recycle(): Promise<void> {
      log.info('recycling browser');
      await close();
    },
    close,
    isOpen: () => Boolean(browser?.isConnected() && page && !page.isClosed()),
  };
}
