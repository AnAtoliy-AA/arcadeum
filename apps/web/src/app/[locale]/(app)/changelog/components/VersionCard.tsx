'use client';

import { useState, useCallback } from 'react';
import { Typography } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { ChangelogEntry } from '../page';

const SECTION_COLOR_CONFIG: Record<
  string,
  { text: string; bg: string; border: string; dot: string }
> = {
  Added: {
    text: 'text-[var(--success)]',
    bg: 'bg-[var(--success)]/10',
    border: 'border-[var(--success)]/30',
    dot: 'bg-[var(--success)]',
  },
  Fixed: {
    text: 'text-[var(--info)]',
    bg: 'bg-[var(--info)]/10',
    border: 'border-[var(--info)]/30',
    dot: 'bg-[var(--info)]',
  },
  Changed: {
    text: 'text-[var(--warning)]',
    bg: 'bg-[var(--warning)]/10',
    border: 'border-[var(--warning)]/30',
    dot: 'bg-[var(--warning)]',
  },
  Deprecated: {
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    dot: 'bg-purple-400',
  },
  Removed: {
    text: 'text-[var(--destructive)]',
    bg: 'bg-[var(--destructive)]/10',
    border: 'border-[var(--destructive)]/30',
    dot: 'bg-[var(--destructive)]',
  },
  Security: {
    text: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    dot: 'bg-pink-400',
  },
  Refactored: {
    text: 'text-[var(--primary)]',
    bg: 'bg-[var(--primary)]/10',
    border: 'border-[var(--primary)]/30',
    dot: 'bg-[var(--primary)]',
  },
  Improved: {
    text: 'text-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    dot: 'bg-teal-400',
  },
  Documentation: {
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-400',
  },
};

const DEFAULT_CONFIG = {
  text: 'text-[var(--foregroundSecondary)]',
  bg: 'bg-[var(--glassBg)]',
  border: 'border-[var(--glassBorder)]',
  dot: 'bg-[var(--foregroundSecondary)]',
};

function formatItemContent(item: string) {
  const arcMatch = item.match(/(ARC-\d+)/g);
  if (!arcMatch) {
    return <span>{item}</span>;
  }

  const parts = item.split(/(ARC-\d+)/g);
  return (
    <span>
      {parts.map((part, index) => {
        if (/^ARC-\d+$/.test(part)) {
          return (
            <span
              key={index}
              className="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded font-mono text-[11px] font-semibold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/25"
            >
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
}

type VersionCardProps = {
  entry: ChangelogEntry;
  isExpanded: boolean;
  isLatest: boolean;
  onToggle: () => void;
};

export function VersionCard({
  entry,
  isExpanded,
  isLatest,
  onToggle,
}: VersionCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const totalChanges = entry.sections.reduce(
    (sum, s) => sum + s.items.length,
    0,
  );

  const handleCopyLink = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = `${window.location.origin}${window.location.pathname}#v${entry.version}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [entry.version],
  );

  return (
    <article
      id={`v${entry.version}`}
      className={`flex flex-col rounded-2xl overflow-hidden transition-all border ${
        isExpanded
          ? 'bg-[var(--glassBg)] border-[var(--primary)]/30 shadow-lg shadow-[var(--primary)]/5'
          : 'bg-[var(--glassBg)]/60 border-[var(--glassBorder)] hover:border-[var(--glassBorder)]/80'
      }`}
    >
      <header
        className="flex flex-col p-4 md:p-5 cursor-pointer select-none transition-colors active:opacity-80"
        onClick={onToggle}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3 py-1 rounded-full bg-[var(--primary)]/15 border border-[var(--primary)]/30">
              <Typography
                variant="label"
                uiSize="sm"
                className="font-bold text-[var(--primary)] font-mono"
              >
                v{entry.version}
              </Typography>
            </div>

            {entry.date && (
              <Typography variant="caption" uiSize="sm" alpha="medium">
                {entry.date}
              </Typography>
            )}

            {isLatest && (
              <div className="px-2.5 py-0.5 rounded-full bg-[var(--success)]/15 border border-[var(--success)]/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                <Typography
                  variant="label"
                  uiSize="xs"
                  className="font-bold text-[var(--success)] uppercase tracking-wider"
                >
                  {t('pages.changelog.card.latest')}
                </Typography>
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              title={t('pages.changelog.card.copyLink')}
              className="p-1 rounded-md text-[var(--foregroundSecondary)] hover:text-[var(--foreground)] hover:bg-[var(--glassBg)] text-xs transition-colors"
            >
              {copied ? '✓' : '🔗'}
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex flex-wrap items-center gap-1.5">
              {entry.sections.map((sec) => {
                const cfg = SECTION_COLOR_CONFIG[sec.type] || DEFAULT_CONFIG;
                return (
                  <span
                    key={sec.type}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                  >
                    {sec.type} {sec.items.length}
                  </span>
                );
              })}
            </div>

            <div className="px-2.5 py-0.5 rounded-full bg-[var(--bgCard)] border border-[var(--glassBorder)] shrink-0">
              <Typography variant="caption" uiSize="xs" alpha="medium">
                {totalChanges} {t('pages.changelog.card.changes')}
              </Typography>
            </div>

            <div className="w-7 h-7 rounded-full bg-[var(--glassBg)] border border-[var(--glassBorder)] flex items-center justify-center shrink-0 text-sm font-bold text-[var(--foregroundSecondary)]">
              {isExpanded ? '−' : '+'}
            </div>
          </div>
        </div>
      </header>

      {isExpanded && (
        <div className="flex flex-col border-t border-[var(--glassBorder)] p-4 md:p-6 gap-5 bg-[var(--bgCard)]/40">
          {entry.sections.map((section) => {
            const cfg = SECTION_COLOR_CONFIG[section.type] || DEFAULT_CONFIG;
            return (
              <div key={section.type} className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  <Typography
                    variant="label"
                    uiSize="sm"
                    className={`font-bold ${cfg.text}`}
                  >
                    {section.type}
                  </Typography>
                  <span className="px-2 py-0.2 text-[10px] font-medium rounded-full bg-[var(--glassBg)] border border-[var(--glassBorder)] text-[var(--foregroundSecondary)]">
                    {section.items.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2 pl-4 md:pl-5 border-l-2 border-[var(--glassBorder)] ml-1">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 group">
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 opacity-70 ${cfg.dot}`}
                      />
                      <Typography
                        variant="body"
                        uiSize="sm"
                        alpha="high"
                        className="flex-1 leading-relaxed"
                      >
                        {formatItemContent(item)}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
