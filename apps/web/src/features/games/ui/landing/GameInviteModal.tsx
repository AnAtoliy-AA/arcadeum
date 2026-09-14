'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Button,
} from '@arcadeum/ui';
import { useTimedTrue } from '@/shared/hooks/useTimedTrue';
import { trackInviteShared } from '@/shared/analytics/funnel';
import { ShareChannelsPopover } from '@/features/games/ui/share/ShareChannelsMenu';

interface GameInviteModalProps {
  open: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle: string;
}

export function GameInviteModal({
  open,
  onClose,
  gameId,
  gameTitle,
}: GameInviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDropdownCopied, setIsDropdownCopied] = useTimedTrue(2000);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);
  const qrContainerRef = useRef<HTMLDivElement | null>(null);

  const handleClose = useCallback(() => {
    setIsDropdownOpen(false);
    setCopied(false);
    onClose();
  }, [onClose]);

  const shareUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return `https://arcadeum.games/en/games/${gameId}`;
  }, [gameId]);

  const shareTitle = `Play ${gameTitle} on Arcadeum`;
  const shareText = `Join me for an instant game of ${gameTitle} on Arcadeum! Zero signup or download needed.`;

  const handleCopy = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackInviteShared('copy', gameId);
    }
  }, [shareUrl, gameId]);

  const handleDropdownCopy = useCallback(async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setIsDropdownCopied();
      setCopied(true);
      trackInviteShared('copy', gameId);
    }
  }, [shareUrl, gameId, setIsDropdownCopied]);

  const handleShowQr = useCallback(() => {
    setIsDropdownOpen(false);
    qrContainerRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, []);

  const handleChannelClick = useCallback(
    (channel: string, href: string) => {
      if (typeof window !== 'undefined') {
        window.open(href, '_blank', 'noopener,noreferrer');
        trackInviteShared(channel, gameId);
        setIsDropdownOpen(false);
      }
    },
    [gameId],
  );

  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleNativeShare = useCallback(async () => {
    if (canNativeShare) {
      try {
        setIsDropdownOpen(false);
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        trackInviteShared('native', gameId);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
  }, [canNativeShare, shareTitle, shareText, shareUrl, gameId]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick, { capture: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick, { capture: true });
      document.removeEventListener('keydown', onKey);
    };
  }, [isDropdownOpen]);

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalContent maxWidth={480} data-testid="game-invite-modal-content">
        <ModalHeader onClose={handleClose}>
          <ModalTitle>Invite a Friend to {gameTitle}</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <div className="flex flex-col items-center gap-6 py-2 text-center">
            <div
              ref={qrContainerRef}
              className="rounded-xl bg-white p-3 shadow-lg flex items-center justify-center transition-all"
              data-testid="game-invite-qr-container"
            >
              <QRCodeSVG
                value={shareUrl}
                size={160}
                marginSize={0}
                level="M"
                aria-label="QR Code to join game"
                data-testid="game-invite-qr-svg"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color)]">
                Instant Guest Access
              </span>
              <p className="m-0 text-sm text-[var(--foreground)] opacity-90 max-w-sm">
                Scan this QR code from mobile, or copy the link below to play
                directly in browser with no registration.
              </p>
            </div>

            <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--borderColor)] bg-[var(--surfaceBackground)]/50 p-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent px-2 text-xs font-mono text-[var(--foreground)] outline-none"
                aria-label="Share URL"
              />
              <Button
                variant={copied ? 'victory' : 'primary'}
                size="sm"
                onClick={handleCopy}
              >
                {copied ? 'Copied! ✓' : 'Copy Link'}
              </Button>
            </div>

            <div ref={shareMenuRef} className="relative w-full">
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => setIsDropdownOpen((v) => !v)}
                aria-label="Share via Apps / Messages"
                aria-haspopup="menu"
                aria-expanded={isDropdownOpen}
                aria-controls="share-game-menu-popover"
                data-testid="share-via-apps-button"
              >
                Share via Apps / Messages 📱
              </Button>

              {isDropdownOpen && (
                <ShareChannelsPopover
                  url={shareUrl}
                  text={shareText}
                  title={shareTitle}
                  isCopied={isDropdownCopied}
                  onCopy={handleDropdownCopy}
                  onShowQr={handleShowQr}
                  onChannelClick={handleChannelClick}
                  onNativeShare={handleNativeShare}
                  hasNativeShare={canNativeShare}
                  className="mt-2 w-full"
                />
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" size="md" onClick={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
