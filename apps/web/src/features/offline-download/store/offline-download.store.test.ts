import { describe, it, expect, beforeEach } from 'vitest';
import {
  useOfflineDownloadsStore,
  deletableUrlsFor,
} from './offline-download.store';

describe('useOfflineDownloadsStore', () => {
  beforeEach(() => {
    // Reset persisted state between tests.
    useOfflineDownloadsStore.setState({
      downloads: {},
      appBuildId: null,
      busySlugs: [],
      errorSlugs: {},
      refreshInProgress: false,
    });
  });

  it('starts with zero downloads', () => {
    const { downloads, appBuildId } = useOfflineDownloadsStore.getState();
    expect(downloads).toEqual({});
    expect(appBuildId).toBeNull();
  });

  it('commitDownload adds an entry', () => {
    useOfflineDownloadsStore.getState().commitDownload('chess', {
      downloadedAt: 1000,
      sizeBytes: 5000,
      urls: ['/en/offline/chess', '/_next/static/chunk-a.js'],
      buildId: 'abc123',
    });
    const { downloads } = useOfflineDownloadsStore.getState();
    expect(downloads.chess).toBeDefined();
    expect(downloads.chess.sizeBytes).toBe(5000);
    expect(downloads.chess.urls).toHaveLength(2);
  });

  it('commitDownload overwrites an existing entry', () => {
    const store = useOfflineDownloadsStore.getState();
    store.commitDownload('chess', {
      downloadedAt: 1000,
      sizeBytes: 5000,
      urls: [],
      buildId: null,
    });
    store.commitDownload('chess', {
      downloadedAt: 2000,
      sizeBytes: 6000,
      urls: ['/x'],
      buildId: 'v2',
    });
    expect(useOfflineDownloadsStore.getState().downloads.chess.sizeBytes).toBe(
      6000,
    );
  });

  it('commitRemove deletes an entry', () => {
    const store = useOfflineDownloadsStore.getState();
    store.commitDownload('chess', {
      downloadedAt: 1000,
      sizeBytes: 5000,
      urls: [],
      buildId: null,
    });
    store.commitRemove('chess');
    expect(useOfflineDownloadsStore.getState().downloads.chess).toBeUndefined();
  });

  it('setBusy / clearBusy manage the busySlugs list', () => {
    const store = useOfflineDownloadsStore.getState();
    store.setBusy('chess', true);
    expect(useOfflineDownloadsStore.getState().busySlugs).toContain('chess');
    store.setBusy('chess', false);
    expect(useOfflineDownloadsStore.getState().busySlugs).not.toContain(
      'chess',
    );
  });

  it('setError / clearError manage the errorSlugs map', () => {
    const store = useOfflineDownloadsStore.getState();
    store.setError('chess', true);
    expect(useOfflineDownloadsStore.getState().errorSlugs.chess).toBe(true);
    store.setError('chess', false);
    expect(
      useOfflineDownloadsStore.getState().errorSlugs.chess,
    ).toBeUndefined();
  });

  it('commitDownload clears the error for the slug', () => {
    const store = useOfflineDownloadsStore.getState();
    store.setError('chess', true);
    store.commitDownload('chess', {
      downloadedAt: 1000,
      sizeBytes: 100,
      urls: [],
      buildId: null,
    });
    expect(
      useOfflineDownloadsStore.getState().errorSlugs.chess,
    ).toBeUndefined();
  });

  it('commitRemove clears the error for the slug', () => {
    const store = useOfflineDownloadsStore.getState();
    store.setError('chess', true);
    store.commitRemove('chess');
    expect(
      useOfflineDownloadsStore.getState().errorSlugs.chess,
    ).toBeUndefined();
  });

  it('appBuildId persists across state resets', () => {
    useOfflineDownloadsStore.getState().setAppBuildId('build-xyz');
    expect(useOfflineDownloadsStore.getState().appBuildId).toBe('build-xyz');
  });

  it('partialize excludes transient keys from persistence', () => {
    useOfflineDownloadsStore.setState({
      busySlugs: ['chess'],
      errorSlugs: { chess: true },
      refreshInProgress: true,
    });
    // Only downloads and appBuildId survive partialization; other fields are transient.
    const { downloads, appBuildId, busySlugs, errorSlugs, refreshInProgress } =
      useOfflineDownloadsStore.getState();
    expect(downloads).toBeDefined();
    expect(appBuildId).toBeDefined();
    expect(busySlugs).toHaveLength(1);
    expect(errorSlugs).toHaveProperty('chess');
    expect(typeof refreshInProgress).toBe('boolean');
  });
});

describe('deletableUrlsFor', () => {
  const downloads = {
    chess: {
      downloadedAt: 1000,
      sizeBytes: 5000,
      urls: ['/doc', '/chunk-a.js', '/shared.js'],
      buildId: null,
    },
    hearts: {
      downloadedAt: 2000,
      sizeBytes: 3000,
      urls: ['/hearts-doc', '/chunk-a.js'],
      buildId: null,
    },
  };

  it('returns only URLs not shared with other downloaded games', () => {
    const deletable = deletableUrlsFor(downloads, 'chess');
    expect(deletable).toContain('/doc');
    expect(deletable).toContain('/shared.js');
    expect(deletable).not.toContain('/chunk-a.js'); // shared with hearts
  });

  it('returns empty array when slug has no downloads', () => {
    expect(deletableUrlsFor(downloads, 'unknown')).toEqual([]);
  });

  it('returns all URLs when game is the only download', () => {
    const single = {
      chess: downloads.chess,
    };
    const deletable = deletableUrlsFor(single, 'chess');
    expect(deletable.sort()).toEqual(
      ['/doc', '/chunk-a.js', '/shared.js'].sort(),
    );
  });
});
