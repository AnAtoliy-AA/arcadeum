'use client';

import { cx } from '@arcadeum/ui/utils/cx';
import { useQuery } from '@/shared/hooks/useQuery';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { seasonsApi } from '../api';
import { daysRemaining, seasonAccent, seasonProgress } from '../lib/progress';
import { SeasonRewards } from './SeasonRewards';

/**
 * Live season identity card: themed name, time remaining, progress bar and
 * the cosmetic reward ladder. Self-fetching; renders nothing until a season
 * is available so it can mount anywhere (profile, home, lobby).
 */
export function SeasonBanner({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { data: season } = useQuery({
    queryKey: ['seasons', 'current'],
    queryFn: () => seasonsApi.getCurrentSeason(),
  });

  if (!season) return null;

  const accent = seasonAccent(season.theme);
  const progress = seasonProgress(season.startsAt, season.endsAt);
  const daysLeft = daysRemaining(season.endsAt);
  const themeLabel = t(`pages.seasons.theme.${season.theme}` as TranslationKey);

  return (
    <section
      data-testid="season-banner"
      aria-label={t('pages.seasons.ariaLabel')}
      className={cx(
        'flex flex-col gap-3 rounded-2xl border p-4 backdrop-blur-md md:p-5',
        className,
      )}
      style={{
        borderColor: `${accent}55`,
        background: `linear-gradient(120deg, ${accent}1f, var(--glassBg))`,
      }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span
          data-testid="season-banner-eyebrow"
          className="text-[12px] tracking-[2px] uppercase opacity-[0.6]"
        >
          {`${t('pages.seasons.label')} ${season.number}`}
        </span>
        <span
          data-testid="season-banner-countdown"
          className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tabular-nums"
          style={{ borderColor: `${accent}66`, color: accent }}
        >
          {t('pages.seasons.daysLeft', { days: daysLeft })}
        </span>
      </div>

      <span
        data-testid="season-banner-title"
        className="text-[20px] font-extrabold tracking-tight"
      >
        {themeLabel}
      </span>

      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-label={t('pages.seasons.progressAria')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          data-testid="season-banner-progress"
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--glassBg)]"
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.round(progress * 100)}%`,
              background: `linear-gradient(90deg, ${accent}99, ${accent})`,
            }}
          />
        </div>
        <span className="text-[12px] tabular-nums opacity-[0.7]">
          {Math.round(progress * 100)}%
        </span>
      </div>

      <SeasonRewards tiers={season.rewardTiers} />
    </section>
  );
}
