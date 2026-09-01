'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

import { useLanguage } from '@/shared/i18n/context';
import {
  deletableUrlsFor,
  useOfflineDownloadsStore,
} from '../store/offline-download.store';
import type { GameDownloadStatus } from '../store/offline-download.store';
import {
  DOWNLOADABLE_GAMES,
  downloadableGameName,
  findDownloadableGame,
  offlineRouteUrl,
} from '../lib/downloadable-games';
import type { DownloadableGame } from '../lib/downloadable-games';
import {
  downloadGameOffline,
  fetchCurrentBuildId,
  fetchGameSizes,
  isOfflineDownloadSupported,
  isSWActive,
  purgeCachedUrls,
} from '../lib/cache-warmer';
import type { GameSizesManifest } from '../lib/cache-warmer';

let autoRefreshStarted = false;

function subscribeToServiceWorker(callback: () => void) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }
  navigator.serviceWorker.addEventListener('controllerchange', callback);
  return () => {
    navigator.serviceWorker.removeEventListener('controllerchange', callback);
  };
}

export function useOfflineDownloads() {
  const { locale } = useLanguage();

  const downloads = useOfflineDownloadsStore((s) => s.downloads);
  const busySlugs = useOfflineDownloadsStore((s) => s.busySlugs);
  const errorSlugs = useOfflineDownloadsStore((s) => s.errorSlugs);
  const refreshInProgress = useOfflineDownloadsStore(
    (s) => s.refreshInProgress,
  );
  const commitDownload = useOfflineDownloadsStore((s) => s.commitDownload);
  const commitRemove = useOfflineDownloadsStore((s) => s.commitRemove);
  const setBusy = useOfflineDownloadsStore((s) => s.setBusy);
  const setError = useOfflineDownloadsStore((s) => s.setError);
  const setRefreshInProgress = useOfflineDownloadsStore(
    (s) => s.setRefreshInProgress,
  );

  const supported = useSyncExternalStore(
    subscribeToServiceWorker,
    () => isOfflineDownloadSupported(),
    () => false,
  );
  const swReady = useSyncExternalStore(
    subscribeToServiceWorker,
    () => isSWActive(),
    () => false,
  );

  // Build-time manifest sizes (fetched once on mount).
  const [manifestSizes, setManifestSizes] = useState<GameSizesManifest | null>(
    null,
  );
  useEffect(() => {
    if (!supported) return;
    void fetchGameSizes().then(setManifestSizes);
  }, [supported]);

  const downloadOne = useCallback(
    async (game: DownloadableGame): Promise<boolean> => {
      setBusy(game.slug, true);
      setError(game.slug, false);
      try {
        const [result, buildId] = await Promise.all([
          downloadGameOffline(game, locale),
          fetchCurrentBuildId(),
        ]);
        commitDownload(game.slug, {
          downloadedAt: Date.now(),
          sizeBytes: result.sizeBytes,
          urls: result.urls,
          buildId,
        });
        return true;
      } catch {
        setError(game.slug, true);
        return false;
      } finally {
        setBusy(game.slug, false);
      }
    },
    [commitDownload, locale, setBusy, setError],
  );

  /** Downloads `slug`, or removes it when already downloaded. */
  const toggle = useCallback(
    async (slug: string) => {
      const game = findDownloadableGame(slug);
      const state = useOfflineDownloadsStore.getState();
      if (!game || state.busySlugs.includes(slug)) return;
      if (!state.downloads[slug]) {
        await downloadOne(game);
        return;
      }
      setBusy(slug, true);
      try {
        await purgeCachedUrls(deletableUrlsFor(state.downloads, slug));
        commitRemove(slug);
      } catch {
        setError(slug, true);
      } finally {
        setBusy(slug, false);
      }
    },
    [commitRemove, downloadOne, setBusy, setError],
  );

  const retry = useCallback(
    async (slug: string) => {
      const game = findDownloadableGame(slug);
      if (game) await downloadOne(game);
    },
    [downloadOne],
  );

  /**
   * Deploy auto-refresh. Runs at most once per page load; re-warms each
   * downloaded game whose recorded build id differs from the live build.
   */
  const refreshStaleGames = useCallback(async () => {
    if (!supported || autoRefreshStarted || refreshInProgress) return;
    autoRefreshStarted = true;
    if (!navigator.onLine) return;

    const currentBuildId = await fetchCurrentBuildId();
    if (!currentBuildId) return;

    const stale = Object.entries(useOfflineDownloadsStore.getState().downloads)
      .filter(
        ([slug, info]) =>
          slug && findDownloadableGame(slug) && info.buildId !== currentBuildId,
      )
      .map(([slug]) => findDownloadableGame(slug))
      .filter((game): game is DownloadableGame => game !== null);

    if (stale.length === 0) return;

    setRefreshInProgress(true);
    try {
      for (const game of stale) {
        if (useOfflineDownloadsStore.getState().downloads[game.slug]) {
          await downloadOne(game);
        }
      }
    } finally {
      setRefreshInProgress(false);
    }
  }, [downloadOne, refreshInProgress, setRefreshInProgress, supported]);

  useEffect(() => {
    void refreshStaleGames();
  }, [refreshStaleGames]);

  const games = useMemo(
    () =>
      DOWNLOADABLE_GAMES.map((game) => ({
        game,
        name: downloadableGameName(game),
        routeUrl: offlineRouteUrl(game, locale),
        status: statusOf(game.slug, downloads, busySlugs, errorSlugs),
        info: downloads[game.slug] ?? null,
        manifestBytes: manifestSizes?.games[game.slug] ?? null,
      })),
    [busySlugs, downloads, errorSlugs, locale, manifestSizes],
  );

  const downloadedCount = Object.keys(downloads).length;
  const totalSizeBytes = Object.values(downloads).reduce(
    (sum, info) => sum + (info.sizeBytes || 0),
    0,
  );
  const totalManifestBytes = manifestSizes?.totalBytes ?? null;

  return {
    supported,
    swReady,
    games,
    busySlugs,
    refreshInProgress,
    downloadedCount,
    totalSizeBytes,
    totalManifestBytes,
    toggle,
    retry,
  };
}

function statusOf(
  slug: string,
  downloads: Record<string, unknown>,
  busySlugs: string[],
  errorSlugs: Record<string, true>,
): GameDownloadStatus {
  if (errorSlugs[slug]) return 'error';
  if (!busySlugs.includes(slug)) return 'idle';
  return downloads[slug] ? 'removing' : 'downloading';
}
