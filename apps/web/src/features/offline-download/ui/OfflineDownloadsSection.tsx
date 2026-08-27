'use client';

import { Section } from '@arcadeum/ui/components/Section/Section';
import { Spinner } from '@arcadeum/ui/components/Spinner/Spinner';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { useLanguage } from '@/shared/i18n/context';
import { useOfflineDownloads } from '../hooks/useOfflineDownloads';
import type { GameDownloadStatus } from '../store/offline-download.store';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const idx = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, Math.min(idx, units.length - 1));
  return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[Math.min(idx, units.length - 1)]}`;
}

/**
 * Settings section + standalone view for managing offline game downloads.
 *
 * Renders a checkbox list with select-all, per-game status, sizes, download/
 * remove actions, an overall progress indicator for bulk operations, and a
 * storage-usage summary.  Mounted both in Settings and on the offline hub.
 */
export function OfflineDownloadsSection() {
  const { messages } = useLanguage();
  const {
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
  } = useOfflineDownloads();

  const dl = messages.pwa?.offlineDownloads;
  const allSelected = games.every((g) => g.info !== null);

  const handleSelectAll = () => {
    games.forEach((g) => {
      if (!g.info && !busySlugs.includes(g.game.slug)) {
        void toggle(g.game.slug);
      }
    });
  };
  const handleRemoveAll = () => {
    games.forEach((g) => {
      if (g.info && !busySlugs.includes(g.game.slug)) {
        void toggle(g.game.slug);
      }
    });
  };

  if (!supported) {
    return (
      <Section
        title={dl?.title ?? 'Offline Games'}
        description={dl?.description ?? ''}
        data-testid="offline-downloads-section"
      >
        <p className="text-[13px] text-[var(--textSecondary)]">
          {dl?.installRequired ??
            'Install Arcadeum as an app to download games for offline play.'}
        </p>
      </Section>
    );
  }

  return (
    <Section
      title={dl?.title ?? 'Offline Games'}
      description={dl?.description ?? ''}
      data-testid="offline-downloads-section"
    >
      <div className="flex flex-col gap-3">
        {!swReady && (
          <div className="flex items-center gap-2 rounded-lg border border-[var(--borderColor)] bg-[var(--glassBg)] px-4 py-2 text-[13px] text-[var(--textSecondary)]">
            <Spinner size="sm" />
            <span>
              {dl?.swLoading ??
                'Waiting for the app to fully load — downloads will be available shortly…'}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={allSelected ? handleRemoveAll : handleSelectAll}
            disabled={refreshInProgress || !swReady}
            data-testid="offline-downloads-select-all"
          >
            {allSelected
              ? (dl?.remove ?? 'Remove')
              : (dl?.selectAll ?? 'Select all')}
          </Button>

          <span className="text-[13px] text-[var(--textSecondary)]">
            {downloadedCount > 0
              ? `${dl?.storageUsed ?? 'Storage used'}: ${formatBytes(totalSizeBytes)}`
              : totalManifestBytes !== null
                ? `${formatBytes(totalManifestBytes)} total`
                : (dl?.sizesAvailableAfterDownload ??
                  'Sizes shown after download')}
          </span>
        </div>

        {refreshInProgress && (
          <div className="flex items-center gap-2 text-[13px] text-[var(--textSecondary)]">
            <Spinner size="sm" />
            <span>{dl?.updating ?? 'Updating…'}</span>
          </div>
        )}

        {games.map(({ game, name, status, info, manifestBytes }) => (
          <GameDownloadRow
            key={game.slug}
            slug={game.slug}
            name={name}
            status={status}
            sizeBytes={info?.sizeBytes ?? 0}
            manifestBytes={manifestBytes}
            onToggle={() => toggle(game.slug)}
            onRetry={() => retry(game.slug)}
            strings={dl}
            busy={busySlugs.includes(game.slug)}
            disabled={!swReady}
          />
        ))}
      </div>
    </Section>
  );
}

type RowStrings =
  | {
      downloading?: string;
      removing?: string;
      error?: string;
      retry?: string;
    }
  | undefined;

interface GameDownloadRowProps {
  slug: string;
  name: string;
  status: GameDownloadStatus;
  sizeBytes: number;
  manifestBytes: number | null;
  onToggle: () => void;
  onRetry: () => void;
  busy: boolean;
  disabled: boolean;
  strings: RowStrings;
}

function GameDownloadRow({
  slug,
  name,
  status,
  sizeBytes,
  manifestBytes,
  onToggle,
  onRetry,
  busy,
  disabled,
  strings: dl,
}: GameDownloadRowProps) {
  const isDownloaded = sizeBytes > 0;
  const checked = status !== 'error' && isDownloaded;
  // Show manifest size before download, measured size after.
  const displaySize = isDownloaded ? sizeBytes : manifestBytes;

  return (
    <div
      className={`flex flex-col gap-1 rounded-lg border px-4 py-3 transition-colors ${
        busy
          ? 'border-[var(--primary)]/30 bg-[var(--primary)]/5'
          : 'border-[var(--borderColor)] bg-[var(--glassBg)]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={`offline-cb-${slug}`}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 select-none"
        >
          <input
            id={`offline-cb-${slug}`}
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            onChange={onToggle}
            disabled={busy || disabled}
            aria-label={name}
            data-testid={`offline-cb-${slug}`}
          />
          <span
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border border-[var(--borderColor)] bg-[var(--glassBg)] transition-colors peer-checked:border-[var(--primary)] peer-checked:bg-[var(--primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary)]"
            aria-hidden="true"
          >
            {checked && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="text-white"
              >
                <path
                  d="M2.5 6L5 8.5L9.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          <span className="truncate text-[14px] font-medium text-[var(--foreground)]">
            {name}
          </span>
        </label>

        <div className="flex items-center gap-2">
          {status === 'error' && (
            <span className="text-[12px] text-[var(--danger)]">
              {dl?.error ?? 'Error'}
            </span>
          )}
          {busy && status === 'downloading' && (
            <span className="flex items-center gap-1 text-[12px] text-[var(--textSecondary)]">
              <Spinner size="tiny" />
              {dl?.downloading ?? 'Downloading…'}
            </span>
          )}
          {busy && status === 'removing' && (
            <span className="flex items-center gap-1 text-[12px] text-[var(--textSecondary)]">
              <Spinner size="tiny" />
              {dl?.removing ?? 'Removing…'}
            </span>
          )}
          {status === 'error' && !busy && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              data-testid={`offline-retry-${slug}`}
            >
              {dl?.retry ?? 'Retry'}
            </Button>
          )}
          {!busy && displaySize !== null && (
            <span className="text-[12px] text-[var(--textSecondary)]">
              {formatBytes(displaySize)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
