import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '@/shared/config/tamagui.config';
import type { AnnouncementPublicItem } from '../api';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config} defaultTheme="dark">
    {children}
  </TamaguiProvider>
);

const renderBanner = () =>
  render(
    <Wrapper>
      <AnnouncementBanner />
    </Wrapper>,
  );

const useActiveAnnouncementMock = vi.fn();
vi.mock('../hooks/useActiveAnnouncement', () => ({
  useActiveAnnouncement: () => useActiveAnnouncementMock(),
}));

const addDismissedMock = vi.fn();
vi.mock('../lib/dismissedStorage', () => ({
  addDismissed: (...args: unknown[]) => addDismissedMock(...args),
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

const refetchMock = vi.fn();

const setHook = (data: AnnouncementPublicItem | null) => {
  useActiveAnnouncementMock.mockReturnValue({ data, refetch: refetchMock });
};

beforeEach(() => {
  useActiveAnnouncementMock.mockReset();
  addDismissedMock.mockReset();
  refetchMock.mockReset();
});

const baseAnn: AnnouncementPublicItem = {
  id: 'a1',
  severity: 'info',
  updatedAt: '2026-05-09T00:00:00Z',
  title: 'Tournament Friday',
};

describe('AnnouncementBanner', () => {
  it('renders nothing when hook returns null', () => {
    setHook(null);
    renderBanner();
    expect(screen.queryByTestId('announcement-banner')).not.toBeInTheDocument();
  });

  it('renders title with role=status for info', () => {
    setHook(baseAnn);
    renderBanner();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Tournament Friday')).toBeInTheDocument();
  });

  it('renders with role=alert for critical', () => {
    setHook({ ...baseAnn, severity: 'critical' });
    renderBanner();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('hides close button for critical severity', () => {
    setHook({ ...baseAnn, severity: 'critical' });
    renderBanner();
    expect(
      screen.queryByTestId('announcement-dismiss'),
    ).not.toBeInTheDocument();
  });

  it('shows close button for non-critical', () => {
    setHook(baseAnn);
    renderBanner();
    expect(screen.getByTestId('announcement-dismiss')).toBeInTheDocument();
  });

  it('clicking close calls addDismissed and refetch', () => {
    setHook(baseAnn);
    renderBanner();

    fireEvent.click(screen.getByTestId('announcement-dismiss'));

    expect(addDismissedMock).toHaveBeenCalledWith({
      id: 'a1',
      updatedAt: '2026-05-09T00:00:00Z',
    });
    expect(refetchMock).toHaveBeenCalled();
  });

  it('renders CTA when ctaHref is safe https', () => {
    setHook({
      ...baseAnn,
      ctaLabel: 'View',
      ctaHref: 'https://example.com',
    });
    renderBanner();
    const cta = screen.getByTestId('announcement-cta');
    expect(cta).toHaveAttribute('href', 'https://example.com');
    expect(cta).toHaveAttribute('target', '_blank');
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders CTA without target=_blank for relative path', () => {
    setHook({
      ...baseAnn,
      ctaLabel: 'View',
      ctaHref: '/games/123',
    });
    renderBanner();
    const cta = screen.getByTestId('announcement-cta');
    expect(cta).toHaveAttribute('href', '/games/123');
    expect(cta).not.toHaveAttribute('target');
  });

  it('hides CTA when ctaHref is unsafe (javascript:)', () => {
    setHook({
      ...baseAnn,
      ctaLabel: 'Click',
      ctaHref: 'javascript:alert(1)',
    });
    renderBanner();
    expect(screen.queryByTestId('announcement-cta')).not.toBeInTheDocument();
  });

  it('hides CTA when ctaLabel is missing', () => {
    setHook({ ...baseAnn, ctaHref: 'https://example.com' });
    renderBanner();
    expect(screen.queryByTestId('announcement-cta')).not.toBeInTheDocument();
  });

  it('expands body on title click when body present', () => {
    setHook({ ...baseAnn, body: 'More details here' });
    renderBanner();

    expect(screen.queryByTestId('announcement-body')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Tournament Friday'));

    expect(screen.getByTestId('announcement-body')).toHaveTextContent(
      'More details here',
    );
  });

  it('does not expand if there is no body', () => {
    setHook(baseAnn);
    renderBanner();
    fireEvent.click(screen.getByText('Tournament Friday'));
    expect(screen.queryByTestId('announcement-body')).not.toBeInTheDocument();
  });
});
