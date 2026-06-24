'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useTimedTrue } from '@/shared/hooks/useTimedTrue';

interface ShareGameMenuProps {
  roomId: string;
  inviteCode?: string;
}

interface ShareChannel {
  key: 'telegram' | 'whatsapp' | 'twitter' | 'facebook';
  label: string;
  href: string;
  icon: ReactElement;
}

const ICON_SIZE = 18;

function TelegramIcon() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="#229ED9"
      aria-hidden
    >
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.13-3.05-1.98 1.93c-.23.23-.42.42-.85.41z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="#25D366"
      aria-hidden
    >
      <path d="M17.47 14.38c-.3-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.15-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.9-2.18-.24-.58-.48-.5-.66-.51l-.56-.01c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.46 0 1.45 1.06 2.85 1.21 3.05.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.74-.71 1.99-1.4.25-.69.25-1.28.17-1.4-.07-.12-.27-.2-.57-.35zM12.04 21.36h-.01a9.27 9.27 0 01-4.72-1.3l-.34-.2-3.51.92.93-3.42-.22-.35a9.32 9.32 0 01-1.42-4.94c0-5.14 4.19-9.33 9.33-9.33 2.49 0 4.83.97 6.59 2.73a9.27 9.27 0 012.73 6.6c-.01 5.14-4.2 9.33-9.34 9.33zm7.94-17.27A11.13 11.13 0 0012.04 1C5.9 1 .93 5.97.93 12.1c0 1.96.51 3.87 1.48 5.55L.83 23l5.49-1.44a11.16 11.16 0 005.72 1.46h.01c6.13 0 11.1-4.97 11.1-11.1 0-2.97-1.15-5.76-3.25-7.86z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.659l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="#1877F2"
      aria-hidden
    >
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.13 22 16.99 22 12z" />
    </svg>
  );
}

function CopyLinkIcon() {
  return (
    <svg
      width={ICON_SIZE}
      height={ICON_SIZE}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function buildInviteUrl(roomId: string, inviteCode?: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/games/rooms/${roomId}${
    inviteCode ? `?inviteCode=${inviteCode}` : ''
  }`;
}

function buildChannels(
  t: ReturnType<typeof useTranslation>['t'],
  url: string,
  text: string,
): ShareChannel[] {
  const u = encodeURIComponent(url);
  const txt = encodeURIComponent(text);
  return [
    {
      key: 'telegram',
      label: t('games.common.shareVia.telegram'),
      href: `https://t.me/share/url?url=${u}&text=${txt}`,
      icon: <TelegramIcon />,
    },
    {
      key: 'whatsapp',
      label: t('games.common.shareVia.whatsapp'),
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      icon: <WhatsAppIcon />,
    },
    {
      key: 'twitter',
      label: t('games.common.shareVia.twitter'),
      href: `https://twitter.com/intent/tweet?url=${u}&text=${txt}`,
      icon: <TwitterIcon />,
    },
    {
      key: 'facebook',
      label: t('games.common.shareVia.facebook'),
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      icon: <FacebookIcon />,
    },
  ];
}

export function ShareGameMenu({ roomId, inviteCode }: ShareGameMenuProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useTimedTrue(2000);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleTrigger = useCallback(async () => {
    const url = buildInviteUrl(roomId, inviteCode);
    if (!url) return;
    const text = t('games.common.shareMessage');
    const title = t('games.common.shareTitle');

    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }

    setIsOpen((v) => !v);
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
      setIsCopied();
    } catch {}
  }, [roomId, inviteCode, setIsCopied]);

  const handleChannelClick = useCallback((href: string) => {
    if (typeof window === 'undefined') return;
    window.open(href, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  }, []);

  const url = buildInviteUrl(roomId, inviteCode);
  const text = t('games.common.shareMessage');
  const channels = buildChannels(t, url, text);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      <Button
        variant="glass"
        size="sm"
        $sm={{ scale: 0.9, paddingHorizontal: '$2' }}
        onClick={handleTrigger}
        aria-label={t('games.common.shareTooltip')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="share-game-menu-popover"
        title={t('games.common.shareTooltip')}
        data-testid="share-game-button"
      >
        🔗
        <Text $sm={{ display: 'none' }}>{' ' + t('games.common.share')}</Text>
      </Button>

      {isOpen && (
        <YStack
          id="share-game-menu-popover"
          role="menu"
          aria-label={t('games.common.shareTooltip')}
          data-testid="share-game-popover"
          position="absolute"
          top="100%"
          right={0}
          marginTop="$2"
          minWidth={220}
          backgroundColor="$glassBg"
          borderColor="$glassBorder"
          borderWidth={1}
          borderRadius={12}
          padding="$2"
          gap="$1"
          zIndex={100}
        >
          {channels.map((c) => (
            <XStack
              key={c.key}
              role="menuitem"
              tabIndex={0}
              alignItems="center"
              gap="$3"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius={8}
              cursor="pointer"
              hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              focusStyle={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              data-testid={`share-via-${c.key}`}
              onPress={() => handleChannelClick(c.href)}
            >
              {c.icon}
              <Text fontSize={14}>{c.label}</Text>
            </XStack>
          ))}
          <XStack
            role="menuitem"
            tabIndex={0}
            alignItems="center"
            gap="$3"
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius={8}
            cursor="pointer"
            hoverStyle={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            focusStyle={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            data-testid="share-via-copy"
            onPress={handleCopy}
          >
            <CopyLinkIcon />
            <Text fontSize={14}>
              {isCopied
                ? t('games.common.shareVia.copied')
                : t('games.common.shareVia.copyLink')}
            </Text>
          </XStack>
        </YStack>
      )}
    </div>
  );
}
