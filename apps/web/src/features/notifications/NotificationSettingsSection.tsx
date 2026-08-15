'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import {
  ToggleRow,
  ToggleLabel,
  ToggleInput,
} from '@/app/[locale]/(app)/settings/styles';
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
      <div className="box-border flex flex-col items-stretch gap-3">
        <span className="box-border text-[rgba(180,180,200,0.7)] text-[16px]">
          {t('notifications.settings.description')}
        </span>

        {iosHint ? (
          <div className="box-border p-3 rounded-lg bg-[var(--backgroundHover)] border-[var(--borderColor)] border">
            <span className="box-border text-[16px]">
              {t('notifications.settings.iosInstallHint')}
            </span>
          </div>
        ) : (
          <div className="box-border flex flex-row p-3 rounded-lg bg-[var(--backgroundHover)] border-[var(--borderColor)] border items-center justify-space-between">
            <span className="box-border text-[16px]">{permissionLabel}</span>
            {permission === 'denied' && error && (
              <span className="box-border text-[14px] text-[var(--error)]">
                {error}
              </span>
            )}
          </div>
        )}

        <div className="box-border flex flex-col items-stretch gap-2">
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
        </div>
      </div>
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
      <div className="box-border flex flex-col items-stretch flex-1 gap-1">
        <ToggleLabel>{t(labelKey)}</ToggleLabel>
        <span className="box-border text-[rgba(180,180,200,0.7)] text-[14px]">
          {t(descKey)}
        </span>
      </div>
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
