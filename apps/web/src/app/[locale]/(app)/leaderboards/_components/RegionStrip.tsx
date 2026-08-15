'use client';
import type { RegionDistribution } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';

const COLORS: Record<string, string> = {
  na: '#22d3ee',
  eu: '#a78bfa',
  sa: '#facc15',
  asia: '#ec4899',
  oceania: '#34d399',
  africa: '#f97316',
  me: '#94a3b8',
};

export function RegionStrip({
  regions,
  t,
}: {
  regions: RegionDistribution;
  t?: PageTranslations;
}) {
  if (!regions.length) return null;
  const tRegions = (t?.regions ?? {}) as Record<string, string | undefined>;
  const title = tRegions.title ?? 'By region';
  return (
    <div className="box-border flex flex-col items-stretch gap-3">
      <span className="box-border text-[14px] tracking-[2px] opacity-[0.7] uppercase">
        {title}
      </span>
      <div className="box-border flex flex-row items-stretch h-[14px] rounded-[7px] overflow-hidden border border-[var(--borderColor)]">
        {regions.map((r) => (
          <div
            className="box-border"
            style={{
              backgroundColor: COLORS[r.region] ?? '#94a3b8',
              width: `${r.share * 100}%`,
            }}
            key={r.region}
          />
        ))}
      </div>
      <div className="box-border flex flex-row items-stretch gap-3 flex-wrap">
        {regions.map((r) => (
          <div
            className="box-border flex flex-row items-center gap-2"
            key={r.region}
          >
            <div
              className="box-border w-[10px] h-[10px] rounded-3xl"
              style={{ backgroundColor: COLORS[r.region] ?? '#94a3b8' }}
            />
            <span className="box-border text-[14px] opacity-[0.85]">
              {tRegions[r.region] ?? r.region.toUpperCase()}
            </span>
            <span className="box-border text-[14px] opacity-[0.6] tracking-[1px]">
              {Math.round(r.share * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
