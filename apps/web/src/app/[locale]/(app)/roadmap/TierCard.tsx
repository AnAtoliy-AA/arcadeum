'use client';

import { Typography } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { Tier, TierFeature } from './roadmap-data';

export function StatusBadge({ status }: { status: TierFeature['status'] }) {
  const { t } = useTranslation();

  if (status === 'implemented') {
    return (
      <div className="px-2.5 py-0.5 rounded-full bg-[var(--success)]/15 border border-[var(--success)]/30 shrink-0 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
        <Typography
          className="font-bold text-[var(--success)] text-[11px]"
          variant="caption"
          uiSize="xs"
        >
          {t('pages.roadmap.statusBadges.implemented')}
        </Typography>
      </div>
    );
  }
  if (status === 'partial') {
    return (
      <div className="px-2.5 py-0.5 rounded-full bg-[var(--warning)]/15 border border-[var(--warning)]/30 shrink-0 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
        <Typography
          className="font-bold text-[var(--warning)] text-[11px]"
          variant="caption"
          uiSize="xs"
        >
          {t('pages.roadmap.statusBadges.inProgress')}
        </Typography>
      </div>
    );
  }
  return (
    <div className="px-2.5 py-0.5 rounded-full bg-[var(--bgCard)] border border-[var(--glassBorder)] shrink-0 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--foregroundSecondary)] opacity-60" />
      <Typography
        variant="caption"
        uiSize="xs"
        alpha="medium"
        className="text-[11px]"
      >
        {t('pages.roadmap.statusBadges.planned')}
      </Typography>
    </div>
  );
}

export function TierCard({
  tier,
  isExpanded,
  onToggle,
}: {
  tier: Tier;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const implementedCount = tier.features.filter(
    (f) => f.status === 'implemented',
  ).length;
  const progressPercent =
    tier.features.length > 0
      ? Math.round((implementedCount / tier.features.length) * 100)
      : 0;

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden transition-all border ${
        isExpanded
          ? 'bg-[var(--glassBg)] border-[var(--primary)]/30 shadow-lg shadow-[var(--primary)]/5'
          : 'bg-[var(--glassBg)]/60 border-[var(--glassBorder)] hover:border-[var(--glassBorder)]/80'
      }`}
    >
      <div
        className="flex flex-col p-4 md:p-5 cursor-pointer select-none transition-colors active:opacity-80"
        onClick={onToggle}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/25 flex items-center justify-center shrink-0 text-xl">
              {tier.icon}
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Typography
                  className="font-extrabold text-[var(--foreground)]"
                  variant="heading"
                  uiSize="md"
                >
                  {tier.label}
                </Typography>
                <div className="px-2 py-0.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                  <Typography
                    variant="caption"
                    uiSize="xs"
                    className="text-[var(--primary)] font-semibold"
                  >
                    {t('pages.roadmap.tiers.featuresCount', {
                      count: tier.features.length,
                    })}
                  </Typography>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-[var(--bgCard)] border border-[var(--glassBorder)]">
                  <Typography variant="caption" uiSize="xs" alpha="high">
                    {t('pages.roadmap.tiers.doneRatio', {
                      done: implementedCount,
                      total: tier.features.length,
                    })}{' '}
                    ({progressPercent}%)
                  </Typography>
                </div>
              </div>
              <Typography variant="caption" alpha="medium" className="text-xs">
                {tier.effort}
              </Typography>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="w-20 sm:w-28 hidden sm:flex flex-col gap-1">
              <div className="w-full h-1.5 rounded-full bg-[var(--bgCard)] overflow-hidden border border-[var(--glassBorder)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[var(--glassBg)] border border-[var(--glassBorder)] flex items-center justify-center shrink-0 text-sm font-bold text-[var(--foregroundSecondary)]">
              {isExpanded ? '−' : '+'}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col border-t border-[var(--glassBorder)] p-4 md:p-6 gap-3 bg-[var(--bgCard)]/40">
          {tier.features.map((f, idx) => (
            <div
              key={`${f.title}-${f.arc || idx}`}
              className={`flex flex-col sm:flex-row sm:items-start justify-between p-3.5 rounded-xl gap-3 transition-colors border ${
                idx % 2 === 0
                  ? 'bg-[var(--glassBg)]/50 border-[var(--glassBorder)]/60'
                  : 'bg-[var(--bgCard)]/30 border-transparent'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span
                  className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                    f.status === 'implemented'
                      ? 'bg-[var(--success)]'
                      : f.status === 'partial'
                        ? 'bg-[var(--warning)]'
                        : 'bg-[var(--foregroundSecondary)] opacity-60'
                  }`}
                />
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Typography
                      className="font-bold text-[var(--foreground)]"
                      variant="label"
                      uiSize="sm"
                    >
                      {f.title}
                    </Typography>
                    {f.arc && (
                      <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/25">
                        {f.arc}
                      </span>
                    )}
                  </div>
                  {f.desc && (
                    <Typography
                      variant="body"
                      uiSize="sm"
                      alpha="medium"
                      className="leading-relaxed"
                    >
                      {f.desc}
                    </Typography>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <StatusBadge status={f.status} />
                <div className="px-2 py-0.5 rounded-md bg-[var(--bgCard)] border border-[var(--glassBorder)]">
                  <Typography
                    variant="caption"
                    uiSize="xs"
                    alpha="medium"
                    className="font-mono text-[11px]"
                  >
                    {f.effort}
                  </Typography>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
