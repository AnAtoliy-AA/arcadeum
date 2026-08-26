import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { AnnouncementPublicItem } from '../api';
import type { DismissedEntry } from '../lib/dismissedStorage';

const renderBanner = (announcement: AnnouncementPublicItem | null) =>
  render(<AnnouncementBanner initialAnnouncement={announcement} />);

const addDismissedMock = vi.fn();
const writeDismissedCookieMock = vi.fn();
vi.mock('../lib/dismissedStorage', () => ({
  addDismissed: (entry: DismissedEntry) => addDismissedMock(entry),
  writeDismissedCookie: (entry: DismissedEntry) =>
    writeDismissedCookieMock(entry),
}));

vi.mock('@/shared/i18n/context', () => ({
  useLanguage: () => ({
    locale: 'en',
    messages: {
      widgets: {
        announcementBanner: {
          dismissAriaLabel: 'Close',
          expandAriaLabel: 'Expand',
          collapseAriaLabel: 'Collapse',
        },
      },
    },
    isReady: true,
  }),
}));

import { AnnouncementBanner } from './AnnouncementBanner';

beforeEach(() => {
  addDismissedMock.mockReset();
  writeDismissedCookieMock.mockReset();
});

const baseAnn: AnnouncementPublicItem = {
  id: 'a1',
  severity: 'info',
  updatedAt: '2026-05-09T00:00:00Z',
  title: 'Tournament Friday',
};

describe('AnnouncementBanner', () => {
  it('renders nothing when initialAnnouncement is null', () => {
    renderBanner(null);
    expect(screen.queryByTestId('announcement-banner')).not.toBeInTheDocument();
  });

  it('renders title with role=status for info', () => {
    renderBanner(baseAnn);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Tournament Friday')).toBeInTheDocument();
  });

  it('renders with role=alert for critical', () => {
    renderBanner({ ...baseAnn, severity: 'critical' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('hides close button for critical severity', () => {
    renderBanner({ ...baseAnn, severity: 'critical' });
    expect(
      screen.queryByTestId('announcement-dismiss'),
    ).not.toBeInTheDocument();
  });

  it('shows close button for non-critical', () => {
    renderBanner(baseAnn);
    expect(screen.getByTestId('announcement-dismiss')).toBeInTheDocument();
  });

  it('clicking close calls addDismissed, writes the cookie, and hides the banner', () => {
    renderBanner(baseAnn);

    fireEvent.click(screen.getByTestId('announcement-dismiss'));

    expect(addDismissedMock).toHaveBeenCalledWith({
      id: 'a1',
      updatedAt: '2026-05-09T00:00:00Z',
    });
    expect(writeDismissedCookieMock).toHaveBeenCalledWith({
      id: 'a1',
      updatedAt: '2026-05-09T00:00:00Z',
    });
    expect(screen.queryByTestId('announcement-banner')).not.toBeInTheDocument();
  });

  it('renders CTA when ctaHref is safe https', () => {
    renderBanner({
      ...baseAnn,
      ctaLabel: 'View',
      ctaHref: 'https://example.com',
    });
    const cta = screen.getByTestId('announcement-cta');
    expect(cta).toHaveAttribute('href', 'https://example.com');
    expect(cta).toHaveAttribute('target', '_blank');
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders CTA without target=_blank for relative path', () => {
    renderBanner({
      ...baseAnn,
      ctaLabel: 'View',
      ctaHref: '/games/123',
    });
    const cta = screen.getByTestId('announcement-cta');
    expect(cta).toHaveAttribute('href', '/games/123');
    expect(cta).not.toHaveAttribute('target');
  });

  it('hides CTA when ctaHref is unsafe (javascript:)', () => {
    renderBanner({
      ...baseAnn,
      ctaLabel: 'Click',
      ctaHref: 'javascript:alert(1)',
    });
    expect(screen.queryByTestId('announcement-cta')).not.toBeInTheDocument();
  });

  it('hides CTA when ctaLabel is missing', () => {
    renderBanner({ ...baseAnn, ctaHref: 'https://example.com' });
    expect(screen.queryByTestId('announcement-cta')).not.toBeInTheDocument();
  });

  it('expands body on title click when body present', () => {
    renderBanner({ ...baseAnn, body: 'More details here' });

    expect(screen.queryByTestId('announcement-body')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Tournament Friday'));

    expect(screen.getByTestId('announcement-body')).toHaveTextContent(
      'More details here',
    );
  });

  it('does not expand if there is no body', () => {
    renderBanner(baseAnn);
    fireEvent.click(screen.getByText('Tournament Friday'));
    expect(screen.queryByTestId('announcement-body')).not.toBeInTheDocument();
  });
});
