'use client';

import { useEffect, useState } from 'react';
import { View, Text, YStack, XStack } from 'tamagui';
import Link from 'next/link';
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
  const loadInbox = useNotificationsStore((s) => s.loadInbox);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    void initialize(token);
  }, [token, initialize]);

  if (!token) return null;

  return (
    <View position="relative">
      <Button
        variant="icon"
        size="md"
        aria-label={t('notifications.bell.aria') as string}
        data-testid={testId}
        onPress={() => {
          setOpen((o) => {
            const next = !o;
            if (next) void loadInbox(token);
            return next;
          });
        }}
      >
        <BellIcon size={20} />
        {unreadCount > 0 && (
          <View
            position="absolute"
            top={2}
            right={2}
            minWidth={16}
            height={16}
            paddingHorizontal={4}
            borderRadius={8}
            backgroundColor="$error"
            alignItems="center"
            justifyContent="center"
            data-testid="notification-bell-badge"
          >
            <Text fontSize={10} fontWeight="700" color="$white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </Button>
      {open && (
        <NotificationPopover token={token} onClose={() => setOpen(false)} />
      )}
    </View>
  );
}

function NotificationPopover({
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
    <YStack
      position="absolute"
      top="100%"
      right={0}
      marginTop="$2"
      width={360}
      maxHeight={480}
      backgroundColor="$background"
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius="$3"
      padding="$3"
      gap="$3"
      zIndex={100}
      shadowColor="rgba(0,0,0,0.4)"
      shadowRadius={20}
      shadowOffset={{ width: 0, height: 8 }}
      data-testid="notification-popover"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$5" fontWeight="700">
          {t('notifications.bell.title')}
        </Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() => void markAllRead(token)}
        >
          {t('notifications.bell.markAllRead')}
        </Button>
      </XStack>
      {items.length === 0 ? (
        <Text color="$colorMuted" textAlign="center" paddingVertical="$5">
          {t('notifications.bell.empty')}
        </Text>
      ) : (
        <YStack gap="$2" overflow="scroll">
          {items.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onClick={onClose}
              token={token}
            />
          ))}
        </YStack>
      )}
    </YStack>
  );
}

function NotificationRow({
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
      <YStack
        padding="$3"
        borderRadius="$2"
        backgroundColor={item.read ? 'transparent' : '$backgroundHover'}
        hoverStyle={{ backgroundColor: '$backgroundPress' }}
        gap="$1"
        data-testid="notification-row"
        data-unread={item.read ? undefined : 'true'}
      >
        <Text fontWeight={item.read ? '500' : '700'} fontSize="$3">
          {title}
        </Text>
        <Text color="$colorMuted" fontSize="$2" numberOfLines={2}>
          {body}
        </Text>
      </YStack>
    </Link>
  );
}
