'use client';

import { useState, useMemo, useCallback } from 'react';
import { PageLayout, Container, Section, EmptyState } from '@arcadeum/ui';
import type { FeatureSection, FeatureCategory } from './features-parser';
import { FeaturesHero, type FeaturesViewMode } from './components/FeaturesHero';
import { FeaturesStatsGrid } from './components/FeaturesStatsGrid';
import {
  FeaturesCategoryFilter,
  type CategoryFilterItem,
} from './components/FeaturesCategoryFilter';
import { FeaturesSectionCard } from './components/FeaturesSectionCard';
import { FeaturesMatrixView } from './components/FeaturesMatrixView';
import { FeaturesQuickNav } from './components/FeaturesQuickNav';

export type FeaturesTranslations = {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  allCategories?: string;
  sectionsCount?: string;
  itemsCount?: string;
  views?: {
    categorized?: string;
    matrix?: string;
    directory?: string;
  };
  stats?: {
    modules?: string;
    features?: string;
    games?: string;
    languages?: string;
  };
  categories?: {
    all?: string;
    games?: string;
    social?: string;
    economy?: string;
    security?: string;
    seo?: string;
    platform?: string;
  };
  highlights?: string[];
  noResults?: string;
  clearFilters?: string;
} | null;

export default function FeaturesClient({
  sections,
  t,
}: {
  sections: FeatureSection[];
  t: FeaturesTranslations;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    FeatureCategory | 'all'
  >('all');
  const [viewMode, setViewMode] = useState<FeaturesViewMode>('categorized');

  const totalFeaturesCount = useMemo(
    () => sections.reduce((sum, s) => sum + s.totalCount, 0),
    [sections],
  );

  const categoryItems = useMemo<CategoryFilterItem[]>(() => {
    const counts: Record<FeatureCategory, number> = {
      games: 0,
      social: 0,
      economy: 0,
      security: 0,
      seo: 0,
      platform: 0,
    };
    for (const section of sections) {
      counts[section.category] = (counts[section.category] ?? 0) + 1;
    }

    return [
      {
        id: 'all',
        label: t?.categories?.all ?? 'All Modules',
        icon: '✨',
        count: sections.length,
      },
      {
        id: 'games',
        label: t?.categories?.games ?? 'Games & Engine',
        icon: '🎮',
        count: counts.games,
      },
      {
        id: 'social',
        label: t?.categories?.social ?? 'Social & Competition',
        icon: '👥',
        count: counts.social,
      },
      {
        id: 'economy',
        label: t?.categories?.economy ?? 'Economy & Shop',
        icon: '💎',
        count: counts.economy,
      },
      {
        id: 'security',
        label: t?.categories?.security ?? 'Real-Time & Security',
        icon: '🛡️',
        count: counts.security,
      },
      {
        id: 'seo',
        label: t?.categories?.seo ?? 'SEO & AI Search',
        icon: '🌐',
        count: counts.seo,
      },
      {
        id: 'platform',
        label: t?.categories?.platform ?? 'Platform & Tech',
        icon: '🏗️',
        count: counts.platform,
      },
    ];
  }, [sections, t]);

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sections
      .map((section) => {
        if (
          selectedCategory !== 'all' &&
          section.category !== selectedCategory
        ) {
          return null;
        }

        if (!query) {
          return section;
        }

        const titleMatches =
          section.title.toLowerCase().includes(query) ||
          section.badge.toLowerCase().includes(query);

        const filteredSubsections = section.subsections
          .map((sub) => {
            const subTitleMatches = sub.title.toLowerCase().includes(query);
            const matchingItems = sub.items.filter((item) => {
              if (item.isTable) {
                return (
                  item.tableHeaders?.some((h) =>
                    h.toLowerCase().includes(query),
                  ) ||
                  item.tableRows?.some((row) =>
                    row.some((cell) => cell.toLowerCase().includes(query)),
                  )
                );
              }
              return item.text.toLowerCase().includes(query);
            });

            if (
              matchingItems.length === 0 &&
              !subTitleMatches &&
              !titleMatches
            ) {
              return null;
            }

            return {
              ...sub,
              items: matchingItems.length > 0 ? matchingItems : sub.items,
            };
          })
          .filter((sub): sub is NonNullable<typeof sub> => sub !== null);

        if (filteredSubsections.length === 0 && !titleMatches) {
          return null;
        }

        return {
          ...section,
          subsections:
            filteredSubsections.length > 0
              ? filteredSubsections
              : section.subsections,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }, [sections, searchQuery, selectedCategory]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
  }, []);

  const handleSelectSection = useCallback((sectionId: string) => {
    setViewMode('categorized');
    if (typeof window !== 'undefined') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  const defaultHighlights = [
    '🎮 20+ Implemented Games',
    '⚡ 100% Real-Time Socket.IO',
    '🌐 5 Locales (i18n)',
    '🧩 63+ UI Components',
    '🤖 AI-Optimized (llms.txt)',
    '🛡️ AES-GCM Encrypted',
  ];

  return (
    <PageLayout>
      <Container size="lg">
        <div className="flex flex-col gap-6 py-4 mb-8">
          <FeaturesHero
            title={t?.title ?? 'Platform Architecture & Features'}
            subtitle={
              t?.subtitle ??
              'Comprehensive overview of all 22 core modules, game engines, real-time protocols, economy systems, and multi-tenant security architecture.'
            }
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={
              t?.searchPlaceholder ??
              'Search features, games, protocols, or APIs...'
            }
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            viewsText={{
              categorized: t?.views?.categorized ?? 'Full View',
              matrix: t?.views?.matrix ?? 'Grid Matrix',
              directory: t?.views?.directory ?? 'Directory',
            }}
            highlightPills={t?.highlights ?? defaultHighlights}
          />

          <FeaturesStatsGrid
            totalSections={sections.length}
            totalFeatures={totalFeaturesCount}
            labels={{
              modules: t?.stats?.modules ?? 'Modules',
              features: t?.stats?.features ?? 'Features',
              games: t?.stats?.games ?? 'Games Live',
              languages: t?.stats?.languages ?? 'Languages',
            }}
          />

          <FeaturesCategoryFilter
            categories={categoryItems}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            filteredCount={filteredSections.length}
            totalCount={sections.length}
            onClearFilters={handleClearFilters}
            clearFiltersText={t?.clearFilters ?? 'Clear filters'}
          />

          {filteredSections.length === 0 ? (
            <Section variant="legal">
              <EmptyState
                icon="🔍"
                message={
                  t?.noResults ??
                  'No features match your current filter or search query.'
                }
                action={
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    {t?.clearFilters ?? 'Clear filters'}
                  </button>
                }
              />
            </Section>
          ) : viewMode === 'matrix' ? (
            <FeaturesMatrixView
              sections={filteredSections}
              onSelectSection={handleSelectSection}
            />
          ) : viewMode === 'directory' ? (
            <FeaturesQuickNav
              sections={filteredSections}
              onSelectSection={handleSelectSection}
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredSections.map((section) => (
                <FeaturesSectionCard
                  key={section.number}
                  section={section}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
