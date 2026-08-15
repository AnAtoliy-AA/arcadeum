'use client';
import { CountdownClock, LiveChip } from '@arcadeum/ui';
import type { CupSnapshot } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import { useLanguage } from '@/shared/i18n/context';
import { formatCurrency, formatNumber } from '@/shared/i18n/formatters';

// Temporary: tournaments aren't live yet. Flip to `true` to render the
// real cup UI (prize pool / countdown / qualified pills) defined below.
const TOURNAMENTS_ENABLED = false;

export function CupCountdown({
  cup,
  t,
}: {
  cup: CupSnapshot | null;
  t?: PageTranslations;
}) {
  const tt = (t?.cup ?? {}) as Record<string, string>;
  const { locale } = useLanguage();

  if (!TOURNAMENTS_ENABLED) {
    return (
      <div
        className="flex flex-col gap-3 p-5 rounded-2xl border border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)] items-center"
        data-testid="cup-coming-soon"
      >
        <span className="text-[12px] tracking-[2px] opacity-[0.7] uppercase">
          {tt.eyebrow ?? 'Tournament'}
        </span>
        <span className="text-[32px] font-extrabold text-[var(--mythicAccent)] text-center">
          {tt.comingSoon ?? 'Coming soon'}
        </span>
        <span className="text-[16px] opacity-[0.75] text-center max-w-[520px]">
          {tt.comingSoonBody ??
            'Live tournaments and prize pools are coming soon.'}
        </span>
      </div>
    );
  }

  if (!cup) return null;
  const qualified = cup.qualified ?? [];
  const visiblePills = qualified.slice(0, 8);
  const overflow = Math.max(0, qualified.length - visiblePills.length);
  return (
    <div className="flex flex-col items-stretch gap-4 p-4 rounded-2xl border border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)]">
      <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col items-stretch gap-2 flex-1 min-w-[220px]">
          <div className="flex flex-row gap-3 items-center">
            <LiveChip label={(t?.live as string) ?? 'Live'} />
            <span className="text-[14px] tracking-[2px] opacity-[0.7] uppercase">
              {tt.eyebrow ?? 'Tournament'}
            </span>
          </div>
          <span className="text-[32px] font-extrabold">
            {tt.title ?? cup.title}
          </span>
          <div className="flex flex-row items-stretch gap-5 flex-wrap">
            <Stat
              label={tt.prizePool ?? 'Prize pool'}
              value={formatCurrency(cup.prizePoolUSD, locale, 'USD', {
                maximumFractionDigits: 0,
              })}
              accent
            />
            <Stat
              label={tt.participants ?? 'Participants'}
              value={formatNumber(cup.participantCount, locale)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span className="text-[14px] opacity-[0.7] uppercase">
            {tt.endsIn ?? 'Ends in'}
          </span>
          <CountdownClock
            targetIso={cup.endsAt}
            data-testid="cup-countdown-seconds"
          />
        </div>
      </div>

      {visiblePills.length > 0 ? (
        <div className="flex flex-col items-stretch gap-2">
          <span className="text-[12px] tracking-[2px] opacity-[0.6] uppercase">
            {tt.qualifiedLabel ?? 'Qualified'}
          </span>
          <div className="flex flex-row items-stretch gap-6 flex-wrap">
            {visiblePills.map((p) => (
              <div
                className="w-[28px] h-[28px] rounded-[14px] border border-[var(--borderColor)] items-center justify-center"
                style={{
                  background: 'linear-gradient(180deg,#22d3ee,#6366f1)',
                }}
                key={p.id}
                aria-label={p.name}
              >
                <span className="text-[11px] font-bold text-[#ffffff]">
                  {p.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            ))}
            {overflow > 0 ? (
              <div className="w-[28px] h-[28px] rounded-[14px] border border-[var(--borderColor)] items-center justify-center bg-[rgba(255,255,255,0.04)]">
                <span className="text-[11px] opacity-[0.7]">+{overflow}</span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col items-stretch">
      <span className="text-[12px] opacity-[0.6] uppercase">{label}</span>
      <span
        className="text-[20px] font-bold tracking-[1px]"
        style={{
          color: accent ? 'var(--mythicAccent)' : 'transparent',
        }}
      >
        {value}
      </span>
    </div>
  );
}
