'use client';

import { Typography } from '@arcadeum/ui';
import type { FeatureSection } from '../features-parser';

type FeaturesQuickNavProps = {
  sections: FeatureSection[];
  onSelectSection: (sectionId: string) => void;
};

export function FeaturesQuickNav({
  sections,
  onSelectSection,
}: FeaturesQuickNavProps) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-3xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-xl">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--glassBorder)]">
        <Typography
          variant="heading"
          uiSize="md"
          className="font-extrabold text-[var(--foreground)]"
        >
          📑 Directory Index
        </Typography>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--bgCard)] text-[var(--primary)] border border-[var(--glassBorder)]">
          {sections.length} Sections
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {sections.map((section) => (
          <button
            key={section.number}
            type="button"
            onClick={() => onSelectSection(section.id)}
            className="flex items-center justify-between p-3 rounded-xl bg-[var(--bgCard)]/70 hover:bg-[var(--bgCard)] border border-[var(--glassBorder)] hover:border-[var(--primary)]/40 transition-all text-left group"
          >
            <div className="flex items-center gap-3 truncate pr-2">
              <span className="text-lg">{section.icon}</span>
              <span className="text-xs font-black text-[var(--foregroundSecondary)]">
                #{section.number}
              </span>
              <span className="text-sm font-bold text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                {section.title}
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--foregroundSecondary)] shrink-0">
              {section.totalCount}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
