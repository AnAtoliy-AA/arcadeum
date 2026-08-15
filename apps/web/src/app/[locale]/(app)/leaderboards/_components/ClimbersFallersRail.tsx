'use client';
import { DeltaChip } from '@arcadeum/ui';
import type { ClimberFaller } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

export function ClimbersFallersRail({
  climbers,
  fallers,
  t,
}: {
  climbers: ClimberFaller[];
  fallers: ClimberFaller[];
  t?: PageTranslations;
}) {
  return (
    <div className="box-border flex flex-row items-stretch gap-4 flex-wrap">
      <Column
        title={(t?.climbers as { title?: string })?.title ?? 'Top climbers'}
        rows={climbers}
        accent="$success"
      />
      <Column
        title={(t?.fallers as { title?: string })?.title ?? 'Biggest drops'}
        rows={fallers}
        accent="$danger"
      />
    </div>
  );
}

function Column({
  title,
  rows,
  accent,
}: {
  title: string;
  rows: ClimberFaller[];
  accent: '$success' | '$danger';
}) {
  return (
    <div
      className="box-border flex flex-col items-stretch flex-1 min-w-[280px] gap-3 p-4 rounded-2xl border border-t-[2px] border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)]"
      style={{
        borderTopColor: accent.startsWith('$')
          ? `var(--${accent.slice(1)})`
          : accent,
      }}
    >
      <span className="box-border text-[14px] tracking-[2px] opacity-[0.7] uppercase">
        {title}
      </span>
      <div className="box-border flex flex-col items-stretch gap-2">
        {rows.map(({ player, fromRank, toRank }) => (
          <div
            className="box-border flex flex-row items-center justify-between gap-3"
            key={player.id}
          >
            <span className="box-border font-semibold line-clamp-1 flex-1">
              {player.name}
            </span>
            <DeltaChip from={fromRank} to={toRank} />
          </div>
        ))}
      </div>
    </div>
  );
}
