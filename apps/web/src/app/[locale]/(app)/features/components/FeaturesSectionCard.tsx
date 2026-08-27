'use client';

import { useState } from 'react';
import { Typography, Section } from '@arcadeum/ui';
import type { FeatureSection } from '../features-parser';

type FeaturesSectionCardProps = {
  section: FeatureSection;
  searchQuery: string;
};

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
        className="bg-[var(--primary)]/25 text-[var(--primary)] rounded px-1 font-semibold"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function renderBoldText(text: string, searchQuery: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const raw = part.slice(2, -2);
          return (
            <strong key={i} className="font-bold text-[var(--foreground)]">
              {highlightText(raw, searchQuery)}
            </strong>
          );
        }
        const dashIdx = part.indexOf(' — ');
        if (dashIdx >= 0) {
          return (
            <span key={i}>
              <strong className="font-bold text-[var(--foreground)]">
                {highlightText(part.slice(0, dashIdx), searchQuery)}
              </strong>
              <span className="text-[var(--foregroundSecondary)]"> — </span>
              <span className="text-[var(--foregroundSecondary)]">
                {highlightText(part.slice(dashIdx + 3), searchQuery)}
              </span>
            </span>
          );
        }
        return <span key={i}>{highlightText(part, searchQuery)}</span>;
      })}
    </>
  );
}

export function FeaturesSectionCard({
  section,
  searchQuery,
}: FeaturesSectionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}#${section.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id={section.id} className="scroll-mt-6">
      <Section variant="legal">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--glassBorder)]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center shrink-0 text-xl font-black text-[var(--primary)] shadow-sm">
                {section.icon}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Typography
                    variant="heading"
                    uiSize="lg"
                    className="font-extrabold text-[var(--foreground)] tracking-tight"
                  >
                    {section.number}.{' '}
                    {highlightText(section.title, searchQuery)}
                  </Typography>
                </div>
                <Typography
                  variant="caption"
                  uiSize="xs"
                  alpha="medium"
                  className="text-[var(--foregroundSecondary)]"
                >
                  {section.totalCount} feature items
                </Typography>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--bgCard)]/80 text-[var(--primary)] border border-[var(--glassBorder)]">
                {section.badge}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy anchor link"
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--bgCard)] hover:bg-[var(--glassBg)] text-[var(--foregroundSecondary)] hover:text-[var(--foreground)] border border-[var(--glassBorder)] transition-colors"
              >
                {copied ? '✓ Copied' : '🔗 Link'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {section.subsections.map((sub, subIdx) => (
              <div
                key={`${section.number}-${subIdx}`}
                className="flex flex-col gap-2.5 p-4 rounded-2xl bg-[var(--glassBg)] border border-[var(--glassBorder)] backdrop-blur-md"
              >
                {sub.title && (
                  <div className="flex items-center gap-2 pb-1.5 border-b border-[var(--glassBorder)]/50">
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                    <Typography
                      variant="label"
                      uiSize="sm"
                      className="font-bold text-[var(--foreground)]"
                    >
                      {highlightText(sub.title, searchQuery)}
                    </Typography>
                  </div>
                )}

                {sub.items.map((item, itemIdx) => {
                  if (item.isTable && item.tableHeaders && item.tableRows) {
                    return (
                      <div
                        key={itemIdx}
                        className="overflow-x-auto rounded-xl border border-[var(--glassBorder)] bg-[var(--bgCard)]/40 shadow-inner mt-1"
                      >
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-[var(--glassBorder)] bg-[var(--bgCard)]/70">
                              {item.tableHeaders.map((h, hi) => (
                                <th
                                  key={hi}
                                  className="px-3.5 py-2.5 text-left font-bold text-[var(--foreground)] whitespace-nowrap"
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
                                className="border-b border-[var(--glassBorder)]/40 last:border-0 hover:bg-[var(--glassBg)] transition-colors"
                              >
                                {row.map((cell, ci) => (
                                  <td
                                    key={ci}
                                    className="px-3.5 py-2 text-[var(--foregroundSecondary)] whitespace-nowrap"
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
                      className="flex items-start gap-2.5 py-1 text-sm"
                    >
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                      <div className="leading-relaxed">
                        {renderBoldText(item.text, searchQuery)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
