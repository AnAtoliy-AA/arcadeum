import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Client state for explicit offline game downloads.
 *
 * Persisted: which games are downloaded (with their URL manifests + sizes)
 * and the deployment build they were warmed against. Everything else is
 * transient UI state and excluded via `partialize`.
 *
 * Defaults to zero downloaded games — nothing is cached until the user opts
 * in from Settings or the offline hub.
 */
export interface DownloadedGameInfo {
  downloadedAt: number;
  sizeBytes: number;
  /** Same-origin pathnames backing this game (documents + hashed chunks). */
  urls: string[];
  /** Deployment build id the caches were warmed against. */
  buildId: string | null;
}

export type GameDownloadStatus = 'idle' | 'downloading' | 'removing' | 'error';

interface OfflineDownloadState {
  downloads: Record<string, DownloadedGameInfo>;
  /** Build id the current `downloads` were warmed against. */
  appBuildId: string | null;
  busySlugs: string[];
  errorSlugs: Record<string, true>;
  refreshInProgress: boolean;

  commitDownload: (slug: string, info: DownloadedGameInfo) => void;
  commitRemove: (slug: string) => void;
  setBusy: (slug: string, busy: boolean) => void;
  setError: (slug: string, hasError: boolean) => void;
  setRefreshInProgress: (inProgress: boolean) => void;
  setAppBuildId: (buildId: string | null) => void;
}

export const useOfflineDownloadsStore = create<OfflineDownloadState>()(
  persist(
    (set) => ({
      downloads: {},
      appBuildId: null,
      busySlugs: [],
      errorSlugs: {},
      refreshInProgress: false,

      commitDownload: (slug, info) =>
        set((state) => {
          const { [slug]: _removed, ...errors } = state.errorSlugs;
          return {
            downloads: { ...state.downloads, [slug]: info },
            errorSlugs: errors,
          };
        }),

      commitRemove: (slug) =>
        set((state) => {
          const { [slug]: _removed, ...downloads } = state.downloads;
          const { [slug]: _removedError, ...errors } = state.errorSlugs;
          return { downloads, errorSlugs: errors };
        }),

      setBusy: (slug, busy) =>
        set((state) => ({
          busySlugs: busy
            ? [...new Set([...state.busySlugs, slug])]
            : state.busySlugs.filter((s) => s !== slug),
        })),

      setError: (slug, hasError) =>
        set((state) => {
          const { [slug]: _removed, ...errors } = state.errorSlugs;
          return {
            errorSlugs: hasError ? { ...errors, [slug]: true } : errors,
          };
        }),

      setRefreshInProgress: (refreshInProgress) => set({ refreshInProgress }),

      setAppBuildId: (appBuildId) => set({ appBuildId }),
    }),
    {
      name: 'arcadeum-offline-downloads-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        downloads: state.downloads,
        appBuildId: state.appBuildId,
      }),
    },
  ),
);

/** URLs of `slug` that no other downloaded game still references. */
export function deletableUrlsFor(
  downloads: Record<string, DownloadedGameInfo>,
  slug: string,
): string[] {
  const target = downloads[slug];
  if (!target) return [];
  const stillUsed = new Set<string>();
  for (const [otherSlug, info] of Object.entries(downloads)) {
    if (otherSlug === slug) continue;
    for (const url of info.urls) stillUsed.add(url);
  }
  return target.urls.filter((url) => !stillUsed.has(url));
}
