'use client';

import { Badge, type BadgeVariant } from '@arcadeum/ui';
import type {
  ActivityEndReason,
  ActivityMatchResult,
} from '@/shared/api/activity';
import { useTranslation } from '@/shared/i18n/useTranslation';

/**
 * Win is green, draw is a calm blue and a loss is neutral grey: nothing
 * in a public feed should read as an error, so red is never used.
 */
const VARIANT: Record<ActivityMatchResult, BadgeVariant> = {
  win: 'success',
  draw: 'info',
  loss: 'neutral',
};

const ICON: Record<ActivityMatchResult, string> = {
  win: 'M5 12.5l4.5 4.5L19 7.5',
  draw: 'M6 9.5h12M6 14.5h12',
  loss: 'M6 12h12',
};

interface ActivityResultChipProps {
  result: ActivityMatchResult;
  endReason?: ActivityEndReason | null;
}

export function ActivityResultChip({
  result,
  endReason,
}: ActivityResultChipProps) {
  const { t } = useTranslation();
  const label =
    result === 'win'
      ? t('home.activityFeed.resultWin')
      : result === 'draw'
        ? t('home.activityFeed.resultDraw')
        : t('home.activityFeed.resultLoss');
  const reason =
    endReason === 'forfeit'
      ? t('home.activityFeed.reasonForfeit')
      : endReason === 'timeout'
        ? t('home.activityFeed.reasonTimeout')
        : null;
  return (
    <span
      className="inline-flex items-center gap-1.5"
      data-testid="activity-result"
    >
      <Badge variant={VARIANT[result]} size="sm">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={ICON[result]} />
        </svg>
        {label}
      </Badge>
      {reason && (
        <span className="text-[11px] text-[var(--textSecondary)]">
          {reason}
        </span>
      )}
    </span>
  );
}
