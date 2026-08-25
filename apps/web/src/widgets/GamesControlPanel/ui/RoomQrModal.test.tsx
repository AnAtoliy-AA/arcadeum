import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RoomQrModal } from './RoomQrModal';

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const ORIGIN = 'https://test.local';
const ROOM_ID = 'room-42';
const INVITE_CODE = 'INV-7';
const UTM_PARAMS = `utm_source=arcadeum&utm_medium=invite&utm_campaign=room_share&utm_content=${ROOM_ID}`;
const EXPECTED_URL = `${ORIGIN}/en/rooms/${ROOM_ID}?${UTM_PARAMS}&inviteCode=${INVITE_CODE}`;

function renderModal(
  props: {
    open?: boolean;
    roomId?: string;
    inviteCode?: string | null;
    onClose?: () => void;
  } = {},
) {
  const inviteCode =
    'inviteCode' in props ? (props.inviteCode ?? undefined) : INVITE_CODE;
  return render(
    <RoomQrModal
      open={props.open ?? true}
      onClose={props.onClose ?? (() => {})}
      roomId={props.roomId ?? ROOM_ID}
      inviteCode={inviteCode}
    />,
  );
}

describe('RoomQrModal', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, origin: ORIGIN },
      writable: true,
    });
  });

  it('renders nothing when closed', () => {
    renderModal({ open: false });
    expect(screen.queryByTestId('room-qr-modal')).not.toBeInTheDocument();
  });

  it('renders the QR svg and the invite URL with the invite code', () => {
    renderModal();
    expect(screen.getByTestId('room-qr-modal')).toBeInTheDocument();

    const qrSvg = screen.getByTestId('room-qr-svg');
    expect(qrSvg.tagName.toLowerCase()).toBe('svg');

    expect(screen.getByTestId('room-qr-url')).toHaveTextContent(EXPECTED_URL);
  });

  it('builds the URL without inviteCode when not provided', () => {
    renderModal({ inviteCode: null });
    const expectedUrl = `${ORIGIN}/en/rooms/${ROOM_ID}?${UTM_PARAMS}`;
    expect(screen.getByTestId('room-qr-url')).toHaveTextContent(expectedUrl);
  });

  it('copies the invite URL to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    renderModal();
    await act(async () => {
      fireEvent.click(screen.getByTestId('room-qr-copy'));
    });

    expect(writeText).toHaveBeenCalledWith(EXPECTED_URL);
  });

  it('calls onClose via the header close button and Escape', () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.click(screen.getByTestId('modal-close-button'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
