'use client';

import { memo } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface BackgammonHudProps {
  p0Pip: number;
  p1Pip: number;
  p0BorneOff: number;
  p1BorneOff: number;
  pipLead: number;
  isP0: boolean;
  isFlipped: boolean;
  hasBarCheckers: boolean;
  myTurn: boolean;
  isDoubles: boolean;
  rolledVal?: number;
}

export const BackgammonHud = memo(function BackgammonHud({
  p0Pip,
  p1Pip,
  p0BorneOff,
  p1BorneOff,
  pipLead,
  isP0,
  isFlipped,
  hasBarCheckers,
  myTurn,
  isDoubles,
  rolledVal,
}: BackgammonHudProps) {
  const { t } = useTranslation();

  return (
    <div className="backgammon-hud-panel flex w-full flex-col sm:flex-row items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-md shrink-0">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-full border shadow-sm backgammon-checker-p0" />
          <span className="text-white font-bold">{p0Pip}</span>
          <span className="text-white/30 text-[10px]">vs</span>
          <span className="text-white font-bold">{p1Pip}</span>
          <div className="w-3.5 h-3.5 rounded-full border shadow-sm backgammon-checker-p1" />
        </div>

        {pipLead !== 0 && (
          <span
            className={cx(
              'text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-xs',
              pipLead > 0
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40',
            )}
          >
            {pipLead > 0 ? `+${pipLead} Lead` : `${pipLead} Behind`}
          </span>
        )}

        {hasBarCheckers && myTurn && (
          <span className="animate-pulse text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-xs">
            ⚠️ {t('games.backgammon_v1.game.barCount')}: Enter pieces
          </span>
        )}

        {isDoubles && rolledVal && (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-300 shadow-sm">
            ✨ DOUBLE {rolledVal}s
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
          <span className="text-white/60 text-[11px] font-medium">🏁 Off:</span>
          <div className="flex items-center gap-1">
            <span className="text-white font-black">{p0BorneOff}</span>
            <span className="text-white/30">-</span>
            <span className="text-white font-black">{p1BorneOff}</span>
            <span className="text-[10px] text-white/40">/ 15</span>
          </div>
        </div>

        <span className="text-[10px] text-white/50 hidden md:inline font-mono">
          {isP0
            ? 'Home: 1-6'
            : isFlipped
              ? 'Home: 19-24 (Bottom)'
              : 'Home: 19-24'}
        </span>
      </div>
    </div>
  );
});
