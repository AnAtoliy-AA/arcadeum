import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GameInviteModal } from '../GameInviteModal';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/analytics/funnel', () => ({
  trackInviteShared: vi.fn(),
}));

describe('GameInviteModal', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: 'https://arcadeum.games/en/games/chess' },
      writable: true,
    });
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders real QR code svg with accessible aria-label', () => {
    render(
      <GameInviteModal
        open={true}
        onClose={vi.fn()}
        gameId="chess"
        gameTitle="Chess"
      />,
    );

    const qrSvg = screen.getByLabelText('QR Code to join game');
    expect(qrSvg).toBeInTheDocument();
    expect(qrSvg.tagName.toLowerCase()).toBe('svg');
    expect(screen.getByTestId('game-invite-qr-svg')).toBeInTheDocument();
  });

  it('toggles share dropdown on clicking Share via Apps / Messages button', async () => {
    render(
      <GameInviteModal
        open={true}
        onClose={vi.fn()}
        gameId="chess"
        gameTitle="Chess"
      />,
    );

    expect(screen.queryByTestId('share-game-popover')).not.toBeInTheDocument();

    const appsButton = screen.getByTestId('share-via-apps-button');
    expect(appsButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(appsButton);
    });

    expect(screen.getByTestId('share-game-popover')).toBeInTheDocument();
    expect(screen.getByTestId('share-via-telegram')).toBeInTheDocument();
    expect(screen.getByTestId('share-via-whatsapp')).toBeInTheDocument();
    expect(screen.getByTestId('share-via-twitter')).toBeInTheDocument();
    expect(screen.getByTestId('share-via-facebook')).toBeInTheDocument();
    expect(screen.getByTestId('share-via-copy')).toBeInTheDocument();
    expect(screen.getByTestId('share-via-qr')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(appsButton);
    });

    expect(screen.queryByTestId('share-game-popover')).not.toBeInTheDocument();
  });

  it('opens channel link in new tab when clicked from dropdown', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <GameInviteModal
        open={true}
        onClose={vi.fn()}
        gameId="chess"
        gameTitle="Chess"
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('share-via-apps-button'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('share-via-telegram'));
    });

    expect(openSpy).toHaveBeenCalledWith(
      expect.stringContaining('t.me/share/url'),
      '_blank',
      'noopener,noreferrer',
    );
    expect(screen.queryByTestId('share-game-popover')).not.toBeInTheDocument();
  });

  it('scrolls QR into view and closes dropdown when QR option clicked', async () => {
    render(
      <GameInviteModal
        open={true}
        onClose={vi.fn()}
        gameId="chess"
        gameTitle="Chess"
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('share-via-apps-button'));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('share-via-qr'));
    });

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(screen.queryByTestId('share-game-popover')).not.toBeInTheDocument();
  });
});
