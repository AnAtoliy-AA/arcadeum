'use client';

import { useState } from 'react';
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
  info: 'var(--infoBgSoft)',
  warning: 'var(--warningBgSoft)',
  critical: 'var(--errorBgSoft)',
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
    <div
      role={role}
      data-testid="announcement-banner"
      className="border-b border-[var(--borderColor)] px-3 py-2"
      style={{ backgroundColor: SEVERITY_BG[severity] }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[20px]" aria-hidden>
          {SEVERITY_ICON[severity]}
        </span>

        <span
          className="min-w-0 flex-1 cursor-default text-[16px] font-semibold"
          style={hasBody ? { cursor: 'pointer' } : undefined}
          onClick={hasBody ? toggleBody : undefined}
          role={hasBody ? 'button' : undefined}
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
        </span>

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
      </div>

      {hasBody && expanded && (
        <p
          className="mt-2 text-[14px] opacity-85"
          data-testid="announcement-body"
        >
          {body}
        </p>
      )}
    </div>
  );
}
