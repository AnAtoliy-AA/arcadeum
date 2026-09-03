import React from 'react';
import Link from 'next/link';
import { ReengagementTrigger } from '@/shared/lib/reengagement';

export interface ReengagementBannerProps {
  trigger: ReengagementTrigger;
  onDismiss?: () => void;
  className?: string;
}

export function ReengagementBanner({
  trigger,
  onDismiss,
  className = '',
}: ReengagementBannerProps) {
  return (
    <div
      data-testid="reengagement-banner"
      className={`w-full rounded-xl p-4 bg-surface-elevated/80 border border-primary/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg ${className}`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <h4 className="text-sm font-semibold text-text">{trigger.title}</h4>
        </div>
        <p className="text-xs text-text-muted">{trigger.description}</p>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {trigger.dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss banner"
            className="px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text rounded-lg hover:bg-surface-subtle transition-colors"
          >
            Dismiss
          </button>
        )}
        <Link
          href={trigger.actionUrl}
          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          {trigger.actionLabel}
        </Link>
      </div>
    </div>
  );
}
