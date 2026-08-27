/**
 * Cache-warming engine for explicit offline game downloads.
 *
 * Strategy: a hidden same-origin iframe loads the game's route, which makes
 * the browser fetch the HTML document (NetworkFirst → `arcadeum-pages-v1`)
 * and every referenced `_next/static` chunk (CacheFirst →
 * `arcadeum-static-v1`) through the service worker's runtime rules. Resource
 * timing entries from the iframe give us the exact URL manifest so the game
 * can later be purged precisely.
 *
 * The Cache Storage API is available from `window` in secure contexts, so all
 * of this runs client-side without custom service-worker messaging.
 */
import type { DownloadableGame } from './downloadable-games';
import { offlineRouteUrl } from './downloadable-games';

const STATIC_PATH_RE = /^\/_next\/static\//;
/** Max time to wait for an iframe's pending chunks after its load event. */
const SETTLE_TIMEOUT_MS = 10_000;
const POLL_INTERVAL_MS = 250;

export type WarmResult = {
  /** Same-origin URLs (pathnames) that back this game offline. */
  urls: string[];
  sizeBytes: number;
};

export function isOfflineDownloadSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (!('caches' in window)) return false;
  // Active SW controller means everything is ready.
  if (Boolean(navigator.serviceWorker?.controller)) return true;
  // Fallback: caches API is available AND a PWA manifest is present, meaning
  // the SW may still be installing or waiting to claim.  The section should
  // render so users can discover the feature; downloads are gated on the
  // actual SW controller check inside each download action.
  return document.querySelector('link[rel="manifest"]') !== null;
}

/**
 * Returns true only when a service worker is actively controlling the page.
 * Use this to gate actions that require the SW (cache warming, etc.) as
 * opposed to just rendering the section.
 */
export function isSWActive(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(navigator.serviceWorker?.controller);
}

function toPathname(url: string): string | null {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) return null;
    return parsed.pathname;
  } catch {
    return null;
  }
}

async function collectCachedSizes(urls: string[]): Promise<number> {
  let total = 0;
  for (const pathname of urls) {
    const response = await matchInAnyCache(pathname);
    if (!response) continue;
    const header = response.headers.get('content-length');
    if (header) {
      total += Number(header);
    } else {
      try {
        total += (await response.clone().blob()).size;
      } catch {
        // Ignore unreadable bodies; size reporting is best-effort.
      }
    }
  }
  return total;
}

export async function matchInAnyCache(
  pathname: string,
): Promise<Response | undefined> {
  const names = await caches.keys();
  for (const name of names) {
    const cache = await caches.open(name);
    const hit = await cache.match(pathname);
    if (hit) return hit;
  }
  return undefined;
}

/**
 * Loads `routeUrl` in a hidden iframe and waits until its `_next/static`
 * subresources finish. Resolves with the discovered same-origin pathnames
 * (including the document itself).
 */
export function warmGameRoute(routeUrl: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.src = routeUrl;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    let settled = false;
    const timeout = setTimeout(() => finish(), SETTLE_TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(timeout);
      iframe.remove();
    };

    function finish() {
      if (settled) return;
      settled = true;
      const urls = new Set<string>([new URL(routeUrl).pathname]);
      try {
        const entries =
          iframe.contentWindow?.performance.getEntriesByType('resource') ?? [];
        for (const entry of entries) {
          const pathname = toPathname(entry.name);
          if (pathname && STATIC_PATH_RE.test(pathname)) urls.add(pathname);
        }
      } catch {
        // Cross-origin guard — same-origin by construction, but stay safe.
      }
      cleanup();
      resolve([...urls]);
    }

    iframe.addEventListener('load', () => {
      // Dynamic imports triggered on mount may still be in flight; poll until
      // every static entry has finished or we run out of patience.
      const poll = () => {
        if (settled) return;
        try {
          const entries =
            iframe.contentWindow?.performance.getEntriesByType('resource') ??
            [];
          const pending = entries.some(
            (entry) =>
              STATIC_PATH_RE.test(new URL(entry.name).pathname) &&
              (entry as PerformanceResourceTiming).responseEnd === 0,
          );
          if (!pending) finish();
        } catch {
          finish();
        }
      };
      const interval = setInterval(() => {
        if (settled) {
          clearInterval(interval);
          return;
        }
        poll();
      }, POLL_INTERVAL_MS);
      // Safety net: stop polling once the settle timeout fires.
      setTimeout(() => clearInterval(interval), SETTLE_TIMEOUT_MS + 1000);
    });

    iframe.addEventListener('error', () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(`Failed to warm ${routeUrl}`));
    });

    document.body.appendChild(iframe);
  });
}

