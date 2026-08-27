'use client';

import { useState, useCallback } from 'react';
import {
  PageLayout,
  Container,
  Typography,
  Section,
  Button,
} from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { RoadmapData } from './roadmap-parser';
import { TIERS, PHASES, STATS } from './roadmap-data';
import { TierCard } from './TierCard';
import { RoadmapHero } from './components/RoadmapHero';
import { RoadmapCurrentState } from './components/RoadmapCurrentState';
import { RoadmapPhaseTimeline } from './components/RoadmapPhaseTimeline';
import { RoadmapFeaturesTable } from './components/RoadmapFeaturesTable';
import { RoadmapLegalBanner } from './components/RoadmapLegalBanner';

type ViewMode = 'timeline' | 'tiers' | 'directory';

export default function RoadmapPageContent({
  initialData,
}: {
  initialData?: RoadmapData;
}) {
  const { t } = useTranslation();
  const tiers =
    initialData?.tiers && initialData.tiers.length > 0
      ? initialData.tiers
      : TIERS;
  const phases =
    initialData?.phases && initialData.phases.length > 0
      ? initialData.phases
      : PHASES;
  const stats =
    initialData?.stats && initialData.stats.length > 0
      ? initialData.stats
      : STATS;

  const [viewMode, setViewMode] = useState<ViewMode>('tiers');
  const [expandedTier, setExpandedTier] = useState<string | null>(
    tiers[0]?.id ?? 'tier1',
  );
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);

  const toggleTier = useCallback(
    (id: string) => setExpandedTier((prev) => (prev === id ? null : id)),
    [],
  );

  const handleExpandAllTiers = useCallback(() => {
    setExpandedTier(tiers[0]?.id ?? 'tier1');
  }, [tiers]);

  return (
    <PageLayout>
      <Container size="lg">
        <div className="flex flex-col gap-6 py-4">
          <RoadmapHero stats={stats} />

          <RoadmapCurrentState />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bgCard)] border border-[var(--glassBorder)]">
              <button
                type="button"
                onClick={() => setViewMode('tiers')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'tiers'
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--foregroundSecondary)] hover:text-[var(--foreground)]'
                }`}
              >
                📋 {t('pages.roadmap.views.tiers')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'timeline'
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--foregroundSecondary)] hover:text-[var(--foreground)]'
                }`}
              >
                🗺️ {t('pages.roadmap.views.timeline')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('directory')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'directory'
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--foregroundSecondary)] hover:text-[var(--foreground)]'
                }`}
              >
                🔍 {t('pages.roadmap.views.directory')}
              </button>
            </div>

            {viewMode === 'tiers' && (
              <div className="flex items-center gap-2 pr-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExpandAllTiers}
                  className="text-xs"
                >
                  {t('pages.changelog.filters.expandAll')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedTier(null)}
                  className="text-xs"
                >
                  {t('pages.changelog.filters.collapseAll')}
                </Button>
              </div>
            )}
          </div>

          {viewMode === 'tiers' && (
            <Section variant="legal">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Typography
                    className="font-extrabold text-[var(--foreground)]"
                    variant="heading"
                    uiSize="xl"
                  >
                    {t('pages.roadmap.tiers.title')}
                  </Typography>
                </div>
                {tiers.map((tier) => (
                  <TierCard
                    key={tier.id}
                    tier={tier}
                    isExpanded={expandedTier === tier.id}
                    onToggle={() => toggleTier(tier.id)}
                  />
                ))}
              </div>
            </Section>
          )}

          {viewMode === 'timeline' && (
            <Section variant="legal">
              <div className="flex flex-col gap-4">
                <Typography
                  className="font-extrabold text-[var(--foreground)]"
                  variant="heading"
                  uiSize="xl"
                >
                  {t('pages.roadmap.timeline.title')}
                </Typography>
                <RoadmapPhaseTimeline
                  phases={phases}
                  hoveredPhase={hoveredPhase}
                  onHover={setHoveredPhase}
                />
              </div>
            </Section>
          )}

          {viewMode === 'directory' && (
            <Section variant="legal">
              <div className="flex flex-col gap-4">
                <Typography
                  className="font-extrabold text-[var(--foreground)]"
                  variant="heading"
                  uiSize="xl"
                >
                  {t('pages.roadmap.directory.title')}
                </Typography>
                <RoadmapFeaturesTable tiers={tiers} />
              </div>
            </Section>
          )}

          <Section variant="legal">
            <RoadmapLegalBanner />
          </Section>
        </div>
      </Container>
    </PageLayout>
  );
}
