'use client';

import { Typography } from '@arcadeum/ui';
import type { FeatureSection } from '../features-parser';

type FeaturesMatrixViewProps = {
  sections: FeatureSection[];
  onSelectSection: (sectionId: string) => void;
};

export function FeaturesMatrixView({
  sections,
  onSelectSection,
}: FeaturesMatrixViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sections.map((section) => (
        <div
          key={section.number}
          onClick={() => onSelectSection(section.id)}
          className="group cursor-pointer flex flex-col justify-between p-5 rounded-2xl bg-[var(--bgCard)]/80 hover:bg-[var(--bgCard)] border border-[var(--glassBorder)] hover:border-[var(--primary)]/50 transition-all hover:scale-[1.01] hover:shadow-xl backdrop-blur-md"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl p-2 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                  {section.icon}
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--foregroundSecondary)]">
                  #{section.number}
                </span>
              </div>
              <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-1 rounded-full border border-[var(--primary)]/20">
                {section.badge}
              </span>
            </div>

            <Typography
              variant="heading"
              uiSize="md"
              className="font-extrabold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors"
            >
              {section.title}
            </Typography>

            <div className="flex flex-col gap-1.5 text-xs text-[var(--foregroundSecondary)]">
              {section.subsections.slice(0, 3).map((sub, idx) => (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--foregroundSecondary)]/40 shrink-0" />
                  <span className="truncate">
                    {sub.title || sub.items[0]?.text || 'Features'}
                  </span>
                </div>
              ))}
              {section.subsections.length > 3 && (
                <span className="text-[10px] font-semibold text-[var(--primary)]">
                  +{section.subsections.length - 3} more areas
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[var(--glassBorder)] text-xs text-[var(--foregroundSecondary)]">
            <span className="font-semibold">{section.totalCount} items</span>
            <span className="text-[var(--primary)] font-bold group-hover:translate-x-1 transition-transform">
              Explore →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
