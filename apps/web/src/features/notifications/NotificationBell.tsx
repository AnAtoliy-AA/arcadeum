'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { Typography } from '@arcadeum/ui';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useNotificationsStore } from './notifications.store';
import type { NotificationDto } from './notifications.types';

type T = (key: string, params?: Record<string, string>) => string;

function BellIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

type Props = {
  testId?: string;
};

export function NotificationBell({ testId = 'notification-bell' }: Props) {
  const { t: rawT } = useTranslation();
  const t: T = rawT as unknown as T;
  const { snapshot } = useSessionTokens();
  const token = snapshot.accessToken;
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const initialize = useNotificationsStore((s) => s.initialize);
  const fetchUnreadCount = useNotificationsStore((s) => s.fetchUnreadCount);
  const loadInbox = useNotificationsStore((s) => s.loadInbox);
  const [open, setOpen] = useState(false);
  const fetchedRef = useState(() => ({ current: false }))[0];

  const ensureLoaded = () => {
    if (!token || fetchedRef.current) return;
    fetchedRef.current = true;
    void fetchUnreadCount(token);
  };

  if (!token) return null;

  return (
    <div style={{ position: 'relative' }}>
      <Button
        variant="icon"
        size="md"
        aria-label={t('notifications.bell.aria') as string}
        data-testid={testId}
        onMouseEnter={ensureLoaded}
        onFocus={ensureLoaded}
        onClick={() => {
          setOpen((o) => {
            const next = !o;
            if (next) {
              void initialize(token);
              void loadInbox(token);
            }
            return next;
          });
        }}
        className="hover:scale-[1.1] hover:bg-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.25)] hover:shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
      >
        <BellIcon size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              borderRadius: 8,
              backgroundColor: 'var(--error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            role="status"
            aria-live="polite"
            data-testid="notification-bell-badge"
          >
            <Typography className={'text-[10px] font-bold' + ' text-[#f5f7ff]'}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Typography>
          </span>
        )}
      </Button>
      {open && (
        <NotificationPopover token={token} onClose={() => setOpen(false)} />
      )}
    </div>
  );
}

const NotificationPopover = memo(function NotificationPopover({
  token,
  onClose,
}: {
  token: string;
  onClose: () => void;
}) {
  const { t: rawT } = useTranslation();
  const t: T = rawT as unknown as T;
  const items = useNotificationsStore((s) => s.items);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  return (
    <div
      data-testid="notification-popover"
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 8,
        width: 360,
        maxHeight: 480,
        backgroundColor: 'var(--background)',
        borderColor: 'var(--borderColor)',
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 12,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 100,
        boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography className={'text-[20px] font-bold'}>
          {t('notifications.bell.title')}
        </Typography>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void markAllRead(token)}
        >
          {t('notifications.bell.markAllRead')}
        </Button>
      </div>
      {items.length === 0 ? (
        <Typography
          className="py-5 text-center"
          style={{ color: 'var(--colorMuted)' }}
        >
          {t('notifications.bell.empty')}
        </Typography>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            overflow: 'scroll',
          }}
        >
          {items.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onClick={onClose}
              token={token}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const NotificationRow = memo(function NotificationRow({
  item,
  onClick,
  token,
}: {
  item: NotificationDto;
  onClick: () => void;
  token: string;
}) {
  const { t: rawT } = useTranslation();
  const t: T = rawT as unknown as T;
  const markRead = useNotificationsStore((s) => s.markRead);
  const title = t(item.titleKey, item.i18nParams as Record<string, string>);
  const body = t(item.bodyKey, item.i18nParams as Record<string, string>);

  return (
    <Link
      href={item.url}
      onClick={() => {
        if (!item.read) void markRead(item.id, token);
        onClick();
      }}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        data-testid="notification-row"
        data-unread={item.read ? undefined : 'true'}
        style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: item.read ? 'transparent' : 'var(--backgroundHover)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--backgroundPress)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = item.read
            ? 'transparent'
            : 'var(--backgroundHover)';
        }}
      >
        <Typography fontWeight={item.read ? '500' : '700'} uiSize="sm">
          {title}
        </Typography>
        <Typography
          className="line-clamp-2"
          style={{ color: 'var(--colorMuted)' }}
        >
          {body}
        </Typography>
      </div>
    </Link>
  );
});
