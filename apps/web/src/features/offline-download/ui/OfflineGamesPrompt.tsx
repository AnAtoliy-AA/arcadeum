'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@arcadeum/ui/components/Modal/Modal';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { useLanguage } from '@/shared/i18n/context';
import { useOfflineDownloads } from '../hooks/useOfflineDownloads';

const DISMISS_KEY = 'arcadeum-offline-prompt-dismissed';

function isDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return true;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    /* storage unavailable */
  }
}

/**
 * One-time interstitial shown right after the PWA is installed.
 * Asks whether the user wants to download games for offline play.
 *
 * Mounted in PWAProvider — listens for the `appinstalled` event directly
 * (not via PWA context) so it only triggers on a fresh install, not on
 * page load in standalone mode.
 */
export function OfflineGamesPrompt() {
  const { messages } = useLanguage();
  const router = useRouter();
  const { supported, games, toggle, downloadedCount } = useOfflineDownloads();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!supported || isDismissed()) return;

    const handleInstalled = () => {
      // Small delay so the browser's own install confirmation settles.
      setTimeout(() => setOpen(true), 800);
    };

    window.addEventListener('appinstalled', handleInstalled);
    return () => window.removeEventListener('appinstalled', handleInstalled);
  }, [supported]);

  const dl = messages.pwa?.offlineDownloads;

  const handleDownloadAll = () => {
    markDismissed();
    setOpen(false);
    router.push('/settings#offline-downloads');
    // Fire sequentially so each download sets its busy flag before the next starts.
    setTimeout(async () => {
      for (const g of games) {
        if (!g.info) await toggle(g.game.slug);
      }
    }, 500);
  };

  const handleChooseLater = () => {
    markDismissed();
    setOpen(false);
    router.push('/settings#offline-downloads');
  };

  const handleDismiss = () => {
    markDismissed();
    setOpen(false);
  };

  // Don't render if already downloaded everything or dismissed.
  if (!supported || downloadedCount === games.length) return null;

  return (
    <Modal open={open} onClose={handleDismiss}>
      <ModalContent>
        <ModalHeader onClose={handleDismiss}>
          <ModalTitle>{dl?.title ?? 'Offline Games'}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p className="text-[15px] text-[var(--foreground)] opacity-80">
            {dl?.description ??
              'Select games to download so you can play them without an internet connection.'}
          </p>
          <p className="mt-2 text-[13px] text-[var(--textSecondary)]">
            {games.length} games — ~{formatTotalBytes(games)}
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" size="sm" onClick={handleDownloadAll}>
            {dl?.selectAll ?? 'Download all'}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleChooseLater}>
            {dl?.chooseIndividually ?? 'Choose individually'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            {dl?.notNow ?? 'Not now'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function formatTotalBytes(
  games: Array<{ manifestBytes: number | null }>,
): string {
  const total = games.reduce((sum, g) => sum + (g.manifestBytes ?? 0), 0);
  if (total === 0) return '';
  const mb = total / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}
