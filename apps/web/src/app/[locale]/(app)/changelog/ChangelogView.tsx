'use client';

import { useState, useMemo } from 'react';
import { PageLayout, Container, Typography, Section } from '@arcadeum/ui';
import type { ChangelogEntry } from './page';

const SECTION_COLORS: Record<string, string> = {
  Added: '#22c55e',
  Fixed: '#3b82f6',
  Changed: '#f59e0b',
  Deprecated: '#a855f7',
  Removed: '#ef4444',
  Security: '#ec4899',
  Refactored: '#6366f1',
  Improved: '#14b8a6',
  Documentation: '#8b5cf6',
};

function VersionCard({
  entry,
  isExpanded,
  isReleased,
  onToggle,
}: {
  entry: ChangelogEntry;
  isExpanded: boolean;
  isReleased: boolean;
  onToggle: () => void;
}) {
  const totalChanges = entry.sections.reduce(
    (sum, s) => sum + s.items.length,
    0,
  );

  return (
    <div
      className="flex flex-col items-stretch rounded-2xl overflow-hidden"
      style={{
        background: isExpanded
          ? 'rgba(255,255,255,0.03)'
          : 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: isExpanded
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(255,255,255,0.04)',
      }}
    >
      <div
        className="flex flex-col items-stretch active:opacity-[0.8] cursor-pointer p-4"
        onClick={onToggle}
      >
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-3 items-center flex-1">
            <div className="px-3 rounded-[9999px] bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)]">
              <Typography
                className={'font-bold text-[#6366f1]'}
                variant="label"
                uiSize="sm"
              >
                v{entry.version}
              </Typography>
            </div>
            {entry.date && (
              <Typography variant="caption" alpha="medium" uiSize="sm">
                {entry.date}
              </Typography>
            )}
            {isReleased && (
              <div className="px-2 py-1 rounded-[9999px] bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)]">
                <Typography
                  className={'font-bold text-[#22c55e]'}
                  variant="label"
                  uiSize="xs"
                >
                  Released
                </Typography>
              </div>
            )}
          </div>
          <div className="flex flex-row gap-2 items-center">
            <div className="px-2 rounded-[9999px] bg-[rgba(255,255,255,0.05)]">
              <Typography variant="caption" uiSize="xs" alpha="medium">
                {totalChanges} changes
              </Typography>
            </div>
            <div className="w-[28px] h-[28px] rounded-[9999px] bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
              <Typography
                className={'font-bold'}
                variant="body"
                uiSize="sm"
                alpha="medium"
              >
                {isExpanded ? '−' : '+'}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col items-stretch gap-0">
          <div className="-mx-4 border-b border-b-[rgba(255,255,255,0.06)]" />
          <div className="flex flex-col items-stretch p-4 gap-4">
            {entry.sections.map((section) => (
              <div
                className="flex flex-col items-stretch gap-2"
                key={section.type}
              >
                <div className="flex flex-row items-center gap-2">
                  <div
                    className="w-[8px] h-[8px] rounded-[9999px]"
                    style={{
                      backgroundColor:
                        SECTION_COLORS[section.type] || '#6b7280',
                    }}
                  />
                  <Typography
                    className={'font-bold'}
                    style={{ color: SECTION_COLORS[section.type] || '#6b7280' }}
                    variant="label"
                    uiSize="sm"
                  >
                    {section.type}
                  </Typography>
                  <div className="rounded-[9999px] bg-[rgba(255,255,255,0.05)]">
                    <Typography variant="caption" uiSize="xs" alpha="medium">
                      {section.items.length}
                    </Typography>
                  </div>
                </div>
                <div className="flex flex-col items-stretch pl-5">
                  {section.items.map((item, idx) => (
                    <div className="flex flex-row gap-2 items-start" key={idx}>
                      <div
                        className="w-[4px] h-[4px] rounded-[9999px] opacity-[0.4] shrink-0"
                        style={{
                          backgroundColor:
                            SECTION_COLORS[section.type] || '#6b7280',
                        }}
                      />
                      <Typography
                        className={'flex-1'}
                        variant="body"
                        uiSize="sm"
                        alpha="high"
                      >
                        {item}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChangelogView({
  entries,
}: {
  entries: ChangelogEntry[];
}) {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(
    entries[0]?.version ?? null,
  );
  const [showAll, setShowAll] = useState(false);

  const visibleEntries = useMemo(
    () => (showAll ? entries : entries.slice(0, 10)),
    [entries, showAll],
  );

  const releasedVersions = useMemo(() => {
    const released = new Set<string>();
    if (entries.length > 0) released.add(entries[0].version);
    for (let i = 1; i < entries.length; i++) {
      const [major, minor] = entries[i].version.split('.').map(Number);
      const prev = entries[i - 1];
      const [prevMajor, prevMinor] = prev.version.split('.').map(Number);
      if (major < prevMajor || minor < prevMinor) {
        released.add(entries[i].version);
      }
    }
    return released;
  }, [entries]);

  return (
    <PageLayout>
      <Container size="lg">
        <div className="flex flex-col items-stretch gap-6">
          <div
            className="flex flex-col items-stretch p-8 rounded-2xl border border-[rgba(99,102,241,0.2)] gap-3"
            style={{
              background:
                'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.15) 50%, rgba(236,72,153,0.1) 100%)',
            }}
          >
            <Typography
              className={'font-extrabold'}
              variant="heading"
              uiSize="3xl"
              gradient="primary"
            >
              Changelog
            </Typography>
            <Typography
              className={'max-w-[500px]'}
              variant="body"
              uiSize="md"
              alpha="medium"
            >
              All notable changes to Arcadeum are documented here. Follow
              Semantic Versioning.
            </Typography>
            <div className="px-3 py-1 rounded-[9999px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] self-start">
              <Typography variant="caption" uiSize="xs" alpha="medium">
                {entries.length} releases
              </Typography>
            </div>
          </div>

          <Section variant="legal">
            <div className="flex flex-col items-stretch gap-3">
              {visibleEntries.map((entry) => (
                <VersionCard
                  key={entry.version}
                  entry={entry}
                  isExpanded={expandedVersion === entry.version}
                  isReleased={releasedVersions.has(entry.version)}
                  onToggle={() =>
                    setExpandedVersion(
                      expandedVersion === entry.version ? null : entry.version,
                    )
                  }
                />
              ))}
            </div>
          </Section>

          {!showAll && entries.length > 10 && (
            <div className="flex flex-row items-stretch justify-center">
              <div
                className="px-6 py-3 rounded-xl cursor-pointer active:opacity-[0.8] bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)]"
                onClick={() => setShowAll(true)}
              >
                <Typography
                  className={'text-[#6366f1] font-semibold'}
                  variant="label"
                  uiSize="sm"
                >
                  Show all {entries.length} releases
                </Typography>
              </div>
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
