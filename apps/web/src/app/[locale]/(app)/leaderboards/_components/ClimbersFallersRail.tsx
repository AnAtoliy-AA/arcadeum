'use client';
import { useRouter } from 'next/navigation';
import { useRoutes } from '@/shared/config/useRoutes';
import { DeltaChip } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
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
    <div className="flex flex-row items-stretch gap-4 flex-wrap">
      <Column
        title={(t?.climbers as { title?: string })?.title ?? 'Top climbers'}
        rows={climbers}
        accent="var(--success)"
      />
      <Column
        title={(t?.fallers as { title?: string })?.title ?? 'Biggest drops'}
        rows={fallers}
        accent="var(--danger)"
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
  accent: 'var(--success)' | 'var(--danger)';
}) {
  const router = useRouter();
  const routes = useRoutes();

  return (
    <div
      className={cx(
        'flex flex-col items-stretch flex-1 min-w-[280px] gap-3 p-4 rounded-2xl border border-t-[2px] border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)]',
        accent === 'var(--success)'
          ? 'border-t-[var(--success)]'
          : 'border-t-[var(--danger)]',
      )}
    >
      <span className="text-[14px] tracking-[2px] opacity-[0.9] uppercase">
        {title}
      </span>
      <div className="flex flex-col items-stretch gap-2">
        {rows.map(({ player, fromRank, toRank }) => (
          <button
            type="button"
            className="flex flex-row items-center justify-between gap-3 hover:bg-[rgba(255,255,255,0.04)] px-2 py-1 -mx-2 rounded-lg transition-colors text-left cursor-pointer"
            key={player.id}
            onClick={() => router.push(routes.playerProfile(player.id))}
          >
            <span
              className="font-semibold break-words flex-1"
              title={player.name}
            >
              {player.name}
            </span>
            <DeltaChip from={fromRank} to={toRank} />
          </button>
        ))}
      </div>
    </div>
  );
}
