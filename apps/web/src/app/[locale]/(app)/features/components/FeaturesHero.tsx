'use client';

import { Typography } from '@arcadeum/ui';

export type FeaturesViewMode = 'categorized' | 'matrix' | 'directory';

type FeaturesHeroProps = {
  title: string;
  subtitle: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  viewMode: FeaturesViewMode;
  onViewModeChange: (mode: FeaturesViewMode) => void;
  viewsText: {
    categorized: string;
    matrix: string;
    directory: string;
  };
  highlightPills: string[];
};

export function FeaturesHero({
  title,
  subtitle,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  viewMode,
  onViewModeChange,
  viewsText,
  highlightPills,
}: FeaturesHeroProps) {
  return (
    <header className="flex flex-col p-6 sm:p-8 rounded-3xl border border-[var(--glassBorder)] bg-gradient-to-br from-[var(--primary)]/15 via-[var(--bgCard)]/80 to-[var(--glassBg)] gap-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      <div className="flex flex-col gap-3 z-10">
        <div className="flex flex-wrap items-center gap-2">
          {highlightPills.map((pill, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--bgCard)]/80 text-[var(--foregroundSecondary)] border border-[var(--glassBorder)] backdrop-blur-sm"
            >
              {pill}
            </span>
          ))}
        </div>

        <Typography
          variant="heading"
          level={1}
          uiSize="3xl"
          className="font-black tracking-tight text-[var(--foreground)]"
        >
          {title}
        </Typography>

        <Typography
          variant="body"
          uiSize="md"
          alpha="medium"
          className="max-w-3xl leading-relaxed text-[var(--foregroundSecondary)]"
        >
          {subtitle}
        </Typography>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 z-10">
        <div className="relative flex-1 max-w-2xl">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--foregroundSecondary)] pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            data-testid="features-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[var(--bgCard)]/90 border border-[var(--glassBorder)] text-sm text-[var(--foreground)] placeholder:text-[var(--foregroundSecondary)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              data-testid="features-search-clear"
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[var(--foregroundSecondary)] hover:text-[var(--foreground)] w-6 h-6 rounded-full bg-[var(--glassBg)] border border-[var(--glassBorder)] flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--bgCard)]/90 border border-[var(--glassBorder)] self-start lg:self-auto shadow-sm">
          <button
            type="button"
            data-testid="features-view-categorized"
            onClick={() => onViewModeChange('categorized')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'categorized'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-[var(--foregroundSecondary)] hover:text-[var(--foreground)] hover:bg-[var(--glassBg)]'
            }`}
          >
            📋 {viewsText.categorized}
          </button>
          <button
            type="button"
            data-testid="features-view-matrix"
            onClick={() => onViewModeChange('matrix')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'matrix'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-[var(--foregroundSecondary)] hover:text-[var(--foreground)] hover:bg-[var(--glassBg)]'
            }`}
          >
            🗂️ {viewsText.matrix}
          </button>
          <button
            type="button"
            data-testid="features-view-directory"
            onClick={() => onViewModeChange('directory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'directory'
                ? 'bg-[var(--primary)] text-white shadow-md'
                : 'text-[var(--foregroundSecondary)] hover:text-[var(--foreground)] hover:bg-[var(--glassBg)]'
            }`}
          >
            📑 {viewsText.directory}
          </button>
        </div>
      </div>
    </header>
  );
}