/**
 * Ensures the route document itself is present in a runtime cache, warming it
 * explicitly as a fallback when the iframe pass missed it.
 */
export async function ensureDocumentCached(routeUrl: string): Promise<boolean> {
  const pathname = new URL(routeUrl).pathname;
  if (await matchInAnyCache(pathname)) return true;
  await fetch(routeUrl, { cache: 'default' });
  return Boolean(await matchInAnyCache(pathname));
}

/** Downloads everything needed to play `game` without a network. */
export async function downloadGameOffline(
  game: DownloadableGame,
  locale: string,
): Promise<WarmResult> {
  const routeUrl = offlineRouteUrl(game, locale);

  const urls = await warmGameRoute(routeUrl);
  if (!(await ensureDocumentCached(routeUrl))) {
    throw new Error(`Document not cached for ${routeUrl}`);
  }

  const sizeBytes = await collectCachedSizes(urls);
  return { urls, sizeBytes };
}

/**
 * Removes cached entries for `urls`. Pass only URLs that no other downloaded
 * game still references (see `resolvableUrlsForRemoval`).
 */
export async function purgeCachedUrls(urls: string[]): Promise<void> {
  const targets = new Set(urls);
  const names = await caches.keys();
  for (const name of names) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    await Promise.all(
      keys
        .filter((request) => {
          const pathname = toPathname(request.url);
          return pathname !== null && targets.has(pathname);
        })
        .map((request) => cache.delete(request)),
    );
  }
}

/** Current deployment id published by `scripts/generate-build-id.mjs`. */
export async function fetchCurrentBuildId(): Promise<string | null> {
  try {
    const response = await fetch('/build-id.json', { cache: 'no-store' });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (
      data !== null &&
      typeof data === 'object' &&
      'buildId' in data &&
      typeof (data as { buildId?: unknown }).buildId === 'string'
    ) {
      return (data as { buildId: string }).buildId;
    }
    return null;
  } catch {
    return null;
  }
}

/** Best-effort device storage numbers for the UI. */
export async function readStorageEstimate(): Promise<{
  usageBytes: number | null;
  quotaBytes: number | null;
}> {
  try {
    const estimate = await navigator.storage?.estimate?.();
    return {
      usageBytes: estimate?.usage ?? null,
      quotaBytes: estimate?.quota ?? null,
    };
  } catch {
    return { usageBytes: null, quotaBytes: null };
  }
}

export type GameSizesManifest = {
  games: Record<string, number>;
  totalBytes: number;
};

/**
 * Fetches the build-time game sizes manifest (`public/game-sizes.json`).
 * Returns null when offline or the file is missing (dev/E2E).
 */
export async function fetchGameSizes(): Promise<GameSizesManifest | null> {
  try {
    const response = await fetch('/game-sizes.json', { cache: 'no-store' });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (
      data !== null &&
      typeof data === 'object' &&
      'games' in data &&
      'totalBytes' in data &&
      typeof (data as { games?: unknown }).games === 'object' &&
      typeof (data as { totalBytes?: unknown }).totalBytes === 'number'
    ) {
      return data as GameSizesManifest;
    }
    return null;
  } catch {
    return null;
  }
}
