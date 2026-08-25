'use client';

import { useState, useMemo } from 'react';
import { Typography, FilterChip, EmptyState } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { Tier, TierFeature } from '../roadmap-data';
import { StatusBadge } from '../TierCard';

type FlatFeature = TierFeature & {
  tierId: string;
  tierLabel: string;
};

export function RoadmapFeaturesTable({ tiers }: { tiers: Tier[] }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const allFeatures: FlatFeature[] = useMemo(() => {
    return tiers.flatMap((tier) =>
      tier.features.map((f) => ({
        ...f,
        tierId: tier.id,
        tierLabel: tier.label,
      })),
    );
  }, [tiers]);

  const filteredFeatures = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allFeatures.filter((f) => {
      if (selectedStatus && f.status !== selectedStatus) {
        return false;
      }
      if (selectedTier && f.tierId !== selectedTier) {
        return false;
      }
      if (query) {
        const titleMatches = f.title.toLowerCase().includes(query);
        const descMatches = f.desc.toLowerCase().includes(query);
        const arcMatches = f.arc ? f.arc.toLowerCase().includes(query) : false;
        const tierMatches = f.tierLabel.toLowerCase().includes(query);
        return titleMatches || descMatches || arcMatches || tierMatches;
      }
      return true;
    });
  }, [allFeatures, searchQuery, selectedStatus, selectedTier]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md">
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--foregroundSecondary)] pointer-events-none">
            🔍
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('pages.roadmap.filters.searchPlaceholder')}
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[var(--bgCard)] border border-[var(--glassBorder)] text-sm text-[var(--foreground)] placeholder:text-[var(--foregroundSecondary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--foregroundSecondary)] hover:text-[var(--foreground)] w-5 h-5 rounded-full bg-[var(--glassBg)] flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            active={selectedStatus === null}
            onClick={() => setSelectedStatus(null)}
          >
            {t('pages.roadmap.filters.allStatuses')} ({allFeatures.length})
          </FilterChip>
          <FilterChip
            active={selectedStatus === 'implemented'}
            onClick={() =>
              setSelectedStatus(
                selectedStatus === 'implemented' ? null : 'implemented',
              )
            }
          >
            {t('pages.roadmap.filters.implemented')} (
            {allFeatures.filter((f) => f.status === 'implemented').length})
          </FilterChip>
          <FilterChip
            active={selectedStatus === 'partial'}
            onClick={() =>
              setSelectedStatus(selectedStatus === 'partial' ? null : 'partial')
            }
          >
            {t('pages.roadmap.filters.inProgress')} (
            {allFeatures.filter((f) => f.status === 'partial').length})
          </FilterChip>
          <FilterChip
            active={selectedStatus === 'not_started'}
            onClick={() =>
              setSelectedStatus(
                selectedStatus === 'not_started' ? null : 'not_started',
              )
            }
          >
            {t('pages.roadmap.filters.planned')} (
            {allFeatures.filter((f) => f.status === 'not_started').length})
          </FilterChip>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--glassBorder)]">
          <FilterChip
            active={selectedTier === null}
            onClick={() => setSelectedTier(null)}
          >
            {t('pages.roadmap.filters.allTiers')}
          </FilterChip>
          {tiers.map((tier) => (
            <FilterChip
              key={tier.id}
              active={selectedTier === tier.id}
              onClick={() =>
                setSelectedTier(selectedTier === tier.id ? null : tier.id)
              }
            >
              {tier.icon} {tier.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {filteredFeatures.length === 0 ? (
        <EmptyState
          icon="🔍"
          message={t('pages.roadmap.empty.description')}
          action={
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus(null);
                setSelectedTier(null);
              }}
              className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              {t('pages.roadmap.empty.resetButton')}
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredFeatures.map((f, idx) => (
            <div
              key={`${f.tierId}-${f.title}-${f.arc || idx}`}
              className="flex flex-col justify-between p-4 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)] hover:border-[var(--glassBorder)]/80 gap-3 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Typography
                      variant="label"
                      uiSize="sm"
                      className="font-extrabold text-[var(--foreground)]"
                    >
                      {f.title}
                    </Typography>
                    {f.arc && (
                      <span className="px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/25">
                        {f.arc}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={f.status} />
                </div>

                {f.desc && (
                  <Typography
                    variant="body"
                    uiSize="sm"
                    alpha="medium"
                    className="leading-relaxed line-clamp-2"
                  >
                    {f.desc}
                  </Typography>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--glassBorder)]">
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--bgCard)] border border-[var(--glassBorder)] text-[var(--foregroundSecondary)]">
                  {f.tierLabel}
                </span>
                <span className="text-[11px] font-mono text-[var(--foregroundSecondary)]">
                  {f.effort}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
