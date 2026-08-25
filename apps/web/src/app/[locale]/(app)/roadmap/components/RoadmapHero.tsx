'use client';

import { Typography } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { RoadmapData } from '../roadmap-parser';

export function RoadmapHero({ stats }: { stats: RoadmapData['stats'] }) {
  const { t } = useTranslation();

  const totalFeatures = parseInt(
    stats.find((s) => s.label === 'Features')?.value || '0',
    10,
  );
  const implementedCount = parseInt(
    stats.find((s) => s.label === 'Implemented')?.value || '0',
    10,
  );
  const completionPercent =
    totalFeatures > 0
      ? Math.round((implementedCount / totalFeatures) * 100)
      : 0;

  return (
    <header className="flex flex-col p-6 md:p-8 rounded-2xl border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/15 via-purple-500/10 to-pink-500/5 gap-6 backdrop-blur-md">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3 flex-wrap">
          <Typography
            variant="heading"
            level={1}
            uiSize="3xl"
            gradient="primary"
            className="font-extrabold tracking-tight"
          >
            {t('pages.roadmap.title')}
          </Typography>
          <div className="px-2.5 py-0.5 rounded-full bg-[var(--success)]/15 border border-[var(--success)]/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
            <Typography
              variant="label"
              uiSize="xs"
              className="font-bold text-[var(--success)] uppercase tracking-wider"
            >
              {t('pages.roadmap.stats.liveBadge')}
            </Typography>
          </div>
        </div>

        <Typography
          variant="body"
          uiSize="md"
          alpha="medium"
          className="max-w-2xl leading-relaxed"
        >
          {t('pages.roadmap.subtitle')}
        </Typography>

        <div className="self-start px-3 py-1 rounded-full bg-[var(--bgCard)]/80 border border-[var(--glassBorder)]">
          <Typography variant="caption" uiSize="xs" alpha="medium">
            {t('pages.roadmap.canonicalNotice')}
          </Typography>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]">
        <div className="flex items-center justify-between">
          <Typography
            variant="label"
            uiSize="sm"
            className="font-bold text-[var(--foreground)]"
          >
            {t('pages.roadmap.stats.overallProgress')}
          </Typography>
          <Typography
            variant="label"
            uiSize="sm"
            className="font-extrabold text-[var(--primary)]"
          >
            {completionPercent}%
          </Typography>
        </div>
        <div className="w-full h-2 rounded-full bg-[var(--bgCard)] overflow-hidden border border-[var(--glassBorder)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] via-purple-500 to-[var(--success)] transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((stat) => {
          const isImplemented = stat.label === 'Implemented';
          const isInProgress = stat.label === 'In Progress';
          const isFeatures = stat.label === 'Features';

          const accentColor = isImplemented
            ? 'text-[var(--success)]'
            : isInProgress
              ? 'text-[var(--warning)]'
              : isFeatures
                ? 'text-[var(--primary)]'
                : 'text-[var(--foregroundSecondary)]';

          const bgStyle = isImplemented
            ? 'bg-[var(--success)]/10 border-[var(--success)]/20'
            : isInProgress
              ? 'bg-[var(--warning)]/10 border-[var(--warning)]/20'
              : isFeatures
                ? 'bg-[var(--primary)]/10 border-[var(--primary)]/20'
                : 'bg-[var(--glassBg)] border-[var(--glassBorder)]';

          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-sm transition-transform hover:-translate-y-0.5"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${bgStyle}`}
              >
                {stat.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <Typography
                  variant="heading"
                  uiSize="lg"
                  className={`font-extrabold truncate ${accentColor}`}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="caption"
                  uiSize="xs"
                  alpha="medium"
                  className="truncate"
                >
                  {stat.label}
                </Typography>
              </div>
            </div>
          );
        })}
      </div>
    </header>
  );
}
