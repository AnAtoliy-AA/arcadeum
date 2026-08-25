'use client';

import { Typography } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { Phase } from '../roadmap-parser';

export function RoadmapPhaseTimeline({
  phases,
  hoveredPhase,
  onHover,
}: {
  phases: Phase[];
  hoveredPhase: number | null;
  onHover: (phase: number | null) => void;
}) {
  const { t } = useTranslation();
  const maxDays = 61;

  return (
    <div className="flex flex-col gap-0 relative">
      <div className="absolute left-[15px] top-[24px] bottom-[24px] w-[2px] bg-[var(--glassBorder)] rounded" />
      {phases.map((p) => {
        const totalDays = parseInt(p.days.split('–')[1] || p.days, 10);
        const progress = Math.min((totalDays / maxDays) * 100, 100);
        const isHovered = hoveredPhase === p.phase;
        const isCompleted =
          p.status?.includes('100%') || p.status?.includes('Completed');
        const isInProgress = p.status?.includes('In Progress');

        return (
          <div
            key={p.phase}
            className="flex flex-col pl-10 py-3 relative"
            onMouseEnter={() => onHover(p.phase)}
            onMouseLeave={() => onHover(null)}
          >
            <div
              className={`absolute left-[8px] top-[26px] w-4 h-4 rounded-full border-2 -translate-y-1/2 transition-all duration-200 ${
                isCompleted
                  ? 'bg-[var(--success)] border-[var(--success)] shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                  : isInProgress
                    ? 'bg-[var(--warning)] border-[var(--warning)] shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                    : 'bg-[var(--bgCard)] border-[var(--glassBorder)]'
              }`}
            />

            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-3 transition-all border ${
                isHovered
                  ? 'bg-[var(--glassBg)] border-[var(--primary)]/30 shadow-md shadow-[var(--primary)]/5'
                  : 'bg-[var(--glassBg)]/50 border-[var(--glassBorder)] hover:border-[var(--glassBorder)]/80'
              }`}
            >
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-2.5 py-0.5 rounded-full bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center shrink-0">
                    <Typography
                      className="font-bold text-[var(--primary)] text-xs font-mono"
                      variant="caption"
                      uiSize="xs"
                    >
                      {t('pages.roadmap.timeline.phase', { phase: p.phase })}
                    </Typography>
                  </div>

                  {p.title && (
                    <Typography
                      className="font-extrabold text-[var(--foreground)]"
                      variant="body"
                      uiSize="sm"
                    >
                      {p.title}
                    </Typography>
                  )}

                  {p.status && (
                    <div
                      className={`px-2.5 py-0.5 rounded-full border shrink-0 text-xs font-semibold ${
                        isCompleted
                          ? 'bg-[var(--success)]/15 border-[var(--success)]/30 text-[var(--success)]'
                          : isInProgress
                            ? 'bg-[var(--warning)]/15 border-[var(--warning)]/30 text-[var(--warning)]'
                            : 'bg-[var(--bgCard)] border-[var(--glassBorder)] text-[var(--foregroundSecondary)]'
                      }`}
                    >
                      {p.status}
                    </div>
                  )}
                </div>

                <Typography
                  variant="body"
                  uiSize="sm"
                  alpha="medium"
                  className="leading-relaxed"
                >
                  {p.features}
                </Typography>

                <div className="w-full h-1.5 rounded-full bg-[var(--bgCard)] overflow-hidden border border-[var(--glassBorder)] mt-1">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-[var(--success)]'
                        : isInProgress
                          ? 'bg-[var(--warning)]'
                          : 'bg-[var(--primary)]'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 sm:pl-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--glassBorder)]">
                <Typography
                  className="font-extrabold text-[var(--foreground)] text-sm font-mono"
                  variant="body"
                  uiSize="sm"
                >
                  {p.days}
                </Typography>
                <Typography variant="caption" uiSize="xs" alpha="medium">
                  {t('pages.roadmap.timeline.daysEst')}
                </Typography>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
