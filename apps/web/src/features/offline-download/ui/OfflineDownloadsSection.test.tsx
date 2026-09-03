import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OfflineDownloadsSection } from './OfflineDownloadsSection';
import * as hooks from '../hooks/useOfflineDownloads';

vi.mock('@/shared/i18n/context', () => ({
  useLanguage: () => ({
    locale: 'en',
    messages: {
      pwa: {
        offlineDownloads: {
          title: 'Offline Games',
          description: 'Download games for offline play.',
          installRequired:
            'Install {{appName}} as an app to download games for offline play.',
          selectAll: 'Select all',
          remove: 'Remove',
        },
      },
    },
  }),
}));

describe('OfflineDownloadsSection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders install notice when not supported', () => {
    vi.spyOn(hooks, 'useOfflineDownloads').mockReturnValue({
      supported: false,
      swReady: false,
      games: [],
      busySlugs: [],
      refreshInProgress: false,
      downloadedCount: 0,
      totalSizeBytes: 0,
      totalManifestBytes: null,
      toggle: vi.fn(),
      retry: vi.fn(),
    });

    render(<OfflineDownloadsSection />);
    expect(
      screen.getByText(
        'Install Arcadeum Games as an app to download games for offline play.',
      ),
    ).toBeDefined();
  });

  it('renders games download list when supported', () => {
    vi.spyOn(hooks, 'useOfflineDownloads').mockReturnValue({
      supported: true,
      swReady: true,
      games: [
        {
          game: {
            slug: 'chess',
            route: 'games/chess/play',
            kind: 'bot',
            metadataKey: 'chess_v1',
          },
          name: 'Chess',
          routeUrl: '/en/offline/chess',
          status: 'idle',
          info: null,
          manifestBytes: 500000,
        },
      ],
      busySlugs: [],
      refreshInProgress: false,
      downloadedCount: 0,
      totalSizeBytes: 0,
      totalManifestBytes: 500000,
      toggle: vi.fn(),
      retry: vi.fn(),
    });

    render(<OfflineDownloadsSection />);
    expect(screen.getByText('Select all')).toBeDefined();
    expect(screen.getByText('Chess')).toBeDefined();
  });
});
