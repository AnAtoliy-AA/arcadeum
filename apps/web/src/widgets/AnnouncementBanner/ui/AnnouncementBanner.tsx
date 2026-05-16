'use client';

import { useState } from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { useLanguage } from '@/shared/i18n/context';
import { useActiveAnnouncement } from '../hooks/useActiveAnnouncement';
import { addDismissed } from '../lib/dismissedStorage';
import { isSafeCtaHref } from '../lib/ctaHrefSafety';
import type { AnnouncementSeverity } from '../api';

interface BannerLabels {
  dismissAriaLabel: string;
  expandAriaLabel: string;
  collapseAriaLabel: string;
}

const SEVERITY_BG: Record<AnnouncementSeverity, string> = {
  info: '$infoBgSoft',
  warning: '$warningBgSoft',
  critical: '$errorBgSoft',
};
const SEVERITY_ICON: Record<AnnouncementSeverity, string> = {
  info: 'ℹ',
  warning: '⚠',
  critical: '⛔',
};

export function AnnouncementBanner(): React.ReactElement | null {
  const { data: announcement, refetch } = useActiveAnnouncement();
  const { messages } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  if (!announcement) return null;

  const labels =
    (
      messages as {
        widgets?: { announcementBanner?: BannerLabels };
      }
    ).widgets?.announcementBanner ??
    ({
      dismissAriaLabel: 'Dismiss announcement',
      expandAriaLabel: 'Show details',
      collapseAriaLabel: 'Hide details',
    } satisfies BannerLabels);

  const { severity, title, body, ctaLabel, ctaHref } = announcement;
  const role = severity === 'critical' ? 'alert' : 'status';
  const showCta = isSafeCtaHref(ctaHref) && !!ctaLabel;
  const isDismissable = severity !== 'critical';
  const hasBody = !!body;

  const handleDismiss = () => {
    addDismissed({ id: announcement.id, updatedAt: announcement.updatedAt });
    refetch();
  };

  const toggleBody = () => {
    if (hasBody) setExpanded((v) => !v);
  };

  const isExternal =
    ctaHref?.startsWith('https://') || ctaHref?.startsWith('http://');

  return (
    <YStack
      role={role}
      backgroundColor={SEVERITY_BG[severity]}
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderBottomWidth={1}
      borderColor="$borderColor"
      data-testid="announcement-banner"
    >
      <XStack alignItems="center" gap="$3" flexWrap="wrap">
        <Text fontSize="$5" aria-hidden>
          {SEVERITY_ICON[severity]}
        </Text>

        <Text
          fontSize="$3"
          fontWeight="600"
          flex={1}
          minWidth={0}
          cursor={hasBody ? 'pointer' : 'default'}
          onPress={hasBody ? toggleBody : undefined}
          aria-expanded={hasBody ? expanded : undefined}
          aria-label={
            hasBody
              ? expanded
                ? labels.collapseAriaLabel
                : labels.expandAriaLabel
              : undefined
          }
        >
          {title}
        </Text>

        {showCta && ctaHref && (
          <a
            href={ctaHref}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            style={{
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'underline',
              color: 'inherit',
            }}
            data-testid="announcement-cta"
          >
            {ctaLabel}
          </a>
        )}

        {isDismissable && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={labels.dismissAriaLabel}
            data-testid="announcement-dismiss"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              fontSize: 18,
              lineHeight: 1,
              color: 'inherit',
            }}
          >
            ×
          </button>
        )}
      </XStack>

      {hasBody && expanded && (
        <Text
          marginTop="$2"
          fontSize="$2"
          opacity={0.85}
          data-testid="announcement-body"
        >
          {body}
        </Text>
      )}
    </YStack>
  );
}
