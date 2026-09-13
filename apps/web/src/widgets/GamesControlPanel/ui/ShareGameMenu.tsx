'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useTimedTrue } from '@/shared/hooks/useTimedTrue';
import dynamic from 'next/dynamic';
import { routes } from '@/shared/config/routes';
import { trackInviteShared } from '@/shared/analytics/funnel';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  ShareChannelsPopover,
  TelegramIcon,
  WhatsAppIcon,
  TwitterIcon,
  FacebookIcon,
  CopyLinkIcon,
  QrCodeIcon,
  NativeShareIcon,
  buildChannels,
  type ShareChannel,
} from '@/features/games/ui/share/ShareChannelsMenu';

export {
  ShareChannelsPopover,
  TelegramIcon,
  WhatsAppIcon,
  TwitterIcon,
  FacebookIcon,
  CopyLinkIcon,
  QrCodeIcon,
  NativeShareIcon,
  buildChannels,
};
export type { ShareChannel };

const RoomQrModal = dynamic(
  () => import('./RoomQrModal').then((m) => m.RoomQrModal),
  { ssr: false },
);

interface ShareGameMenuProps {
  roomId: string;
  inviteCode?: string;
}

export function buildInviteUrl(roomId: string, inviteCode?: string): string {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams({
    utm_source: 'arcadeum',
    utm_medium: 'invite',
    utm_campaign: 'room_share',
    ...(roomId ? { utm_content: roomId } : {}),
    ...(inviteCode ? { inviteCode } : {}),
  });
  return `${window.location.origin}${routes.gameRoom(roomId)}?${params.toString()}`;
}

export function ShareGameMenu({ roomId, inviteCode }: ShareGameMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [openPlacement, setOpenPlacement] = useState<'bottom' | 'top'>(
    'bottom',
  );
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isCopied, setIsCopied] = useTimedTrue(2000);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const hasNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleTrigger = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 300 && rect.top > 300) {
        setOpenPlacement('top');
      } else {
        setOpenPlacement('bottom');
      }
    }
    setIsOpen((v) => !v);
  }, []);

  const handleNativeShare = useCallback(async () => {
    const url = buildInviteUrl(roomId, inviteCode);
    if (!url) return;
    const text = t('games.common.shareMessage');
    const title = t('games.common.shareTitle');

    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      try {
        setIsOpen(false);
        await navigator.share({ title, text, url });
        trackInviteShared('native', roomId);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
  }, [roomId, inviteCode, t]);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onDocClick, { capture: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick, { capture: true });
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const handleCopy = useCallback(async () => {
    const url = buildInviteUrl(roomId, inviteCode);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      trackInviteShared('copy', roomId);
      setIsCopied();
    } catch {}
  }, [roomId, inviteCode, setIsCopied]);

  const handleChannelClick = useCallback(
    (channel: ShareChannel['key'], href: string) => {
      if (typeof window === 'undefined') return;
      window.open(href, '_blank', 'noopener,noreferrer');
      trackInviteShared(channel, roomId);
      setIsOpen(false);
    },
    [roomId],
  );

  const handleShowQr = useCallback(() => {
    setIsOpen(false);
    setIsQrOpen(true);
  }, []);

  const url = buildInviteUrl(roomId, inviteCode);
  const text = t('games.common.shareMessage');

  return (
    <div ref={containerRef} className="relative inline-flex z-[100]">
      <Button
        className="!px-2 sm:!px-3"
        variant="glass"
        size="sm"
        onClick={handleTrigger}
        aria-label={t('games.common.shareTooltip')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="share-game-menu-popover"
        title={t('games.common.shareTooltip')}
        data-testid="share-game-button"
      >
        🔗
        <span className="hidden sm:inline">
          {' ' + t('games.common.share')}
        </span>
      </Button>

      {isOpen && (
        <ShareChannelsPopover
          url={url}
          text={text}
          title={t('games.common.shareTitle')}
          isCopied={isCopied}
          onCopy={handleCopy}
          onShowQr={handleShowQr}
          onChannelClick={handleChannelClick}
          onNativeShare={handleNativeShare}
          hasNativeShare={hasNativeShare}
          className={cx(
            'absolute right-0 min-w-[240px] z-[1000]',
            openPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        />
      )}

      <RoomQrModal
        open={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        roomId={roomId}
        inviteCode={inviteCode}
      />
    </div>
  );
}
