'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  PageLayout,
  Container,
  Typography,
  Section,
  FilterChip,
  EmptyState,
} from '@arcadeum/ui';
import type { FeatureSection } from './features-parser';

type FeaturesTranslations = {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  allCategories?: string;
  sectionsCount?: string;
  itemsCount?: string;
} | null;

function highlightText(text: string, query: string): React.ReactNode[] {
  if (!query) return [text];
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi',
  );
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-[var(--primary)]/20 text-[var(--primary)] rounded px-0.5"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function renderBoldText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-bold text-[var(--foreground)]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        const dashIdx = part.indexOf(' — ');
        if (dashIdx >= 0) {
          return (
            <span key={i}>
              <strong className="font-bold text-[var(--foreground)]">
                {part.slice(0, dashIdx)}
              </strong>
              <span className="text-[var(--foregroundSecondary)]"> — </span>
              <span className="text-[var(--foregroundSecondary)]">
                {part.slice(dashIdx + 3)}
              </span>
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default function FeaturesClient({
  sections,
  t,
}: {
  sections: FeatureSection[];
  t: FeaturesTranslations;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const totalItems = useMemo(
    () =>
      sections.reduce(
        (sum, s) =>
          sum + s.subsections.reduce((ssum, sub) => ssum + sub.items.length, 0),
        0,
      ),
    [sections],
  );

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sections
      .map((section) => {
        let filteredSubsections = section.subsections;

        if (selectedCategory !== null && section.number !== selectedCategory) {
          return null;
        }

        if (query) {
          filteredSubsections = section.subsections
            .map((sub) => {
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
                !sub.title.toLowerCase().includes(query)
              ) {
                return null;
              }
              return {
                ...sub,
                items: matchingItems.length > 0 ? matchingItems : sub.items,
              };
            })
            .filter((sub): sub is NonNullable<typeof sub> => sub !== null);
        }

        if (filteredSubsections.length === 0) return null;

        return { ...section, subsections: filteredSubsections };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);
  }, [sections, searchQuery, selectedCategory]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory(null);
  }, []);

  const sectionCountText = t?.sectionsCount ?? '{count} sections';
  const itemsCountText = t?.itemsCount ?? '{count} features';

  return (
    <PageLayout>
      <Container size="lg">
        <div className="flex flex-col gap-6 py-4 mb-4">
          <header className="flex flex-col p-6 md:p-8 rounded-2xl border border-[var(--success)]/20 bg-gradient-to-br from-[var(--success)]/15 via-emerald-500/10 to-teal-500/5 gap-4 backdrop-blur-md">
            <div className="flex flex-col gap-2">
              <Typography
                variant="heading"
                level={1}
                uiSize="3xl"
                className="font-extrabold tracking-tight text-[var(--foreground)]"
              >
                {t?.title ?? 'Platform Features'}
              </Typography>
              <Typography
                variant="body"
                uiSize="md"
                alpha="medium"
                className="max-w-2xl leading-relaxed"
              >
                {t?.subtitle ??
                  'Everything built into Arcadeum — games, social, economy, security, and more.'}
              </Typography>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-[var(--bgCard)]/80 border border-[var(--glassBorder)]">
                <Typography variant="caption" uiSize="xs" alpha="high">
                  {sectionCountText.replace('{count}', String(sections.length))}
                </Typography>
              </div>
              <div className="px-3 py-1 rounded-full bg-[var(--bgCard)]/80 border border-[var(--glassBorder)]">
                <Typography variant="caption" uiSize="xs" alpha="high">
                  {itemsCountText.replace('{count}', String(totalItems))}
                </Typography>
              </div>
            </div>
          </header>

          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md">
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--foregroundSecondary)] pointer-events-none">
                🔍
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={t?.searchPlaceholder ?? 'Search features...'}
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
                active={selectedCategory === null}
                onClick={() => setSelectedCategory(null)}
              >
                {t?.allCategories ?? 'All'} ({sections.length})
              </FilterChip>
              {sections.map((section) => (
                <FilterChip
                  key={section.number}
                  active={selectedCategory === section.number}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === section.number
                        ? null
                        : section.number,
                    )
                  }
                >
                  {section.number}. {section.title}
                </FilterChip>
              ))}
            </div>

            {(searchQuery || selectedCategory !== null) && (
              <div className="flex items-center gap-2 pt-2 border-t border-[var(--glassBorder)]">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
                >
                  {t?.allCategories ?? 'Clear filters'}
                </button>
                <Typography variant="caption" uiSize="xs" alpha="medium">
                  {filteredSections.length} of {sections.length} sections
                </Typography>
              </div>
            )}
          </div>

          {filteredSections.length === 0 ? (
            <Section variant="legal">
              <EmptyState
                icon="🔍"
                message="No features match your search."
                action={
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Clear filters
                  </button>
                }
              />
            </Section>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredSections.map((section) => (
                <Section key={section.number} variant="legal">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--success)]/15 border border-[var(--success)]/25 flex items-center justify-center shrink-0 text-lg font-bold text-[var(--success)]">
                        {section.number}
                      </div>
                      <Typography
                        variant="heading"
                        uiSize="lg"
                        className="font-extrabold text-[var(--foreground)]"
                      >
                        {section.title}
                      </Typography>
                    </div>

                    {section.subsections.map((sub, subIdx) => (
                      <div
                        key={`${section.number}-${subIdx}`}
                        className="flex flex-col gap-2 p-4 rounded-xl bg-[var(--glassBg)] border border-[var(--glassBorder)]"
                      >
                        {sub.title && (
                          <Typography
                            variant="label"
                            uiSize="sm"
                            className="font-bold text-[var(--foreground)]"
                          >
                            {sub.title}
                          </Typography>
                        )}

                        {sub.items.map((item, itemIdx) => {
                          if (
                            item.isTable &&
                            item.tableHeaders &&
                            item.tableRows
                          ) {
                            return (
                              <div
                                key={itemIdx}
                                className="overflow-x-auto rounded-lg border border-[var(--glassBorder)]"
                              >
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-[var(--glassBorder)] bg-[var(--bgCard)]/50">
                                      {item.tableHeaders.map((h, hi) => (
                                        <th
                                          key={hi}
                                          className="px-3 py-2 text-left font-semibold text-[var(--foreground)] whitespace-nowrap"
                                        >
                                          {highlightText(h, searchQuery)}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {item.tableRows.map((row, ri) => (
                                      <tr
                                        key={ri}
                                        className="border-b border-[var(--glassBorder)]/50 last:border-0"
                                      >
                                        {row.map((cell, ci) => (
                                          <td
                                            key={ci}
                                            className="px-3 py-2 text-[var(--foregroundSecondary)] whitespace-nowrap"
                                          >
                                            {highlightText(cell, searchQuery)}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={itemIdx}
                              className="flex items-start gap-2 py-1"
                            >
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--success)] shrink-0" />
                              <Typography
                                variant="body"
                                uiSize="sm"
                                alpha="medium"
                                className="leading-relaxed"
                              >
                                {renderBoldText(item.text)}
                              </Typography>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </Section>
              ))}
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
