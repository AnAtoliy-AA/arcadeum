'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  PageLayout,
  Container,
  Typography,
  Section,
  Button,
  EmptyState,
  InfiniteScroll,
} from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { ChangelogEntry } from './page';
import { ChangelogStats } from './components/ChangelogStats';
import { ChangelogFilters } from './components/ChangelogFilters';
import { VersionCard } from './components/VersionCard';

const PAGE_SIZE = 25;

export default function ChangelogView({
  entries,
}: {
  entries: ChangelogEntry[];
}) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    () => new Set(entries.slice(0, 1).map((e) => e.version)),
  );
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of entries) {
      for (const sec of entry.sections) {
        counts.set(sec.type, (counts.get(sec.type) || 0) + sec.items.length);
      }
    }
    return Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [entries]);

  const totalChanges = useMemo(
    () =>
      entries.reduce(
        (sum, e) =>
          sum + e.sections.reduce((sSum, s) => sSum + s.items.length, 0),
        0,
      ),
    [entries],
  );

  const minorReleasesCount = useMemo(() => {
    const latest = entries[0]?.version ?? '1.26.0';
    const parts = latest.split('.');
    return parseInt(parts[1], 10) || 0;
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return entries
      .map((entry) => {
        let matchingSections = entry.sections;

        if (selectedCategory) {
          matchingSections = matchingSections.filter(
            (sec) => sec.type.toLowerCase() === selectedCategory.toLowerCase(),
          );
        }

        if (query) {
          const versionMatches = entry.version.toLowerCase().includes(query);
          const dateMatches = entry.date.toLowerCase().includes(query);

          if (!versionMatches && !dateMatches) {
            matchingSections = matchingSections
              .map((sec) => ({
                ...sec,
                items: sec.items.filter((item) =>
                  item.toLowerCase().includes(query),
                ),
              }))
              .filter((sec) => sec.items.length > 0);
          }
        }

        if (matchingSections.length === 0) return null;

        return {
          ...entry,
          sections: matchingSections,
        };
      })
      .filter((e): e is ChangelogEntry => e !== null);
  }, [entries, searchQuery, selectedCategory]);

  const visibleEntries = useMemo(
    () => filteredEntries.slice(0, displayLimit),
    [filteredEntries, displayLimit],
  );

  const handleToggle = useCallback((version: string) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    setExpandedVersions(new Set(filteredEntries.map((e) => e.version)));
  }, [filteredEntries]);

  const handleCollapseAll = useCallback(() => {
    setExpandedVersions(new Set());
  }, []);

  const handleSearchChange = useCallback(
    (q: string) => {
      setSearchQuery(q);
      setDisplayLimit(PAGE_SIZE);
      if (q.trim()) {
        const query = q.trim().toLowerCase();
        const matching = entries
          .filter((e) => {
            return (
              e.version.toLowerCase().includes(query) ||
              e.date.toLowerCase().includes(query) ||
              e.sections.some((s) =>
                s.items.some((item) => item.toLowerCase().includes(query)),
              )
            );
          })
          .map((e) => e.version);
        setExpandedVersions(new Set(matching));
      }
    },
    [entries],
  );

  const handleSelectCategory = useCallback(
    (category: string | null) => {
      setSelectedCategory(category);
      setDisplayLimit(PAGE_SIZE);
      if (category) {
        const matching = entries
          .filter((e) =>
            e.sections.some(
              (s) => s.type.toLowerCase() === category.toLowerCase(),
            ),
          )
          .map((e) => e.version);
        setExpandedVersions(new Set(matching));
      }
    },
    [entries],
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
    setDisplayLimit(PAGE_SIZE);
    setExpandedVersions(new Set(entries.slice(0, 1).map((e) => e.version)));
  }, [entries]);

  const handleLoadMore = useCallback(() => {
    setDisplayLimit((prev) => prev + PAGE_SIZE);
  }, []);

  const latestVersion = entries[0]?.version ?? '1.0.0';
  const lastUpdated = entries[0]?.date ?? '';

  return (
    <PageLayout>
      <Container size="lg">
        <div className="flex flex-col gap-6 py-4 mb-4">
          <header className="flex flex-col p-6 md:p-8 rounded-2xl border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/15 via-purple-500/10 to-pink-500/5 gap-4 backdrop-blur-md">
            <div className="flex flex-col gap-2">
              <Typography
                variant="heading"
                level={1}
                uiSize="3xl"
                gradient="primary"
                className="font-extrabold tracking-tight"
              >
                {t('pages.changelog.title')}
              </Typography>
              <Typography
                variant="body"
                uiSize="md"
                alpha="medium"
                className="max-w-2xl leading-relaxed"
              >
                {t('pages.changelog.subtitle')}
              </Typography>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-[var(--bgCard)]/80 border border-[var(--glassBorder)]">
                <Typography variant="caption" uiSize="xs" alpha="high">
                  {t('pages.changelog.stats.versionsCount', {
                    count: entries.length,
                  })}
                </Typography>
              </div>
              <div className="px-3 py-1 rounded-full bg-[var(--bgCard)]/80 border border-[var(--glassBorder)]">
                <Typography variant="caption" uiSize="xs" alpha="high">
                  {t('pages.changelog.stats.releasesCount', {
                    count: minorReleasesCount,
                  })}
                </Typography>
              </div>
              <div className="px-3 py-1 rounded-full bg-[var(--bgCard)]/80 border border-[var(--glassBorder)]">
                <Typography variant="caption" uiSize="xs" alpha="high">
                  {t('pages.changelog.stats.changesCount', {
                    count: totalChanges,
                  })}
                </Typography>
              </div>
            </div>
          </header>

          <ChangelogStats
            totalVersions={entries.length}
            minorReleasesCount={minorReleasesCount}
            totalChanges={totalChanges}
            latestVersion={latestVersion}
            lastUpdated={lastUpdated}
          />

          <ChangelogFilters
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            categories={categories}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
            filteredCount={filteredEntries.length}
            totalCount={entries.length}
            onClearFilters={handleClearFilters}
          />

          <Section variant="legal">
            {filteredEntries.length === 0 ? (
              <EmptyState
                icon="🔍"
                message={t('pages.changelog.empty.description')}
                action={
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    {t('pages.changelog.empty.resetButton')}
                  </Button>
                }
              />
            ) : (
              <div className="max-h-[750px] overflow-y-auto pr-2 rounded-2xl border border-[var(--glassBorder)] bg-[var(--bgCard)]/20 p-2 sm:p-3">
                <InfiniteScroll
                  hasMore={displayLimit < filteredEntries.length}
                  onLoadMore={handleLoadMore}
                  loadMoreText={t('pages.changelog.loadMore.loadMoreText')}
                  allLoadedText={t('pages.changelog.loadMore.allLoadedText')}
                >
                  <div className="flex flex-col gap-3 w-full">
                    {visibleEntries.map((entry) => (
                      <VersionCard
                        key={entry.version}
                        entry={entry}
                        isExpanded={expandedVersions.has(entry.version)}
                        isLatest={entry.version === latestVersion}
                        onToggle={() => handleToggle(entry.version)}
                      />
                    ))}
                  </div>
                </InfiniteScroll>
              </div>
            )}
          </Section>
        </div>
      </Container>
    </PageLayout>
  );
}
