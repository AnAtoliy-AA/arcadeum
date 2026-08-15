'use client';
import type { Squad } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import { useLanguage } from '@/shared/i18n/context';
import { formatNumber } from '@/shared/i18n/formatters';

export function SquadStrip({
  squads,
  t,
}: {
  squads: Squad[];
  t?: PageTranslations;
}) {
  const { locale } = useLanguage();
  if (!squads.length) return null;
  const tt = (t?.squads ?? {}) as { title?: string; members?: string };
  const membersTpl = tt.members ?? '{count} members';
  return (
    <div className="flex flex-col items-stretch gap-3 p-4 rounded-2xl border border-t-[2px] border-t-[var(--info)] border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)] flex-1 min-w-[280px]">
      <span className="text-[14px] tracking-[2px] opacity-[0.7] uppercase">
        {tt.title ?? 'Top squads'}
      </span>
      <div className="flex flex-col items-stretch gap-2">
        {squads.map((s) => (
          <div
            className="flex flex-row items-center gap-2 justify-between"
            style={{
              paddingLeft: s.isYou ? 8 : 0,
              paddingRight: s.isYou ? 8 : 0,
              paddingTop: s.isYou ? 4 : 0,
              paddingBottom: s.isYou ? 4 : 0,
              borderRadius: s.isYou ? 8 : 0,
              backgroundColor: s.isYou
                ? 'rgba(236,72,153,0.08)'
                : 'transparent',
            }}
            key={s.id}
          >
            <div className="flex flex-row items-center gap-2 flex-1">
              {s.isYou ? (
                <div className="px-6 py-1 rounded-[999px] bg-[var(--mythicAccent)]">
                  <span className="text-[40px] font-extrabold text-[#0f0c19]">
                    YOU
                  </span>
                </div>
              ) : null}
              <span className="font-bold tracking-[1px] text-[var(--mythicAccent)]">
                [{s.tag}]
              </span>
              <span className="font-semibold line-clamp-1 flex-1">
                {s.name}
              </span>
            </div>
            <span className="text-[14px] opacity-[0.7]">
              {membersTpl.replace('{count}', String(s.memberCount))}
            </span>
            <span className="text-[14px] tracking-[1px] font-bold">
              #{s.rank}
            </span>
            <span className="text-[14px] tracking-[1px] opacity-[0.85]">
              {formatNumber(s.rating, locale)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
