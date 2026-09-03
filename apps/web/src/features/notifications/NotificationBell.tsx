'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Typography } from '@arcadeum/ui';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { useNotificationSocket } from '@/shared/lib/socket';
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
  const onSocketEvent = useNotificationsStore((s) => s.onSocketEvent);
  const onSocketUnreadCount = useNotificationsStore(
    (s) => s.onSocketUnreadCount,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (token) {
      void fetchUnreadCount(token);
    }
  }, [token, fetchUnreadCount]);

  const handleNewNotification = useCallback(
    (payload: unknown) => {
      onSocketEvent('notification:new', payload as NotificationDto);
    },
    [onSocketEvent],
  );

  const handleUnreadCount = useCallback(
    (payload: unknown) => {
      const data = payload as { count?: number };
      if (typeof data?.count === 'number') {
        onSocketUnreadCount(data.count);
      }
    },
    [onSocketUnreadCount],
  );

  useNotificationSocket('notification:new', handleNewNotification);
  useNotificationSocket('notification:unread-count', handleUnreadCount);

  if (!token) return null;

  return (
    <div className="relative">
      <Button
        variant="icon"
        size="md"
        aria-label={t('notifications.bell.aria') as string}
        data-testid={testId}
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
            className="absolute top-0 right-0 min-w-4 h-4 px-1 rounded-full bg-[var(--error)] flex items-center justify-center pointer-events-none"
            role="status"
            aria-live="polite"
            data-testid="notification-bell-badge"
          >
            <Typography className="text-[10px] font-bold text-[#f5f7ff]">
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
      className="absolute top-full right-0 mt-2 w-[360px] max-h-[480px] bg-[var(--background)] border border-[var(--borderColor)] rounded-xl p-3 flex flex-col gap-3 z-[100] shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
    >
      <div className="flex justify-between items-center">
        <Typography className="text-[20px] font-bold">
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
        <Typography className="py-5 text-center text-secondary">
          {t('notifications.bell.empty')}
        </Typography>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[380px]">
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
      className="no-underline text-inherit"
    >
      <div
        data-testid="notification-row"
        data-unread={item.read ? undefined : 'true'}
        className={`p-3 rounded-lg flex flex-col gap-1 transition-colors hover:bg-[var(--backgroundPress)] ${
          item.read ? 'bg-transparent' : 'bg-[var(--backgroundHover)]'
        }`}
      >
        <Typography weight={item.read ? '500' : '700'} uiSize="sm">
          {title}
        </Typography>
        <Typography className="line-clamp-2 text-secondary">{body}</Typography>
      </div>
    </Link>
  );
});
