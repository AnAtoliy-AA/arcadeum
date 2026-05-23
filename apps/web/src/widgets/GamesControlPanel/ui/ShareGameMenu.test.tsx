import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '@/shared/config/tamagui.config';
import { ShareGameMenu } from './ShareGameMenu';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const ORIGIN = 'https://test.local';
const ROOM_ID = 'abc123';
const INVITE_CODE = 'INV-9';
const EXPECTED_URL = `${ORIGIN}/games/rooms/${ROOM_ID}?inviteCode=${INVITE_CODE}`;
const EXPECTED_TEXT = 'games.common.shareMessage';

function renderMenu(
  props: { roomId?: string; inviteCode?: string | null } = {},
) {
  const inviteCode =
    'inviteCode' in props ? (props.inviteCode ?? undefined) : INVITE_CODE;
  return render(
    <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
      <ShareGameMenu roomId={props.roomId ?? ROOM_ID} inviteCode={inviteCode} />
    </TamaguiProvider>,
  );
}

describe('ShareGameMenu', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, origin: ORIGIN },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (navigator as unknown as { share?: unknown }).share;
  });

  it('renders the trigger button with the share label', () => {
    renderMenu();
    const trigger = screen.getByTestId('share-game-button');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-label', 'games.common.shareTooltip');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('does not render the popover by default', () => {
    renderMenu();
    expect(screen.queryByTestId('share-game-popover')).not.toBeInTheDocument();
  });

  it('opens the popover with all 5 channel options when navigator.share is unavailable', async () => {
    renderMenu();
    await act(async () => {
      fireEvent.click(screen.getByTestId('share-game-button'));
    });
    expect(screen.getByTestId('share-game-popover')).toBeInTheDocument();
    expect(screen.getByTestId('share-via-telegram')).toBeInTheDocument();
    expect(screen.getByTestId('share-via-whatsapp')).toBeInTheDocument();
    expect(screen.getByTestId('share-via-twitter')).toBeInTheDocument();
    expect(screen.getByTestId('share-via-facebook')).toBeInTheDocument();
    expect(screen.getByTestId('share-via-copy')).toBeInTheDocument();
  });

  it('opens each channel link in a new tab with the encoded invite URL', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderMenu();
    await act(async () => {
      fireEvent.click(screen.getByTestId('share-game-button'));
    });

    fireEvent.click(screen.getByTestId('share-via-telegram'));
    expect(openSpy).toHaveBeenLastCalledWith(
      `https://t.me/share/url?url=${encodeURIComponent(EXPECTED_URL)}&text=${encodeURIComponent(EXPECTED_TEXT)}`,
      '_blank',
      'noopener,noreferrer',
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('share-game-button'));
    });
    fireEvent.click(screen.getByTestId('share-via-whatsapp'));
    expect(openSpy).toHaveBeenLastCalledWith(
      `https://wa.me/?text=${encodeURIComponent(`${EXPECTED_TEXT} ${EXPECTED_URL}`)}`,
      '_blank',
      'noopener,noreferrer',
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('share-game-button'));
    });
    fireEvent.click(screen.getByTestId('share-via-twitter'));
    expect(openSpy).toHaveBeenLastCalledWith(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(EXPECTED_URL)}&text=${encodeURIComponent(EXPECTED_TEXT)}`,
      '_blank',
      'noopener,noreferrer',
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('share-game-button'));
    });
    fireEvent.click(screen.getByTestId('share-via-facebook'));
    expect(openSpy).toHaveBeenLastCalledWith(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(EXPECTED_URL)}`,
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('copies the invite URL to the clipboard when "Copy link" is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    renderMenu();
    await act(async () => {
      fireEvent.click(screen.getByTestId('share-game-button'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('share-via-copy'));
    });

    expect(writeText).toHaveBeenCalledWith(EXPECTED_URL);
  });

  it('builds the URL without inviteCode when not provided', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderMenu({ inviteCode: null });
    await act(async () => {
      fireEvent.click(screen.getByTestId('share-game-button'));
    });
    fireEvent.click(screen.getByTestId('share-via-telegram'));
    const expectedUrl = `${ORIGIN}/games/rooms/${ROOM_ID}`;
    expect(openSpy).toHaveBeenLastCalledWith(
      `https://t.me/share/url?url=${encodeURIComponent(expectedUrl)}&text=${encodeURIComponent(EXPECTED_TEXT)}`,
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('calls navigator.share when available and does NOT open the popover', async () => {
    const shareFn = vi.fn().mockResolvedValue(undefined);
    (navigator as unknown as { share: typeof shareFn }).share = shareFn;

    renderMenu();
    await act(async () => {
      fireEvent.click(screen.getByTestId('share-game-button'));
    });

    expect(shareFn).toHaveBeenCalledWith({
      title: 'games.common.shareTitle',
      text: 'games.common.shareMessage',
      url: EXPECTED_URL,
    });
    expect(screen.queryByTestId('share-game-popover')).not.toBeInTheDocument();
  });

  it('closes the popover on Escape', async () => {
    renderMenu();
    await act(async () => {
      fireEvent.click(screen.getByTestId('share-game-button'));
    });
    expect(screen.getByTestId('share-game-popover')).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(screen.queryByTestId('share-game-popover')).not.toBeInTheDocument();
  });
});
