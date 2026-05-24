'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { YStack, XStack, Text, View } from 'tamagui';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  ToggleRow,
  ToggleLabel,
  ToggleInput,
} from '@/app/[locale]/settings/styles';
import { useNotificationsStore } from './notifications.store';
import {
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
} from './notifications.types';

type T = (key: string, params?: Record<string, string>) => string;

function isIOSNonStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  if (!isIos) return false;
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  return !isStandalone;
}

export function NotificationSettingsSection() {
  const { t: rawT } = useTranslation();
  const t: T = rawT as unknown as T;
  const { snapshot } = useSessionTokens();
  const token = snapshot.accessToken;
  const prefs = useNotificationsStore((s) => s.prefs);
  const permission = useNotificationsStore((s) => s.permission);
  const initialize = useNotificationsStore((s) => s.initialize);
  const enableCategory = useNotificationsStore((s) => s.enableCategory);
  const disableCategory = useNotificationsStore((s) => s.disableCategory);
  const error = useNotificationsStore((s) => s.error);

  const iosHint = useSyncExternalStore(
    () => () => undefined,
    () => isIOSNonStandalone(),
    () => false,
  );

  useEffect(() => {
    if (token) void initialize(token);
  }, [token, initialize]);

  const permissionLabel = useMemo(() => {
    if (permission === 'granted')
      return t('notifications.settings.permission.granted');
    if (permission === 'denied')
      return t('notifications.settings.permission.denied');
    return t('notifications.settings.permission.enable');
  }, [permission, t]);

  if (!token) return null;

  return (
    <Section
      title={t('notifications.settings.title')}
      data-testid="notifications-settings-section"
    >
      <YStack gap="$3">
        <Text color="$colorMuted" fontSize="$3">
          {t('notifications.settings.description')}
        </Text>

        {iosHint ? (
          <View
            padding="$3"
            borderRadius="$2"
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            borderWidth={1}
          >
            <Text fontSize="$3">
              {t('notifications.settings.iosInstallHint')}
            </Text>
          </View>
        ) : (
          <XStack
            padding="$3"
            borderRadius="$2"
            backgroundColor="$backgroundHover"
            borderColor="$borderColor"
            borderWidth={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Text fontSize="$3">{permissionLabel}</Text>
            {permission === 'denied' && error && (
              <Text fontSize="$2" color="$error">
                {error}
              </Text>
            )}
          </XStack>
        )}

        <YStack gap="$2">
          {NOTIFICATION_CATEGORIES.map((category) => (
            <CategoryToggle
              key={category}
              category={category}
              checked={prefs[category]}
              onToggle={async (next) => {
                if (next) await enableCategory(category, token);
                else await disableCategory(category, token);
              }}
              t={t}
              disabledByPermission={iosHint || permission === 'denied'}
            />
          ))}
        </YStack>
      </YStack>
    </Section>
  );
}

type CategoryToggleProps = {
  category: NotificationCategory;
  checked: boolean;
  onToggle: (next: boolean) => Promise<void>;
  t: T;
  disabledByPermission: boolean;
};

function CategoryToggle({
  category,
  checked,
  onToggle,
  t,
  disabledByPermission,
}: CategoryToggleProps) {
  const labelKey = `notifications.categories.${category}.label`;
  const descKey = `notifications.categories.${category}.description`;
  return (
    <ToggleRow data-testid={`notification-toggle-${category}`}>
      <YStack flex={1} gap="$1">
        <ToggleLabel>{t(labelKey)}</ToggleLabel>
        <Text color="$colorMuted" fontSize="$2">
          {t(descKey)}
        </Text>
      </YStack>
      <ToggleInput
        type="checkbox"
        checked={checked}
        disabled={disabledByPermission && !checked}
        onChange={(e) => {
          void onToggle(e.currentTarget.checked);
        }}
        aria-label={t(labelKey)}
        data-testid={`notification-toggle-input-${category}`}
      />
    </ToggleRow>
  );
}
